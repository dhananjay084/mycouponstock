import Deal from '../Models/dealModel.js';
import slugify from 'slugify';

export async function getDeals(req, res) {
  try {
    const deals = await Deal.find();
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
async function generateUniqueSlug(title) {
  let baseSlug = slugify(title, {
    lower: true,
    strict: true,
    trim: true
  });
  
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug exists and make it unique
  while (true) {
    const existingDeal = await Deal.findOne({ slug });
    if (!existingDeal) {
      break;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
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
    expiredDate,
    redirectionLink,
    country // ✅ ADD THIS
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
    !expiredDate ||
    !redirectionLink ||
    !country // ✅ ADD THIS TO VALIDATION
  ) {
    return res.status(400).json({ message: 'All required fields must be filled' });
  }

  try {
    const slug = await generateUniqueSlug(dealTitle);

    const newDeal = new Deal({
      dealTitle,
      slug,
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
      expiredDate,
      redirectionLink,
      country // ✅ ADD THIS WHEN SAVING
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
    if (req.body.dealTitle) {
      req.body.slug = await generateUniqueSlug(req.body.dealTitle);
    }
    const updated = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Deal not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
export async function getDealBySlug(req, res) {
  try {
    const deal = await Deal.findOne({ slug: req.params.slug });
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json(deal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function searchDeals(req, res) {
    const searchTerm = req.query.q;
  
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term (q) is required' });
    }
  
    try {
      // Create case-insensitive regex for "starts with"
      const startsWithRegex = new RegExp('^' + searchTerm, 'i');
      // Create case-insensitive regex for "contains"
      const containsRegex = new RegExp(searchTerm, 'i');
  
      // 1. Find deals where dealTitle starts with the searchTerm
      const startsWithDeals = await Deal.find({ dealTitle: startsWithRegex }).lean(); // .lean() for plain JS objects
  
      // Get IDs of deals found in "starts with" to exclude them from "contains" search
      const startsWithIds = startsWithDeals.map(deal => deal._id);
  
      // 2. Find deals where dealTitle contains the searchTerm, excluding those already found
      const containsDeals = await Deal.find({
        dealTitle: containsRegex,
        _id: { $nin: startsWithIds } // Exclude deals already found
      }).lean();
  
      // Combine results: startsWithDeals first, then containsDeals
      const combinedDeals = [...startsWithDeals, ...containsDeals];
  
      res.json(combinedDeals);
    } catch (err) {
      console.error('Error during deal search:', err);
      res.status(500).json({ message: err.message });
    }
  }