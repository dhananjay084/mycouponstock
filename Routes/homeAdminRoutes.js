import { Router } from 'express';
const router = Router();
import { createHomeAdmin, getHomeAdmin ,updateHomeAdmin} from '../Controllers/homeAdminController.js';

router.post('/', createHomeAdmin);
router.get('/', getHomeAdmin);
router.patch('/:id', updateHomeAdmin); 

export default router;
