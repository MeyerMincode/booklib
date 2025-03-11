import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useBooks } from '../../context/BookContext';

// Types
interface Book {
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

// Mock data retrieval function
const getBook = (id: string): Book | null => {
  // This would be replaced by actual data fetching from your storage solution
  const mockBooks: Record<string, Book> = {
    '1': {
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
    '2': {
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
    '3': {
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
  };
  
  return mockBooks[id] || null;
};

export default function BookDetailsScreen(): JSX.Element {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getBook, updateBookStatus, updateBookProgress, deleteBook, loading } = useBooks();
  const [book, setBook] = useState(params.id ? getBook(params.id) : undefined);

  useEffect(() => {
    if (params.id) {
      const fetchedBook = getBook(params.id);
      setBook(fetchedBook);
    }
  }, [params.id, getBook]);

  const handleEditBook = () => {
    if (book) {
      // Navigate to edit book screen
      router.push({
        pathname: '/modals/add-book',
        params: { id: book.id },
      });
    }
  };

  const handleUpdateStatus = () => {
    if (!book) return;

    Alert.alert(
      'Update Reading Status',
      'Select the new reading status',
      [
        {
          text: 'Want to Read',
          onPress: async () => {
            const updated = await updateBookStatus(book.id, 'wantToRead');
            setBook(updated);
          },
        },
        {
          text: 'Currently Reading',
          onPress: async () => {
            const updated = await updateBookStatus(book.id, 'reading');
            setBook(updated);
          },
        },
        {
          text: 'Completed',
          onPress: async () => {
            const updated = await updateBookStatus(book.id, 'completed');
            setBook(updated);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleUpdateProgress = () => {
    if (!book) return;
    
    // In a real app, this would open a proper progress update modal
    Alert.prompt(
      'Update Progress',
      'Enter current page:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: async (pageText) => {
            const page = parseInt(pageText || '0', 10);
            if (isNaN(page) || page < 1 || !book.pageCount || page > book.pageCount) {
              Alert.alert('Invalid Page', 'Please enter a valid page number');
              return;
            }
            
            const updated = await updateBookProgress(book.id, page);
            setBook(updated);
          },
        },
      ],
      'plain-text',
      book.currentPage?.toString() || '0'
    );
  };

  const handleDeleteBook = () => {
    if (!book) return;
    
    Alert.alert(
      'Delete Book',
      'Are you sure you want to remove this book from your library?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteBook(book.id);
            router.back();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6da7" />
        <Text style={styles.loadingText}>Loading book details...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Book not found</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Format the reading status label
  const getStatusLabel = () => {
    switch (book.status) {
      case 'wantToRead':
        return 'Want to Read';
      case 'reading':
        return 'Currently Reading';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  // Calculate reading progress if applicable
  const getProgressPercentage = () => {
    if (book.status === 'reading' && book.currentPage && book.pageCount) {
      return Math.round((book.currentPage / book.pageCount) * 100);
    }
    return 0;
  };

  // Render star rating component
  const renderRating = () => {
    if (!book.rating) return null;
    
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= book.rating ? 'star' : 'star-outline'}
          size={20}
          color="#ffc107"
        />
      );
    }
    
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Your Rating: </Text>
        <View style={styles.starsContainer}>{stars}</View>
      </View>
    );
  };

  return (
    <>
      <StatusBar style="auto" />
      <Stack.Screen 
        options={{ 
          title: book.title,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleEditBook} style={styles.headerButton}>
                <Ionicons name="pencil" size={22} color="#4a6da7" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteBook} style={styles.headerButton}>
                <Ionicons name="trash-outline" size={22} color="#4a6da7" />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <ScrollView style={styles.container}>
        {/* Book Cover and Essential Info */}
        <View style={styles.heroSection}>
          <View style={styles.coverContainer}>
            {book.coverImage ? (
              <Image source={{ uri: book.coverImage }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Text style={styles.coverPlaceholderText}>{book.title.charAt(0)}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{getStatusLabel().charAt(0)}</Text>
                </View>
              </View>
            )}
          </View>
          
          <View style={styles.essentialInfo}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>by {book.author}</Text>
            {book.genre && (
              <Text style={styles.bookGenre}>{book.genre}</Text>
            )}
            {book.publicationDate && (
              <Text style={styles.bookDetail}>Published: {book.publicationDate}</Text>
            )}
            {book.pageCount && (
              <Text style={styles.bookDetail}>{book.pageCount} pages</Text>
            )}
          </View>
        </View>
        
        {/* Reading Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIndicator, styles[`status${book.status}`]]}>
                <Text style={styles.statusText}>{getStatusLabel()}</Text>
              </View>
              <TouchableOpacity onPress={handleUpdateStatus}>
                <Text style={styles.updateButton}>Update</Text>
              </TouchableOpacity>
            </View>
            
            {/* Progress bar for Currently Reading */}
            {book.status === 'reading' && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${getProgressPercentage()}%` }
                    ]} 
                  />
                </View>
                <View style={styles.progressStats}>
                  <Text style={styles.progressText}>
                    Page {book.currentPage} of {book.pageCount}
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {getProgressPercentage()}%
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.updateProgressButton}
                  onPress={handleUpdateProgress}
                >
                  <Text style={styles.updateProgressText}>Update Progress</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Start/End Dates */}
            <View style={styles.datesContainer}>
              {book.startDate && (
                <Text style={styles.dateText}>
                  Started: {book.startDate}
                </Text>
              )}
              {book.endDate && (
                <Text style={styles.dateText}>
                  Finished: {book.endDate}
                </Text>
              )}
            </View>
            
            {/* Rating (if completed) */}
            {book.status === 'completed' && renderRating()}
          </View>
        </View>
        
        {/* Book Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Details</Text>
          <View style={styles.detailsCard}>
            {book.isbn && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ISBN:</Text>
                <Text style={styles.detailValue}>{book.isbn}</Text>
              </View>
            )}
            {book.publisher && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Publisher:</Text>
                <Text style={styles.detailValue}>{book.publisher}</Text>
              </View>
            )}
            {book.language && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Language:</Text>
                <Text style={styles.detailValue}>{book.language}</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Notes Section */}
        {book.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{book.notes}</Text>
            </View>
          </View>
        )}
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  heroSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  coverContainer: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginRight: 16,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4a6da7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coverPlaceholderText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
  },
  statusBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  essentialInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  bookGenre: {
    fontSize: 14,
    color: '#4a6da7',
    marginBottom: 8,
  },
  bookDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statuswantToRead: {
    backgroundColor: '#f39c12',
  },
  statusreading: {
    backgroundColor: '#3498db',
  },
  statuscompleted: {
    backgroundColor: '#2ecc71',
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  updateButton: {
    color: '#4a6da7',
    fontWeight: '600',
    fontSize: 14,
  },
  progressContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e1e1e1',
    borderRadius: 5,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: 'bold',
  },
  updateProgressButton: {
    backgroundColor: '#3498db',
    borderRadius: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  updateProgressText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  datesContainer: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  notesCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  bottomSpacer: {
    height: 40,
  },
  button: {
    backgroundColor: '#4a6da7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});