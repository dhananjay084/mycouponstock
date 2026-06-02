import Subscriber from "../Models/subscribeModel.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const getTransporter = () => {
  const service = process.env.MAIL_SERVICE || "Gmail";
  const user = process.env.MAIL_USER || process.env.SMTP_EMAIL || "";
  const pass = process.env.MAIL_PASS || process.env.SMTP_PASSWORD || "";

  if (user && pass) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  }

  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL || "";
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "";
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";

  if (host && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user: smtpUser, pass: smtpPass },
    });
  }

  return null;
};

const buildFromAddress = () => {
  const explicitFrom = String(process.env.MAIL_FROM || "").trim();
  if (explicitFrom) return explicitFrom;

  const senderEmail =
    process.env.MAIL_USER ||
    process.env.SMTP_USER ||
    process.env.SMTP_EMAIL ||
    "";

  return senderEmail ? `"MyCouponStock" <${senderEmail}>` : "";
};

const normalizeEmail = (value = "") => String(value || "").trim().toLowerCase();
const isValidEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const BRAND_PURPLE = "#5f2eb3";

const escapeHtml = (value = "") =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const titleCaseWords = (value = "") =>
  String(value || "")
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const getDisplayNameFromEmail = (email = "") => {
  const localPart = String(email || "").split("@")[0] || "";
  return titleCaseWords(localPart) || "there";
};

const sanitizeBaseUrl = (value = "") => String(value || "").trim().replace(/\/$/, "");

const isPublicHttpUrl = (value = "") => {
  try {
    const url = new URL(value);
    const hostname = String(url.hostname || "").toLowerCase();
    if (!["http:", "https:"].includes(url.protocol)) return false;
    return hostname !== "localhost" && hostname !== "127.0.0.1";
  } catch {
    return false;
  }
};

const getRequestBaseUrl = (req) => {
  const forwardedProto = String(req.get("x-forwarded-proto") || req.protocol || "https")
    .split(",")[0]
    .trim();
  const protocol = forwardedProto || "https";
  return `${protocol}://${req.get("host")}`;
};

const getBaseServerUrl = (req) => {
  const siteUrl = sanitizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (isPublicHttpUrl(siteUrl)) return siteUrl;

  const requestBase = sanitizeBaseUrl(getRequestBaseUrl(req));
  if (isPublicHttpUrl(requestBase)) return requestBase;

  const configuredServerUrl = sanitizeBaseUrl(
    process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL
  );
  if (configuredServerUrl) return configuredServerUrl;

  return requestBase;
};

const buildUnsubscribeToken = (email) =>
  jwt.sign({ email, purpose: "newsletter-unsubscribe" }, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });

const verifyUnsubscribeToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded?.email || decoded?.purpose !== "newsletter-unsubscribe") {
    throw new Error("Invalid unsubscribe token");
  }
  return normalizeEmail(decoded.email);
};

const buildUnsubscribeUrl = (req, email) => {
  const token = buildUnsubscribeToken(email);
  return `${getBaseServerUrl(req)}/api/unsubscribe?token=${encodeURIComponent(token)}`;
};

const buildSubscriptionEmailHtml = ({ email, unsubscribeUrl }) => {
  const displayName = escapeHtml(getDisplayNameFromEmail(email));
  const exploreUrl = "https://mycouponstock.com";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to MyCouponStock</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f3f0fb;font-family:Arial,Helvetica,sans-serif;color:#303030;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f3f0fb;margin:0;padding:0;">
          <tr>
            <td align="center" style="padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="820" style="width:100%;max-width:820px;background-color:#ffffff;">
                <tr>
                  <td align="center" style="background-color:${BRAND_PURPLE};padding:16px 20px;">
                    <div style="color:#ffffff;font-size:32px;line-height:1.2;font-weight:800;letter-spacing:1px;text-transform:uppercase;">
                      MY COUPON STOCK
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:54px 40px 28px 40px;">
                    <p style="margin:0 0 42px 0;font-size:18px;line-height:1.6;color:#454545;">Hello ${displayName},</p>

                    <p style="margin:0 0 28px 0;font-size:24px;line-height:1.45;color:#2e2e2e;font-weight:800;">
                      Welcome to MyCouponStock - Your Trusted Source for Verified Coupons &amp; Deals!!
                    </p>

                    <p style="margin:0 0 30px 0;font-size:18px;line-height:1.7;color:#525252;">
                      Save more on every online purchase with handpicked, verified promo codes, coupons, and exclusive deals from top brands. At MyCouponStock, we make sure you never miss a chance to reduce your cart value with working offers.
                    </p>

                    <p style="margin:0 0 10px 0;font-size:18px;line-height:1.6;color:#333333;font-weight:800;">How to Save with MyCouponStock?.</p>
                    <p style="margin:0 0 4px 0;font-size:18px;line-height:1.6;color:#444444;">1. Browse Deals or Search Your Favorite Store</p>
                    <p style="margin:0 0 4px 0;font-size:18px;line-height:1.6;color:#444444;">2. Click on “Get Deal” or “Show Coupon Code.”</p>
                    <p style="margin:0 0 4px 0;font-size:18px;line-height:1.6;color:#444444;">3. Apply the Code or Shop Directly</p>
                    <p style="margin:0 0 28px 0;font-size:18px;line-height:1.6;color:#444444;">4. Enjoy Instant Savings!</p>

                    <p style="margin:0 0 28px 0;font-size:18px;line-height:1.7;color:#4c4c4c;">
                      Thanks for subscribing to the MyCouponStock newsletter!
                    </p>

                    <p style="margin:0 0 36px 0;font-size:18px;line-height:1.7;color:#4c4c4c;">
                      Follow Us :
                      <a href="https://www.instagram.com/" style="color:#356ad8;font-weight:700;text-decoration:underline;">Instagram</a>
                      &nbsp;|&nbsp;
                      <a href="https://www.facebook.com/" style="color:#356ad8;font-weight:700;text-decoration:underline;">Facebook</a>
                      &nbsp;|&nbsp;
                      <a href="https://www.linkedin.com/" style="color:#356ad8;font-weight:700;text-decoration:underline;">Linkedin</a>
                    </p>

                    <p style="margin:0 0 8px 0;font-size:18px;line-height:1.6;color:#4c4c4c;">Warm regards,</p>
                    <p style="margin:0 0 22px 0;font-size:18px;line-height:1.6;color:#4c4c4c;font-weight:700;">Team MyCouponStock</p>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #ece8f7;">
                      <tr>
                        <td style="padding-top:16px;font-size:14px;line-height:1.6;color:#7a7a7a;">
                          Don’t want these emails anymore?
                          <a href="${unsubscribeUrl}" style="color:#356ad8;font-weight:700;text-decoration:underline;">Unsubscribe here</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="background-color:${BRAND_PURPLE};padding:20px 24px 28px 24px;color:#ffffff;">
                    <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;font-weight:700;color:#ffffff;">
                      Boost your savings with MyCouponStock's Smart Assistant – find better coupons and deals instantly and save up to 8x more on every purchase.
                    </p>

                    <p style="margin:0 0 24px 0;font-size:30px;line-height:1;letter-spacing:8px;">🇺🇸 🇬🇧 🇩🇪 🇫🇷 🇪🇸 🇮🇳 🇵🇹</p>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td align="center" style="border:2px solid #ffffff;border-radius:8px;">
                          <a href="${exploreUrl}" style="display:inline-block;padding:14px 26px;font-size:18px;line-height:1.2;font-weight:700;color:#ffffff;text-decoration:none;">
                            Explore Deals on MyCouponStock
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="background-color:#111111;padding:16px 20px;font-size:13px;line-height:1.6;color:#ffffff;">
                    Address: 1, Plot, Coworkkeys, Golf Crse Rd, Saraswati Kunj, Suncity, Sector 54, Gurugram, Haryana 122011
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

const buildSubscriptionEmailText = ({ email, unsubscribeUrl }) => {
  const displayName = getDisplayNameFromEmail(email);

  return `Hello ${displayName},

Welcome to MyCouponStock - Your Trusted Source for Verified Coupons & Deals!!

Save more on every online purchase with handpicked, verified promo codes, coupons, and exclusive deals from top brands. At MyCouponStock, we make sure you never miss a chance to reduce your cart value with working offers.

How to Save with MyCouponStock?
1. Browse Deals or Search Your Favorite Store
2. Click on "Get Deal" or "Show Coupon Code."
3. Apply the Code or Shop Directly
4. Enjoy Instant Savings!

Thanks for subscribing to the MyCouponStock newsletter!

Follow Us:
Instagram: https://www.instagram.com/
Facebook: https://www.facebook.com/
Linkedin: https://www.linkedin.com/

Warm regards,
Team MyCouponStock

Unsubscribe: ${unsubscribeUrl}
`;
};

const buildUnsubscribeResponseHtml = ({ title, message, success }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin:0;padding:24px;background:#f5f2fb;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e7def8;box-shadow:0 18px 42px rgba(68,39,133,0.08);">
        <div style="background:${BRAND_PURPLE};padding:22px 20px;text-align:center;color:#ffffff;font-size:28px;font-weight:800;">
          MY COUPON STOCK
        </div>
        <div style="padding:36px 28px;text-align:center;">
          <h1 style="margin:0 0 16px;font-size:28px;color:${success ? "#23344d" : "#6a1b1b"};">${escapeHtml(title)}</h1>
          <p style="margin:0 0 24px;font-size:17px;line-height:1.7;color:#555555;">${escapeHtml(message)}</p>
          <a href="https://mycouponstock.com" style="display:inline-block;background:${BRAND_PURPLE};color:#ffffff;text-decoration:none;border-radius:10px;padding:14px 22px;font-weight:700;">
            Back to MyCouponStock
          </a>
        </div>
      </div>
    </body>
  </html>
`;

export const subscribeUser = async (req, res) => {
  try {
    const email = normalizeEmail(req?.body?.email);

    // 1. Validate
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    // 2. Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing?.status === "subscribed") {
      return res.status(400).json({ message: "Already Subscribed" });
    }

    // 3. Save subscriber or restore an unsubscribed record
    const subscriber = existing || new Subscriber({ email });
    subscriber.status = "subscribed";
    await subscriber.save();

    // 4. Send confirmation email
    const fromAddress = buildFromAddress();
    const transporter = getTransporter();

    let emailSent = false;
    const mailConfigured = Boolean(transporter && fromAddress);
    if (mailConfigured) {
      try {
        const unsubscribeUrl = buildUnsubscribeUrl(req, email);
        console.log("Newsletter mail debug:", {
          mailService: process.env.MAIL_SERVICE || "Gmail",
          mailUser:
            process.env.MAIL_USER ||
            process.env.SMTP_USER ||
            process.env.SMTP_EMAIL ||
            "",
          hasMailPass: Boolean(
            process.env.MAIL_PASS ||
            process.env.SMTP_PASS ||
            process.env.SMTP_PASSWORD
          ),
          smtpHost: process.env.SMTP_HOST || "",
          smtpPort: process.env.SMTP_PORT || "",
          smtpSecure: process.env.SMTP_SECURE || "",
          fromAddress,
        });
        const mailOptions = {
          from: fromAddress,
          to: email,
          subject: "Welcome to MyCouponStock!",
          html: buildSubscriptionEmailHtml({ email, unsubscribeUrl }),
          text: buildSubscriptionEmailText({ email, unsubscribeUrl }),
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        };

        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (mailErr) {
        if (existing) {
          subscriber.status = "unsubscribed";
          await subscriber.save().catch(() => {});
        } else {
          await Subscriber.deleteOne({ _id: subscriber._id }).catch(() => {});
        }
        console.error("Subscription Email Error:", mailErr?.message || mailErr);
        return res.status(502).json({
          message: "Subscription email could not be sent. Please try again.",
          emailSent: false,
          mailConfigured: true,
        });
      }
    }

    res
      .status(200)
      .json({ message: "Subscribed successfully", emailSent, mailConfigured });
  } catch (error) {
    console.error("Subscription Error:", error);

    // Handle duplicate subscription gracefully (unique index violation)
    if (error && (error.code === 11000 || error.code === 11001)) {
      return res.status(400).json({ message: "Already Subscribed" });
    }

    res.status(500).json({
      message: "Server Error",
      ...(process.env.NODE_ENV !== "production"
        ? { error: error?.message || String(error) }
        : {}),
    });
  }
};

export const unsubscribeUser = async (req, res) => {
  const wantsHtml =
    req.method === "GET" ||
    String(req.headers.accept || "").includes("text/html");

  const respond = (status, payload) => {
    if (wantsHtml) {
      return res
        .status(status)
        .send(
          buildUnsubscribeResponseHtml({
            title: payload.title,
            message: payload.message,
            success: status < 400,
          })
        );
    }
    return res.status(status).json(payload);
  };

  try {
    const token = String(req.query?.token || req.body?.token || "").trim();
    const rawEmail = String(req.body?.email || "").trim();

    let email = "";
    if (token) {
      email = verifyUnsubscribeToken(token);
    } else if (rawEmail) {
      email = normalizeEmail(rawEmail);
    }

    if (!email || !isValidEmail(email)) {
      return respond(400, {
        title: "Unsubscribe failed",
        message: "A valid unsubscribe link or email address is required.",
      });
    }

    const subscriber = await Subscriber.findOne({ email });
    if (!subscriber || subscriber.status === "unsubscribed") {
      return respond(200, {
        title: "Already unsubscribed",
        message: "This email address is already unsubscribed from MyCouponStock newsletter updates.",
      });
    }

    subscriber.status = "unsubscribed";
    await subscriber.save();

    return respond(200, {
      title: "Unsubscribed successfully",
      message: "You have been unsubscribed from MyCouponStock newsletter emails.",
    });
  } catch (error) {
    console.error("Unsubscribe Error:", error);
    return respond(400, {
      title: "Unsubscribe failed",
      message: "This unsubscribe link is invalid or has expired.",
    });
  }
};
