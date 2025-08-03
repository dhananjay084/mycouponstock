import { Router } from 'express';
const router = Router();
import { createHomeAdmin, getHomeAdmin ,updateHomeAdmin} from '../Controllers/homeAdminController.js';
import { protect, authorizeRoles } from '../middleware/authmiddleware.js'; // Import your middleware

router.post('/', protect, authorizeRoles('admin'), createHomeAdmin); // Only admin can create
router.get('/', getHomeAdmin);

router.patch('/:id', protect, authorizeRoles('admin'), updateHomeAdmin); 


// router.post('/', createHomeAdmin);
// router.patch('/:id', updateHomeAdmin); 

export default router;
