import Link from 'next/link';
import { getPhotoUrl } from '@/lib/utils';
import type { Book } from '@/types';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const photoSrc = getPhotoUrl(book.photoUrl);
  const ownerInitial = book.owner?.name ? book.owner.name.charAt(0).toUpperCase() : 'Ч';

  return (
    <Link
      href={`/books/${book.id}`}
      className="book-card group flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-slate-100">
        {photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoSrc}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="text-xs font-medium">Без обкладинки</span>
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col p-4">
        <h3 className="mb-1 line-clamp-2 text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-burgundy">
          {book.title}
        </h3>
        <p className="mb-3 text-sm text-slate-500">{book.author}</p>

        {book.owner && (
          <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-burgundy text-[11px] font-bold text-white">
              {ownerInitial}
            </span>
            <span className="truncate text-xs font-medium text-slate-600">
              {book.owner.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}