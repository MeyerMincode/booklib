export interface Book {
  id: string;
  title: string;
  author: string;
  genre?: string;
  publicationDate?: string;
  pageCount?: number;
  coverImage?: string | null;
  status: 'wantToRead' | 'reading' | 'completed';
  currentPage?: number;
  startDate?: string;
  endDate?: string;
  isbn?: string;
  publisher?: string;
  language?: string;
  notes?: string;
  rating?: number;
}

export type BookFormData = Omit<Book, 'id'> & { id?: string };