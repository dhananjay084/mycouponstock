import { Router } from 'express';
const router = Router();

import {
  getStores,
  getStoreSitemap,
  getStoreById,
  createStore,
  deleteStore,
  updateStore,
  searchStores,
  getStoreBySlug
} from '../Controllers/storeController.js';

import { requireAdmin } from '../middleware/authmiddleware.js';

/* ================= PUBLIC ROUTES ================= */

// ✅ Specific routes FIRST
router.get('/search', searchStores);
router.get('/sitemap', getStoreSitemap);
router.get('/slug/:slug', getStoreBySlug);

// ✅ General list
router.get('/', getStores);

// ✅ ID-based route LAST
router.get('/:id', getStoreById);

/* ================= ADMIN ROUTES ================= */

router.post('/', requireAdmin, createStore);
router.put('/:id', requireAdmin, updateStore);
router.delete('/:id', requireAdmin, deleteStore);

export default router;
