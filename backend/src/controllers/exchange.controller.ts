import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorHandler';
import { sendMail } from '../utils/mailer';

const exchangeSchema = z.object({
  message: z.string().trim().max(500).optional(),
});

export const requestExchange = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Необхідна авторизація', 401);
    }

    const { message } = exchangeSchema.parse(req.body ?? {});

    const book = await prisma.book.findUnique({
      where: { id: req.params.id },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    if (!book) {
      throw new AppError('Книгу не знайдено', 404);
    }

    if (book.ownerId === req.user.userId) {
      throw new AppError('Не можна запросити обмін на власну книгу', 400);
    }

    const requester = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { name: true, email: true },
    });

    if (!requester) {
      throw new AppError('Користувача не знайдено', 404);
    }

    const text = [
      `Привіт, ${book.owner.name}!`,
      '',
      `Користувач ${requester.name} (${requester.email}) хоче обмінятися з вами книгою «${book.title}» (${book.author}).`,
      message ? `\nПовідомлення: ${message}` : '',
      '',
      'Відповісти можна безпосередньо на цей лист.',
    ].join('\n');

    const { previewUrl } = await sendMail({
      to: book.owner.email,
      subject: `Запит на обмін книги «${book.title}»`,
      text,
      replyTo: requester.email,
    });

    res.status(200).json({
      message: 'Запит на обмін успішно надіслано',
      previewUrl,
    });
  } catch (error) {
    next(error);
  }
};