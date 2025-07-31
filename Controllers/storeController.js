import Store from '../Models/storeModel.js';

export async function getStores(req, res) {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createStore(req, res) {
  const {
    storeName,
    storeDescription,
    storeImage,
    homePageTitle,
    showOnHomepage,
    storeType,
    discountPercentage,
    popularStore,
    storeHtmlContent,
  } = req.body;

  if (!storeName || !storeDescription || !storeImage || !homePageTitle || !storeType || discountPercentage === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newStore = new Store({
        storeName,
        storeDescription,
        storeImage,
        homePageTitle,
        showOnHomepage,
        storeType,
        discountPercentage,
        popularStore,
        storeHtmlContent,
    });

    const saved = await newStore.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateStore(req, res) {
  try {
    const updated = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Store not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteStore(req, res) {
  try {
    const deleted = await Store.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Store not found' });
    res.json({ message: 'Store deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
export async function getStoreById(req, res) {
    try {
      const store = await Store.findById(req.params.id);
      if (!store) return res.status(404).json({ message: 'Store not found' });
      res.json(store);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  
  export async function searchStores(req, res) {
    const searchTerm = req.query.q;
  
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term (q) is required' });
    }
  
    try {
      // Create case-insensitive regex for "starts with"
      const startsWithRegex = new RegExp('^' + searchTerm, 'i');
      // Create case-insensitive regex for "contains"
      const containsRegex = new RegExp(searchTerm, 'i');
  
      // 1. Find stores where storeName starts with the searchTerm
      const startsWithStores = await Store.find({ storeName: startsWithRegex }).lean(); // .lean() for plain JS objects
  
      // Get IDs of stores found in "starts with" to exclude them from "contains" search
      const startsWithIds = startsWithStores.map(store => store._id);
  
      // 2. Find stores where storeName contains the searchTerm, excluding those already found
      const containsStores = await Store.find({
        storeName: containsRegex,
        _id: { $nin: startsWithIds } // Exclude stores already found
      }).lean();
  
      // Combine results: startsWithStores first, then containsStores
      const combinedStores = [...startsWithStores, ...containsStores];
  
      res.json(combinedStores);
    } catch (err) {
      console.error('Error during store search:', err);
      res.status(500).json({ message: err.message });
    }
  }
  
  