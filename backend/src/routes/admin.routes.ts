import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import {
  createUser,
  deleteAnyBook,
  deleteUser,
  getUsers,
  updateUser,
} from '../controllers/admin.controller';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.delete('/books/:id', deleteAnyBook);

export default router;