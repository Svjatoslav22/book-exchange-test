import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorHandler';

const getBooksQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(8),
    search: z.string().trim().max(100).optional(),
    sort: z.enum(['newest', 'title-asc', 'title-desc']).default('newest'),
});
export const getBooks = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { page, limit, search, sort } = getBooksQuerySchema.parse(req.query);

        const where: Prisma.BookWhereInput = search
            ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { author: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};

        const orderBy: Prisma.BookOrderByWithRelationInput =
            sort === 'title-asc'
                ? { title: 'asc' }
                : sort === 'title-desc'
                    ? { title: 'desc' }
                    : { createdAt: 'desc' };

        const [books, total] = await prisma.$transaction([
            prisma.book.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                include: { owner: { select: { id: true, name: true } } },
            }),
            prisma.book.count({ where }),
        ]);

        res.status(200).json({
            books,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getBookById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const book = await prisma.book.findUnique({
            where: { id: req.params.id },
            include: { owner: { select: { id: true, name: true } } },
        });

        if (!book) {
            throw new AppError('Книгу не знайдено', 404);
        }

        res.status(200).json({ book });
    } catch (error) {
        next(error);
    }
};