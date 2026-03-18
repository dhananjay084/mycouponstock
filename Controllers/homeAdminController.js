import HomeAdmin from '../Models/HomeAdmin.js';


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
  
      const newHomeAdmin = await HomeAdmin.create(req.body);
      return res.status(201).json({ success: true, data: newHomeAdmin });
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
      const updated = await HomeAdmin.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      }).populate('bannerDeals');
  
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
      const data = await HomeAdmin.find(query).populate('bannerDeals');
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  
