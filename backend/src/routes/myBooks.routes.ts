import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import {
  createMyBook,
  getMyBooks,
  updateMyBook,
  deleteMyBook,
} from '../controllers/myBooks.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getMyBooks);
router.post('/', upload.single('photo'), createMyBook);
router.put('/:id', upload.single('photo'), updateMyBook);
router.delete('/:id', deleteMyBook);

export default router;