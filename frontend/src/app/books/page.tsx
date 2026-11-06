'use client';

import { useEffect, useState } from 'react';
import BookCard from '@/components/BookCard';
import { api, getErrorMessage } from '@/lib/api';
import type { Book, BooksResponse, Pagination } from '@/types';

const BOOKS_PER_PAGE = 8;
const SEARCH_DEBOUNCE_MS = 400;

type SortOption = 'newest' | 'title-asc' | 'title-desc';

export default function BooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [searchInput, setSearchInput] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [page, setPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    useEffect(() => {
        let isCancelled = false;

        const fetchBooks = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await api.get<BooksResponse>('/books', {
                    params: {
                        page,
                        limit: BOOKS_PER_PAGE,
                        sort: sortBy,
                        ...(search ? { search } : {}),
                    },
                });

                if (!isCancelled) {
                    setBooks(response.data.books);
                    setPagination(response.data.pagination);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(getErrorMessage(err));
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchBooks();

        return () => {
            isCancelled = true;
        };
    }, [page, search, sortBy]);

    const handleSortChange = (value: SortOption) => {
        setSortBy(value);
        setPage(1);
    };

    return (
        <div>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Книги для обміну
                    </h1>
                    <p className="mt-1 text-slate-500">
                        Знайдіть цікаву книгу та запропонуйте свою натомість
                    </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg
                                className="h-5 w-5 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="Назва або автор..."
                            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-burgundy focus:ring-2 focus:ring-burgundy/20"
                        />
                    </div>

                    <select
                        value={sortBy}
                        onChange={(event) => handleSortChange(event.target.value as SortOption)}
                        className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition-all focus:border-burgundy focus:ring-2 focus:ring-burgundy/20"
                    >
                        <option value="newest">Нові спочатку</option>
                        <option value="title-asc">За назвою (А-Я)</option>
                        <option value="title-desc">За назвою (Я-А)</option>
                    </select>
                </div>
            </div>

            {error && (
                <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="aspect-[3/4] animate-pulse rounded-xl bg-slate-200/70"
                        />
                    ))}
                </div>
            ) : books.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
                    <svg
                        className="mx-auto mb-4 h-16 w-16 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                    </svg>
                    <h3 className="mb-1 text-lg font-bold text-slate-700">Книг не знайдено</h3>
                    <p className="mx-auto max-w-sm text-sm text-slate-500">
                        Спробуйте змінити пошуковий запит або додайте свою книгу першим.
                    </p>
                </div>
            ) : (
                <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {books.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            )}

            {pagination && pagination.total >= BOOKS_PER_PAGE && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => setPage((current) => current - 1)}
                        disabled={page <= 1 || isLoading}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                    >
                        Назад
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                        (pageNumber) => (
                            <button
                                key={pageNumber}
                                type="button"
                                onClick={() => setPage(pageNumber)}
                                disabled={isLoading}
                                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm transition-colors ${pageNumber === pagination.page
                                        ? 'bg-burgundy font-bold text-white shadow-md shadow-burgundy/20'
                                        : 'font-medium text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        onClick={() => setPage((current) => current + 1)}
                        disabled={page >= pagination.totalPages || isLoading}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                    >
                        Далі
                    </button>
                </div>
            )}
        </div>
    );
}