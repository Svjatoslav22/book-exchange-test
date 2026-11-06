import { z } from 'zod';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const bookSchema = z.object({
  title: z.string().trim().min(1, 'Назва книги обовʼязкова').max(255, 'Занадто довга назва'),
  author: z.string().trim().min(1, 'Автор обовʼязковий').max(255, 'Занадто довге імʼя автора'),
  photo: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || ALLOWED_IMAGE_TYPES.includes(files[0].type),
      'Дозволені лише зображення JPEG, PNG або WebP'
    )
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_IMAGE_SIZE_BYTES,
      'Розмір файлу не повинен перевищувати 5 МБ'
    ),
});

export type BookFormValues = z.infer<typeof bookSchema>;