import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorHandler';

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Ім'я має містити щонайменше 2 символи"),
  email: z.string().trim().email('Некоректний формат email'),
  password: z.string().min(6, 'Пароль має містити щонайменше 6 символів'),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2, "Ім'я має містити щонайменше 2 символи").optional(),
  email: z.string().trim().email('Некоректний формат email').optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

const removePhotoFile = async (photoUrl: string | null): Promise<void> => {
  if (!photoUrl) return;
  try {
    await fs.unlink(path.join(process.cwd(), 'uploads', path.basename(photoUrl)));
  } catch {
  }
};

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

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new AppError('Користувач з таким email вже існує', 409);
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { books: true } },
      },
    });

    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new AppError('Користувача не знайдено', 404);
    }

    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      if (emailTaken) {
        throw new AppError('Цей email вже зайнятий іншим користувачем', 409);
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { books: true } },
      },
    });

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user?.userId === id) {
      throw new AppError('Ви не можете видалити власний акаунт', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { books: { select: { photoUrl: true } } },
    });

    if (!existingUser) {
      throw new AppError('Користувача не знайдено', 404);
    }

    await prisma.user.delete({ where: { id } });

    for (const book of existingUser.books) {
      await removePhotoFile(book.photoUrl);
    }

    res.status(200).json({ message: 'Користувача успішно видалено' });
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
    await removePhotoFile(book.photoUrl);

    res.status(200).json({ message: 'Книгу успішно видалено адміністратором' });
  } catch (error) {
    next(error);
  }
};