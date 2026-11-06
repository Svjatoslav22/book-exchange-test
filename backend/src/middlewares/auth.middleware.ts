import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Необхідна авторизація (відсутній токен)', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError('Недійсний або прострочений токен', 401));
  }
};

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(new AppError('Необхідна авторизація', 401));
    return;
  }

  if (req.user.role !== 'ADMIN') {
    next(new AppError('Доступ заборонено: потрібні права адміністратора', 403));
    return;
  }

  next();
};