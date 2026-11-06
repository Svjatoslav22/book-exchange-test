import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Некоректний формат email'),
  password: z.string().min(6, 'Пароль має містити щонайменше 6 символів'),
  name: z.string().min(2, "Ім'я має містити щонайменше 2 символи"),
});

export const loginSchema = z.object({
  email: z.string().email('Некоректний формат email'),
  password: z.string().min(1, 'Введіть пароль'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
