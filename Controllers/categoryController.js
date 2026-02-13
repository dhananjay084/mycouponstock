import Category from '../Models/categoryModel.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCategory = async (req, res) => {
  const { name, image, popularStore, showOnHomepage, metaTitle,
    metaDescription,
    metaKeywords } = req.body;

  if (!name || !image) {
    return res.status(400).json({ message: 'Name and image are required' });
  }

  try {
    const newCategory = new Category({ name, image, popularStore, showOnHomepage,  metaTitle,
      metaDescription,
      metaKeywords });
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const updateCategory = async (req, res) => {
//   try {
//     const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updated) return res.status(404).json({ message: 'Category not found' });
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
export const updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Category not found' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const searchCategories = async (req, res) => {
    const searchTerm = req.query.q;
  
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term (q) is required' });
    }
  
    try {
      // Create case-insensitive regex for "starts with"
      const startsWithRegex = new RegExp('^' + searchTerm, 'i');
      // Create case-insensitive regex for "contains"
      const containsRegex = new RegExp(searchTerm, 'i');
  
      // 1. Find categories where name starts with the searchTerm
      const startsWithCategories = await Category.find({ name: startsWithRegex }).lean(); // .lean() for plain JS objects
  
      // Get IDs of categories found in "starts with" to exclude them from "contains" search
      const startsWithIds = startsWithCategories.map(cat => cat._id);
  
      // 2. Find categories where name contains the searchTerm, excluding those already found
      const containsCategories = await Category.find({
        name: containsRegex,
        _id: { $nin: startsWithIds } // Exclude categories already found
      }).lean();
  
      // Combine results: startsWithCategories first, then containsCategories
      const combinedCategories = [...startsWithCategories, ...containsCategories];
  
      res.json(combinedCategories);
    } catch (err) {
      console.error('Error during category search:', err);
      res.status(500).json({ message: err.message });
    }
  };