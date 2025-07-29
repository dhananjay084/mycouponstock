import Deal from '../Models/dealModel.js';

export async function getDeals(req, res) {
  try {
    const deals = await Deal.find();
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createDeal(req, res) {
    const {
      dealTitle,
      dealDescription,
      dealImage,
      homePageTitle,
      showOnHomepage,
      dealType,
      dealCategory,
      details,
      discount,
      categorySelect,
      couponCode,
      store,
      expiredDate, // <-- NEW FIELD
    } = req.body;
  
    if (
      !dealTitle ||
      !dealDescription ||
      !dealImage ||
      !homePageTitle ||
      !dealType ||
      !dealCategory ||
      !details ||
      !categorySelect ||
      !store ||
      !couponCode ||
      !discount ||
      !expiredDate // <-- NEW VALIDATION
    ) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }
  
    try {
      const newDeal = new Deal({
        dealTitle,
        dealDescription,
        dealImage,
        homePageTitle,
        showOnHomepage: showOnHomepage || false,
        dealType,
        dealCategory,
        details,
        categorySelect,
        couponCode,
        discount,
        store,
        expiredDate, // <-- STORE NEW FIELD
      });
  
      const savedDeal = await newDeal.save();
      res.status(201).json(savedDeal);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  
  
  export async function getDealById(req, res) {
    try {
      const deal = await Deal.findById(req.params.id);
      if (!deal) return res.status(404).json({ message: 'Deal not found' });
      res.json(deal);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  
export async function deleteDeal(req, res) {
  try {
    const deleted = await Deal.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Deal not found' });
    res.json({ message: 'Deal deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateDeal(req, res) {
  try {
    const updated = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Deal not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
