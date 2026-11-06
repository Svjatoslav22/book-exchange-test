import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import {
  createMyBook,
  getMyBooks,
  deleteMyBook,
} from '../controllers/myBooks.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getMyBooks);
router.post('/', upload.single('photo'), createMyBook);
router.delete('/:id', deleteMyBook);

export default router;