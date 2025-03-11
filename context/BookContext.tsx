import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, BookFormData } from '../types';

// Initial mock data
const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Classic Fiction',
    publicationDate: '1925-04-10',
    pageCount: 180,
    coverImage: null,
    status: 'completed',
    startDate: '2023-01-15',
    endDate: '2023-01-30',
    isbn: '9780743273565',
    publisher: 'Scribner',
    language: 'English',
    notes: 'A classic American novel about wealth, love, and the American Dream in the Roaring Twenties.',
    rating: 4,
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Classic Fiction',
    publicationDate: '1960-07-11',
    pageCount: 281,
    coverImage: null,
    status: 'reading',
    currentPage: 120,
    startDate: '2023-02-15',
    isbn: '9780061120084',
    publisher: 'HarperPerennial Modern Classics',
    language: 'English',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian Fiction',
    publicationDate: '1949-06-08',
    pageCount: 328,
    coverImage: null,
    status: 'wantToRead',
    isbn: '9780451524935',
    publisher: 'Signet Classic',
    language: 'English',
  },
];

// Storage key
const STORAGE_KEY = 'bookshelf_books';

// Context interface
interface BookContextType {
  books: Book[];
  loading: boolean;
  getBook: (id: string) => Book | undefined;
  addBook: (book: BookFormData) => Promise<Book>;
  updateBook: (book: Book) => Promise<Book>;
  deleteBook: (id: string) => Promise<void>;
  updateBookStatus: (id: string, status: Book['status'], endDate?: string) => Promise<Book>;
  updateBookProgress: (id: string, currentPage: number) => Promise<Book>;
}

// Create context with default values
const BookContext = createContext<BookContextType>({
  books: [],
  loading: true,
  getBook: () => undefined,
  addBook: async () => ({ id: '', title: '', author: '', status: 'wantToRead' }),
  updateBook: async (book) => book,
  deleteBook: async () => {},
  updateBookStatus: async () => ({ id: '', title: '', author: '', status: 'wantToRead' }),
  updateBookProgress: async () => ({ id: '', title: '', author: '', status: 'wantToRead' }),
});

// Create helper UUID generator function
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Provider component
export const BookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load books from AsyncStorage on component mount
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const storedBooks = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedBooks) {
          setBooks(JSON.parse(storedBooks));
        } else {
          // Use initial data if nothing is stored
          setBooks(INITIAL_BOOKS);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKS));
        }
      } catch (error) {
        console.error('Failed to load books:', error);
        // Fallback to initial data
        setBooks(INITIAL_BOOKS);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  // Save books to AsyncStorage whenever they change
  useEffect(() => {
    const saveBooks = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(books));
      } catch (error) {
        console.error('Failed to save books:', error);
      }
    };

    // Only save if books have been loaded (not initial state)
    if (!loading) {
      saveBooks();
    }
  }, [books, loading]);

  // Get a single book by ID
  const getBook = (id: string): Book | undefined => {
    return books.find(book => book.id === id);
  };

  // Add a new book
  const addBook = async (bookData: BookFormData): Promise<Book> => {
    const newBook: Book = {
      ...bookData,
      id: bookData.id || generateUUID(),
    };
    
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    return newBook;
  };

  // Update an existing book
  const updateBook = async (updatedBook: Book): Promise<Book> => {
    const updatedBooks = books.map(book => 
      book.id === updatedBook.id ? updatedBook : book
    );
    
    setBooks(updatedBooks);
    return updatedBook;
  };

  // Delete a book
  const deleteBook = async (id: string): Promise<void> => {
    const updatedBooks = books.filter(book => book.id !== id);
    setBooks(updatedBooks);
  };

  // Update book reading status
  const updateBookStatus = async (
    id: string, 
    status: Book['status'], 
    endDate?: string
  ): Promise<Book> => {
    const bookToUpdate = books.find(book => book.id === id);
    
    if (!bookToUpdate) {
      throw new Error(`Book with id ${id} not found`);
    }
    
    const updatedBook: Book = {
      ...bookToUpdate,
      status,
      // If status is 'reading', set startDate if not already set
      ...(status === 'reading' && !bookToUpdate.startDate ? {
        startDate: new Date().toISOString().split('T')[0]
      } : {}),
      // If status is 'completed', set endDate if provided or current date
      ...(status === 'completed' ? {
        endDate: endDate || new Date().toISOString().split('T')[0]
      } : {})
    };
    
    return await updateBook(updatedBook);
  };

  // Update book reading progress
  const updateBookProgress = async (id: string, currentPage: number): Promise<Book> => {
    const bookToUpdate = books.find(book => book.id === id);
    
    if (!bookToUpdate) {
      throw new Error(`Book with id ${id} not found`);
    }
    
    // Ensure book is in reading status
    if (bookToUpdate.status !== 'reading') {
      await updateBookStatus(id, 'reading');
    }
    
    const updatedBook: Book = {
      ...bookToUpdate,
      currentPage,
      status: 'reading',
      // If this is the first time updating progress, set start date
      ...(bookToUpdate.startDate ? {} : {
        startDate: new Date().toISOString().split('T')[0]
      }),
      // If reached the end of the book, mark as completed
      ...(currentPage >= (bookToUpdate.pageCount || 0) ? {
        status: 'completed',
        endDate: new Date().toISOString().split('T')[0]
      } : {})
    };
    
    return await updateBook(updatedBook);
  };

  const value: BookContextType = {
    books,
    loading,
    getBook,
    addBook,
    updateBook,
    deleteBook,
    updateBookStatus,
    updateBookProgress
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};

// Custom hook for using the context
export const useBooks = () => useContext(BookContext);