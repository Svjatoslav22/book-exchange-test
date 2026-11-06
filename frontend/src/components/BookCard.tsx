import Link from 'next/link';
import { getPhotoUrl } from '@/lib/utils';
import type { Book } from '@/types';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const photoSrc = getPhotoUrl(book.photoUrl);

  return (
    <Link
      href={`/books/${book.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="flex aspect-[3/4] items-center justify-center bg-gray-100">
        {photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoSrc} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-5xl">📖</span>
        )}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{book.title}</h3>
        <p className="text-sm text-gray-600">{book.author}</p>
        {book.owner && (
          <p className="text-xs text-gray-400">Власник: {book.owner.name}</p>
        )}
      </div>
    </Link>
  );
}