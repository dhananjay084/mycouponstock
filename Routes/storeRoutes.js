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

router.get('/', getStores);
router.post('/', createStore);
router.delete('/:id', deleteStore);
router.patch('/:id', updateStore);

// New search route - MUST be placed before '/:id'
router.get('/search', searchStores); // This line should come before the :id route

router.get('/:id', getStoreById); // This general route should come after more specific ones


export default router;
