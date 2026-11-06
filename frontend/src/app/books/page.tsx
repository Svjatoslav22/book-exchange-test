'use client';

import { useEffect, useState } from 'react';
import BookCard from '@/components/BookCard'
import { api, getErrorMessage } from '@/lib/api';
import type { Book, BooksResponse, Pagination } from '@/types';

const BOOKS_PER_PAGE = 12;
const SEARCH_DEBOUNCE_MS = 400;

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchInput, setSearchInput] = useState<string>('');
  const [search, setSearch] = useState<string>('');
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
  }, [page, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Каталог книг</h1>
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Пошук за назвою або автором..."
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none sm:w-80"
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Завантаження...</p>
      ) : books.length === 0 ? (
        <p className="text-sm text-gray-500">Книг не знайдено.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((current) => current - 1)}
            disabled={page <= 1 || isLoading}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Назад
          </button>
          <span className="text-sm text-gray-600">
            Сторінка {pagination.page} з {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= pagination.totalPages || isLoading}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Далі
          </button>
        </div>
      )}
    </div>
  );
}