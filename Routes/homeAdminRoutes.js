import { Router } from 'express';
const router = Router();
import { createHomeAdmin, getHomeAdmin, getHomeAdminSeo, updateHomeAdmin } from '../Controllers/homeAdminController.js';
import { requireAdmin } from '../middleware/authmiddleware.js'; // Import your middleware

router.post('/', requireAdmin, createHomeAdmin); // Only admin can create
router.get('/seo', getHomeAdminSeo);
router.get('/', getHomeAdmin);

router.patch('/:id', requireAdmin, updateHomeAdmin); 


// router.post('/', createHomeAdmin);
// router.patch('/:id', updateHomeAdmin); 

export default router;
