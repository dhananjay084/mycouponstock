import { Router } from 'express';
const router = Router();
import {
  getDeals,
  getDealById,
  createDeal,
  deleteDeal,
  updateDeal,
  searchDeals // Import the new searchDeals function
} from '../Controllers/dealController.js'; // Ensure path is correct (Controllers -> controllers)

// New search route - MUST be placed before '/:id'
router.get('/search', searchDeals);

router.get('/', getDeals);
router.get('/:id', getDealById);
router.post('/', createDeal);
router.delete('/:id', deleteDeal);
router.patch('/:id', updateDeal); // Keeping patch as per your provided file


export default router;
