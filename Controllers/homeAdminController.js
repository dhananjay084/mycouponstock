import HomeAdmin from '../Models/HomeAdmin.js';

const normalizeOptionalString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

export async function createHomeAdmin(req, res) {
    try {
      const { country } = req.body;
      if (!country || !country.trim()) {
        return res.status(400).json({ success: false, error: "Country is required." });
      }
      req.body.country = country.trim();
      const existing = await HomeAdmin.findOne({ country: req.body.country }); // One entry per country
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'HomeAdmin entry already exists for this country.',
        });
      }

      const payload = {
        ...req.body,
        homeMetaTitle: normalizeOptionalString(req.body.homeMetaTitle),
        homeMetaDescription: normalizeOptionalString(req.body.homeMetaDescription),
        dealsMetaTitle: normalizeOptionalString(req.body.dealsMetaTitle),
        dealsMetaDescription: normalizeOptionalString(req.body.dealsMetaDescription),
        storeMetaTitle: normalizeOptionalString(req.body.storeMetaTitle),
        storeMetaDescription: normalizeOptionalString(req.body.storeMetaDescription),
        categoryMetaTitle: normalizeOptionalString(req.body.categoryMetaTitle),
        categoryMetaDescription: normalizeOptionalString(req.body.categoryMetaDescription),
        homeFooterTitle: normalizeOptionalString(req.body.homeFooterTitle),
        homeFooterDescription: normalizeOptionalString(req.body.homeFooterDescription),
      };

      const newHomeAdmin = await HomeAdmin.create(payload);
      const populated = await HomeAdmin.findById(newHomeAdmin._id)
        .populate('bannerDeals')
        .populate('dealPageBannerDeals')
        .populate('storePageBannerDeals')
        .populate('categoryPageBannerDeals');
      return res.status(201).json({ success: true, data: populated });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
  export async function updateHomeAdmin(req, res) {
    try {
      const { id } = req.params;
      if (req.body.country) {
        req.body.country = req.body.country.trim();
        const existing = await HomeAdmin.findOne({
          _id: { $ne: id },
          country: req.body.country,
        });
        if (existing) {
          return res.status(400).json({ success: false, error: "HomeAdmin entry already exists for this country." });
        }
      }

      const payload = {
        ...req.body,
      };

      if ("homeMetaTitle" in req.body) {
        payload.homeMetaTitle = normalizeOptionalString(req.body.homeMetaTitle);
      }
      if ("homeMetaDescription" in req.body) {
        payload.homeMetaDescription = normalizeOptionalString(req.body.homeMetaDescription);
      }
      if ("dealsMetaTitle" in req.body) {
        payload.dealsMetaTitle = normalizeOptionalString(req.body.dealsMetaTitle);
      }
      if ("dealsMetaDescription" in req.body) {
        payload.dealsMetaDescription = normalizeOptionalString(req.body.dealsMetaDescription);
      }
      if ("storeMetaTitle" in req.body) {
        payload.storeMetaTitle = normalizeOptionalString(req.body.storeMetaTitle);
      }
      if ("storeMetaDescription" in req.body) {
        payload.storeMetaDescription = normalizeOptionalString(req.body.storeMetaDescription);
      }
      if ("categoryMetaTitle" in req.body) {
        payload.categoryMetaTitle = normalizeOptionalString(req.body.categoryMetaTitle);
      }
      if ("categoryMetaDescription" in req.body) {
        payload.categoryMetaDescription = normalizeOptionalString(req.body.categoryMetaDescription);
      }
      if ("homeFooterTitle" in req.body) {
        payload.homeFooterTitle = normalizeOptionalString(req.body.homeFooterTitle);
      }
      if ("homeFooterDescription" in req.body) {
        payload.homeFooterDescription = normalizeOptionalString(req.body.homeFooterDescription);
      }

      const updated = await HomeAdmin.findByIdAndUpdate(id, { $set: payload }, {
        new: true,
        runValidators: true,
      })
        .populate('bannerDeals')
        .populate('dealPageBannerDeals')
        .populate('storePageBannerDeals')
        .populate('categoryPageBannerDeals');
  
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Not found' });
      }
  
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
  
  export async function getHomeAdmin(req, res) {
    try {
      const { country } = req.query;
      let query = {};
      if (country) {
        const escaped = country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query = { country: new RegExp(`^${escaped}$`, 'i') };
      }
      const data = await HomeAdmin.find(query)
        .populate('bannerDeals')
        .populate('dealPageBannerDeals')
        .populate('storePageBannerDeals')
        .populate('categoryPageBannerDeals');
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  
