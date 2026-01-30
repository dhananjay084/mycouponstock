import { Router } from 'express';
const router = Router();

import {
  getStores,
  getStoreById,
  createStore,
  deleteStore,
  updateStore,
  searchStores,
  getStoreBySlug
} from '../Controllers/storeController.js';

import { protect, authorizeRoles } from '../middleware/authmiddleware.js';

/* ================= PUBLIC ROUTES ================= */

// ✅ Specific routes FIRST
router.get('/search', searchStores);
router.get('/slug/:slug', getStoreBySlug);

// ✅ General list
router.get('/', getStores);

// ✅ ID-based route LAST
router.get('/:id', getStoreById);

/* ================= ADMIN ROUTES ================= */

router.post('/', protect, authorizeRoles('admin'), createStore);
router.put('/:id', protect, authorizeRoles('admin'), updateStore);
router.delete('/:id', protect, authorizeRoles('admin'), deleteStore);

export default router;
