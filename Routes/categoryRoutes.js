import { Router } from 'express';
const router = Router();
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  searchCategories // Import the new searchCategories function
} from '../Controllers/categoryController.js'; // Ensure path is correct

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory); // Assuming you use PUT for update
router.delete('/:id', deleteCategory);

// New search route - MUST be placed before any '/:id' routes
router.get('/search', searchCategories); // This line should come before the :id route if it existed

// If you had a get category by ID route, it would go here:
// router.get('/:id', getCategoryById); // Uncomment and add if you have this route in your controller

export default router;
