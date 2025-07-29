import HomeAdmin from '../Models/HomeAdmin.js';


export async function createHomeAdmin(req, res) {
    try {
      const existing = await HomeAdmin.findOne(); // Check if already one exists
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Only one HomeAdmin entry is allowed.',
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
      const data = await HomeAdmin.find().populate('bannerDeals');
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  
