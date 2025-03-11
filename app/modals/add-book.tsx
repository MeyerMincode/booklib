import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useBooks } from '../../context/BookContext';
import { useLocalSearchParams } from 'expo-router';

interface BookData {
  title: string;
  author: string;
  genre: string;
  publicationDate: string;
  isbn: string;
  pageCount: string;
  coverImage: string | null;
  status: ReadingStatus;
  startDate: string;
  endDate: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string | null;
}

type ReadingStatus = 'wantToRead' | 'reading' | 'completed';

interface StatusOption {
  id: ReadingStatus;
  label: string;
}

const READING_STATUSES: StatusOption[] = [
  { id: 'wantToRead', label: 'Want to Read' },
  { id: 'reading', label: 'Currently Reading' },
  { id: 'completed', label: 'Completed' },
];

const GENRES: string[] = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Romance',
  'Biography',
  'History',
  'Self-Help',
  'Other',
];

export default function AddBookScreen(): JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { getBook, addBook, updateBook } = useBooks();

  const isEditing = Boolean(params.id);

  const [bookData, setBookData] = useState<BookData>({
    title: '',
    author: '',
    genre: '',
    publicationDate: '',
    isbn: '',
    pageCount: '',
    coverImage: null,
    status: 'wantToRead',
    startDate: '',
    endDate: '',
    notes: '',
  });

  useEffect(() => {
    if (isEditing && params.id) {
      const existingBook = getBook(params.id);
      if (existingBook) {
        setBookData({
          title: existingBook.title,
          author: existingBook.author,
          genre: existingBook.genre || '',
          publicationDate: existingBook.publicationDate || '',
          isbn: existingBook.isbn || '',
          pageCount: existingBook.pageCount?.toString() || '',
          coverImage: existingBook.coverImage || null,
          status: existingBook.status,
          startDate: existingBook.startDate || '',
          endDate: existingBook.endDate || '',
          notes: existingBook.notes || '',
        });
      }
    }
  }, [params.id, getBook]);

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: keyof BookData, value: string): void => {
    setBookData({
      ...bookData,
      [field]: value,
    });

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const pickImage = async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleChange('coverImage', result.assets[0].uri);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!bookData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!bookData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    if (bookData.pageCount && isNaN(Number(bookData.pageCount))) {
      newErrors.pageCount = 'Page count must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (): Promise<void> => {
    if (validateForm()) {
      try {
        const numericPageCount = bookData.pageCount ? parseInt(bookData.pageCount, 10) : undefined;

        const bookToSave = {
          ...bookData,
          pageCount: numericPageCount
        };

        if (isEditing && params.id) {
          await updateBook({
            ...bookToSave,
            id: params.id,
          });
          Alert.alert('Success', 'Book updated successfully!');
        } else {
          await addBook(bookToSave);
          Alert.alert('Success', 'Book added to your library!');
        }

        router.back();
      } catch (error) {
        console.error('Error saving book:', error);
        Alert.alert(
          'Error',
          'There was a problem saving your book. Please try again.'
        );
      }
    } else {
      Alert.alert('Error', 'Please fill in all required fields correctly');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <StatusBar style="auto" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.coverSection}>
          {bookData.coverImage ? (
            <Image
              source={{ uri: bookData.coverImage }}
              style={styles.coverImage}
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="book" size={50} color="#aaa" />
            </View>
          )}
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>
              {bookData.coverImage ? 'Change Cover' : 'Add Cover'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Book Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={bookData.title}
              onChangeText={(text) => handleChange('title', text)}
              placeholder="Book title"
              placeholderTextColor="#aaa"
            />
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Author *</Text>
            <TextInput
              style={[styles.input, errors.author && styles.inputError]}
              value={bookData.author}
              onChangeText={(text) => handleChange('author', text)}
              placeholder="Author name"
              placeholderTextColor="#aaa"
            />
            {errors.author ? <Text style={styles.errorText}>{errors.author}</Text> : null}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Genre</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {GENRES.map((genre) => (
                  <TouchableOpacity
                    key={genre}
                    style={[
                      styles.genreChip,
                      bookData.genre === genre && styles.selectedGenreChip,
                    ]}
                    onPress={() => handleChange('genre', genre)}
                  >
                    <Text
                      style={[
                        styles.genreChipText,
                        bookData.genre === genre && styles.selectedGenreChipText,
                      ]}
                    >
                      {genre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Page Count</Text>
            <TextInput
              style={[styles.input, errors.pageCount && styles.inputError]}
              value={bookData.pageCount}
              onChangeText={(text) => handleChange('pageCount', text)}
              placeholder="Number of pages"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
            />
            {errors.pageCount ? <Text style={styles.errorText}>{errors.pageCount}</Text> : null}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ISBN</Text>
            <TextInput
              style={styles.input}
              value={bookData.isbn}
              onChangeText={(text) => handleChange('isbn', text)}
              placeholder="ISBN (optional)"
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Publication Date</Text>
            <TextInput
              style={styles.input}
              value={bookData.publicationDate}
              onChangeText={(text) => handleChange('publicationDate', text)}
              placeholder="YYYY-MM-DD (optional)"
              placeholderTextColor="#aaa"
            />
          </View>
        </View>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Reading Status</Text>
          <View style={styles.statusContainer}>
            {READING_STATUSES.map((status) => (
              <TouchableOpacity
                key={status.id}
                style={[
                  styles.statusOption,
                  bookData.status === status.id && styles.selectedStatusOption,
                ]}
                onPress={() => handleChange('status', status.id)}
              >
                <Text
                  style={[
                    styles.statusText,
                    bookData.status === status.id && styles.selectedStatusText,
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {bookData.status === 'reading' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Date</Text>
              <TextInput
                style={styles.input}
                value={bookData.startDate}
                onChangeText={(text) => handleChange('startDate', text)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#aaa"
              />
            </View>
          )}
          {bookData.status === 'completed' && (
            <View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  value={bookData.startDate}
                  onChangeText={(text) => handleChange('startDate', text)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>End Date</Text>
                <TextInput
                  style={styles.input}
                  value={bookData.endDate}
                  onChangeText={(text) => handleChange('endDate', text)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>
          )}
        </View>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={bookData.notes}
            onChangeText={(text) => handleChange('notes', text)}
            placeholder="Add your thoughts and notes about this book..."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
      <SafeAreaView style={[styles.buttonContainer, { zIndex: 999 }]}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>Save Book</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  coverSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  coverPlaceholder: {
    width: 120,
    height: 180,
    backgroundColor: '#e1e1e1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  coverImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  imageButton: {
    backgroundColor: '#4a6da7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  pickerContainer: {
    marginTop: 8,
  },
  genreChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedGenreChip: {
    backgroundColor: '#4a6da7',
  },
  genreChipText: {
    color: '#333',
  },
  selectedGenreChipText: {
    color: 'white',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusOption: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 6,
  },
  selectedStatusOption: {
    backgroundColor: '#4a6da7',
  },
  statusText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 13,
  },
  selectedStatusText: {
    color: 'white',
  },
  notesInput: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#4a6da7',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
});
