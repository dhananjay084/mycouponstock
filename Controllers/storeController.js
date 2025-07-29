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
  

  
  
  
  
  
  