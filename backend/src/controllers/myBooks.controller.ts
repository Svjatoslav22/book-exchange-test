import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorHandler';

const createBookSchema = z.object({
  title: z.string().trim().min(1, 'Назва книги обовʼязкова').max(255),
  author: z.string().trim().min(1, 'Автор обовʼязковий').max(255),
});

const removeUploadedFile = async (filename?: string): Promise<void> => {
  if (!filename) return;
  try {
    await fs.unlink(path.join(process.cwd(), 'uploads', path.basename(filename)));
  } catch {
  }
};

export const createMyBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Необхідна авторизація', 401);
    }

    const validatedData = createBookSchema.parse(req.body);
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const book = await prisma.book.create({
      data: {
        title: validatedData.title,
        author: validatedData.author,
        photoUrl,
        ownerId: req.user.userId,
      },
    });

    res.status(201).json({ book });
  } catch (error) {
    await removeUploadedFile(req.file?.filename);
    next(error);
  }
};

export const getMyBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Необхідна авторизація', 401);
    }

    const books = await prisma.book.findMany({
      where: { ownerId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ books });
  } catch (error) {
    next(error);
  }
};

export const deleteMyBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Необхідна авторизація', 401);
    }

    const { id } = req.params;

    const book = await prisma.book.findUnique({ where: { id } });

    if (!book) {
      throw new AppError('Книгу не знайдено', 404);
    }

    if (book.ownerId !== req.user.userId) {
      throw new AppError('Ви можете видаляти лише власні книги', 403);
    }

    await prisma.book.delete({ where: { id } });
    await removeUploadedFile(book.photoUrl ? path.basename(book.photoUrl) : undefined);

    res.status(200).json({ message: 'Книгу успішно видалено' });
  } catch (error) {
    next(error);
  }
};