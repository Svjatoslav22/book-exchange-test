'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, type RegisterFormValues } from '@/lib/validations/auth';
import type { AuthResponse } from '@/types';

const getInputClass = (hasError: boolean) =>
  `w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-all ${
    hasError
      ? 'border-red-400 text-red-900 focus:ring-2 focus:ring-red-200'
      : 'border-slate-300 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20'
  }`;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);

    try {
      const { name, email, password } = values;
      const response = await api.post<AuthResponse>('/auth/register', {
        name,
        email,
        password,
      });
      login(response.data.token, response.data.user);
      router.push('/books');
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">
          Створити акаунт
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Ім&apos;я
            </label>
            <input
              id="name"
              type="text"
              placeholder="Тарас Шевченко"
              autoComplete="name"
              {...register('name')}
              className={getInputClass(Boolean(errors.name))}
            />
            {errors.name && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
              className={getInputClass(Boolean(errors.email))}
            />
            {errors.email && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password')}
              className={getInputClass(Boolean(errors.password))}
            />
            {errors.password && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Підтвердження пароля
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={getInputClass(Boolean(errors.confirmPassword))}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-burgundy py-2.5 text-sm font-medium text-white shadow-md shadow-burgundy/20 transition-all hover:bg-burgundy-hover focus:ring-4 focus:ring-burgundy/20 disabled:opacity-50"
          >
            {isSubmitting ? 'Створення акаунта...' : 'Зареєструватися'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Вже маєте акаунт?{' '}
          <Link href="/login" className="font-semibold text-burgundy hover:underline">
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}