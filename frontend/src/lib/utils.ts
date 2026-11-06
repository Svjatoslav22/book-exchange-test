const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const getPhotoUrl = (photoUrl: string | null): string | null => {
  if (!photoUrl) {
    return null;
  }

  if (photoUrl.startsWith('http')) {
    return photoUrl;
  }

  return `${BACKEND_URL}${photoUrl}`;
};