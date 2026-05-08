import { Router } from 'express';
import { requireAdmin } from '../middleware/authmiddleware.js'; // Import your middleware

const router = Router();
import {
  getDeals,
  getDealSitemap,
  getDealById,
  createDeal,
  bulkCreateDeals,
  deleteDeal,
  updateDeal,
  getDealBySlug,
  searchDeals // Import the new searchDeals function
} from '../Controllers/dealController.js'; // Ensure path is correct (Controllers -> controllers)

// New search route - MUST be placed before '/:id'
router.get('/search', searchDeals);

router.get('/sitemap', getDealSitemap);
router.get('/', getDeals);
router.get('/slug/:slug', getDealBySlug);

router.get('/:id', getDealById);

// router.post('/', createDeal);
// router.delete('/:id', deleteDeal);
// router.patch('/:id', updateDeal); // Keeping patch as per your provided file
router.post('/', requireAdmin, createDeal); // Only admin can create
router.post('/bulk', requireAdmin, bulkCreateDeals);
router.delete('/:id', requireAdmin, deleteDeal); // Only admin can delete
router.patch('/:id', requireAdmin, updateDeal); 

export default router;
