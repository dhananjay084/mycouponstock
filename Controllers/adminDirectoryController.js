import User from "../Models/userModal.js";
import Subscriber from "../Models/subscribeModel.js";

const AWIN_API_BASE = "https://api.awin.com";

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email phone role authProvider socialProvider referralCode referredBy createdAt")
      .populate("referredBy", "name email referralCode")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch users." });
  }
};

export const getAdminSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find()
      .select("email status createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(subscribers);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch subscribers." });
  }
};

export const deleteAdminSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubscriber = await Subscriber.findByIdAndDelete(id);

    if (!deletedSubscriber) {
      return res.status(404).json({ message: "Subscriber not found." });
    }

    return res.status(200).json({ message: "Subscriber deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to delete subscriber." });
  }
};

export const getAdminAwinOffers = async (req, res) => {
  try {
    const accessToken = String(
      process.env.AWIN_ACCESS_TOKEN || process.env.AWIN_OAUTH_TOKEN || ""
    ).trim();
    const publisherId = String(process.env.AWIN_PUBLISHER_ID || "").trim();

    if (!accessToken || !publisherId) {
      return res.status(500).json({ message: "Awin credentials are not configured." });
    }

    const page = Math.max(1, Number.parseInt(req.query.page || "1", 10) || 1);
    const requestedPageSize = Number.parseInt(req.query.pageSize || "20", 10) || 20;
    const pageSize = Math.min(Math.max(requestedPageSize, 10), 200);
    const status = String(req.query.status || "").trim();
    const membership = String(req.query.membership || "all").trim();
    const type = String(req.query.type || "all").trim();
    const regionCode = String(req.query.regionCode || "").trim().toUpperCase();

    const body = {
      filters: {
        membership,
        type,
      },
      pagination: {
        page,
        pageSize,
      },
    };

    if (regionCode) {
      body.filters.regionCodes = [regionCode];
    }

    if (status) {
      body.filters.status = status;
    }

    const response = await fetch(
      `${AWIN_API_BASE}/publisher/${encodeURIComponent(publisherId)}/promotions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Failed to fetch Awin offers.",
        details: payload,
      });
    }

    const offers = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.offers)
        ? payload.offers
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

    const paginationPayload = payload?.pagination || payload?.page || payload?.meta || {};
    const total =
      Number.parseInt(
        paginationPayload?.totalCount ||
          paginationPayload?.total ||
          paginationPayload?.count ||
          payload?.totalCount ||
          payload?.total ||
          "",
        10
      ) || null;
    const totalPages =
      Number.parseInt(
        paginationPayload?.totalPages || paginationPayload?.pageCount || payload?.totalPages || "",
        10
      ) || (total ? Math.ceil(total / pageSize) : null);
    const currentPage =
      Number.parseInt(
        paginationPayload?.page || paginationPayload?.currentPage || payload?.page || "",
        10
      ) || page;
    const hasNextPage =
      typeof paginationPayload?.hasNextPage === "boolean"
        ? paginationPayload.hasNextPage
        : totalPages
          ? currentPage < totalPages
          : offers.length === pageSize;

    return res.status(200).json({
      offers,
      pagination: {
        page: currentPage,
        pageSize,
        returned: offers.length,
        total,
        totalPages,
        hasNextPage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch Awin offers.",
    });
  }
};
