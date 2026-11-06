import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getBooks, getBookById } from '../controllers/books.controller';
import { requestExchange } from '../controllers/exchange.controller';

const router = Router();

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/:id/exchange', requireAuth, requestExchange);

export default router;