import { Router } from 'express';
const router = Router();
import {
  getStores,
  getStoreById,
  createStore,
  deleteStore,
  updateStore,
  searchStores // Import the new searchStores function
} from '../Controllers/storeController.js'; // Ensure path is correct
import { protect, authorizeRoles } from '../middleware/authmiddleware.js'; // Import your middleware


router.get('/', getStores);
router.post('/', protect, authorizeRoles('admin'), createStore); // Only admin can create
router.delete('/:id', protect, authorizeRoles('admin'), deleteStore); // Only admin can delete
router.put('/:id', protect, authorizeRoles('admin'), updateStore); 

// router.post('/', createStore);
// router.delete('/:id', deleteStore);
// router.patch('/:id', updateStore);

// New search route - MUST be placed before '/:id'
router.get('/search', searchStores); // This line should come before the :id route

router.get('/:id', getStoreById); // This general route should come after more specific ones


export default router;
