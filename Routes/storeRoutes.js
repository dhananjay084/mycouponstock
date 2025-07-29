import { Router } from 'express';
const router = Router();
import {
  getStores,
  updateStore,
  deleteStore,
  createStore,
  getStoreById,
} from '../Controllers/storeController.js';

// Place specific routes first

router.get('/', getStores);
router.post('/', createStore);
router.delete('/:id', deleteStore);
router.put('/:id', updateStore);
router.get('/:id', getStoreById);

export default router;
