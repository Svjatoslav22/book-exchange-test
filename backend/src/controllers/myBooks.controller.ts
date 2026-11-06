import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorHandler';

const bookSchema = z.object({
  title: z.string().trim().min(1, 'Назва книги обов’язкова').max(255),
  author: z.string().trim().min(1, 'Автор обов’язковий').max(255),
});

const removePhoto = async (photoUrl: string | null): Promise<void> => {
  if (!photoUrl) return;
  try {
    await fs.unlink(path.join(process.cwd(), 'uploads', path.basename(photoUrl)));
  } catch {
    // A missing local upload should not prevent deleting or updating a book.
  }
};

const requireUser = (req: Request): string => {
  if (!req.user) throw new AppError('Необхідна авторизація', 401);
  return req.user.userId;
};

export const createMyBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ownerId = requireUser(req);
    const data = bookSchema.parse(req.body);
    const book = await prisma.book.create({
      data: { ...data, ownerId, photoUrl: req.file ? `/uploads/${req.file.filename}` : null },
    });
    res.status(201).json({ book });
  } catch (error) {
    if (req.file) await removePhoto(`/uploads/${req.file.filename}`);
    next(error);
  }
};

export const getMyBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const books = await prisma.book.findMany({
      where: { ownerId: requireUser(req) },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ books });
  } catch (error) {
    next(error);
  }
};

export const updateMyBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ownerId = requireUser(req);
    const data = bookSchema.parse(req.body);
    const existing = await prisma.book.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Книгу не знайдено', 404);
    if (existing.ownerId !== ownerId) throw new AppError('Можна редагувати лише власні книги', 403);

    const book = await prisma.book.update({
      where: { id: existing.id },
      data: {
        ...data,
        ...(req.file ? { photoUrl: `/uploads/${req.file.filename}` } : {}),
      },
    });
    if (req.file) await removePhoto(existing.photoUrl);
    res.status(200).json({ book });
  } catch (error) {
    if (req.file) await removePhoto(`/uploads/${req.file.filename}`);
    next(error);
  }
};

export const deleteMyBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ownerId = requireUser(req);
    const book = await prisma.book.findUnique({ where: { id: req.params.id } });
    if (!book) throw new AppError('Книгу не знайдено', 404);
    if (book.ownerId !== ownerId) throw new AppError('Можна видаляти лише власні книги', 403);
    await prisma.book.delete({ where: { id: book.id } });
    await removePhoto(book.photoUrl);
    res.status(200).json({ message: 'Книгу успішно видалено' });
  } catch (error) {
    next(error);
  }
};
