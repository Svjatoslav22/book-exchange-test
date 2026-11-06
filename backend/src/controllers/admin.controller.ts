import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorHandler';

export const getUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { books: true } },
      },
    });

    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

export const deleteAnyBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({ where: { id } });

    if (!book) {
      throw new AppError('Книгу не знайдено', 404);
    }

    await prisma.book.delete({ where: { id } });

    if (book.photoUrl) {
      try {
        await fs.unlink(
          path.join(process.cwd(), 'uploads', path.basename(book.photoUrl))
        );
      } catch {
      }
    }

    res.status(200).json({ message: 'Книгу успішно видалено адміністратором' });
  } catch (error) {
    next(error);
  }
};