import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { getUsers, deleteAnyBook } from '../controllers/admin.controller';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', getUsers);
router.delete('/books/:id', deleteAnyBook);

export default router;