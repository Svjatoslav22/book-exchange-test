import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email('Некоректний формат email'),
    password: z.string().min(1, 'Введіть пароль'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export const registerSchema = z
    .object({
        name: z.string().min(2, "Ім'я має містити щонайменше 2 символи"),
        email: z.email('Некоректний формат email'),
        password: z.string().min(6, 'Пароль має містити щонайменше 6 символів'),
        confirmPassword: z.string().min(1, 'Підтвердіть пароль'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Паролі не співпадають',
        path: ['confirmPassword'],
    });

export type RegisterFormValues = z.infer<typeof registerSchema>;