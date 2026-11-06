export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface BookOwner {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  photoUrl: string | null;
  ownerId: string;
  owner?: BookOwner;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BooksResponse {
  books: Book[];
  pagination: Pagination;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiErrorResponse {
  message: string;
  errors?: { field: string; message: string }[];
}

export interface ExchangeResponse {
  message: string;
  previewUrl?: string | null;
}