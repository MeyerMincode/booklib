# Core Screen Designs for BookShelf App

## 1. Library View

**Purpose:** Main screen that displays the user's book collection

### Layout Design:
- **Header**
  - App title "BookShelf" 
  - Search icon button (top-right)
  - Filter/Sort button (top-right)

- **Reading Status Tabs**
  - Horizontal scrollable tabs:
    - All Books
    - Currently Reading
    - Want to Read
    - Completed

- **Book Grid/List Toggle**
  - Option to switch between grid view (visual, cover-focused) and list view (text-focused with details)

- **Book Collection Display**
  - Grid View: 2-3 books per row showing covers
  - List View: Title, author, small thumbnail, reading progress indicator

- **Add Book Button**
  - Floating action button (bottom-right corner)
  - "+" icon to add new books

- **Bottom Navigation**
  - Library (active)
  - Stats
  - Settings

### Interactions:
- Tapping a book navigates to Book Details screen
- Pull-to-refresh updates the library
- Long-press on book shows quick actions (mark as read, delete, etc.)

---

## 2. Add Book Screen

**Purpose:** Form to add/edit book information

### Layout Design:
- **Header**
  - "Add New Book" title
  - Close button (top-left)
  - Save button (top-right)

- **Book Cover Section**
  - Cover image placeholder/preview
  - "Add Cover" button to upload or take photo
  - Option to select color for books without covers

- **Book Information Form**
  - Title field (required)
  - Author field (required)
  - Genre dropdown/selector
  - Publication date picker
  - ISBN field (optional)
  - Page count field (numeric)

- **Reading Status Selector**
  - Radio buttons or segmented control:
    - Want to Read
    - Currently Reading
    - Completed

- **Additional Fields**
  - Reading start date (optional)
  - Reading end date (optional)
  - Personal rating (5-star system)
  - Notes/description text area

### Interactions:
- Form validation for required fields
- Save button adds the book and returns to Library View
- Cancel button discards changes and returns to previous screen

---

## 3. Book Details Screen

**Purpose:** Displays comprehensive information about a specific book

### Layout Design:
- **Header**
  - Back button (top-left)
  - Edit button (top-right)
  - Delete button or more options menu (three dots)

- **Book Cover Display**
  - Large cover image
  - Reading status badge overlay

- **Essential Information**
  - Title (large, prominent)
  - Author(s)
  - Genre
  - Publication date
  - Page count

- **Reading Progress Section**
  - Status indicator (Want to Read/Currently Reading/Completed)
  - If "Currently Reading": Progress bar/tracker
  - Start/End dates (if available)
  - Personal rating (if completed)

- **Details Section**
  - ISBN
  - Publisher (if available)
  - Edition information (if available)
  - Language

- **Personal Notes**
  - Expandable text area for user's notes and thoughts

- **Action Buttons**
  - Update reading status
  - Update progress (if applicable)
  - Add notes
  - Share (future feature)

### Interactions:
- Edit button navigates to Add Book screen pre-populated with current data
- Swipe left/right to navigate between books (optional feature)
- Back button returns to Library View
- Update reading status allows quick status changes

---

These screen designs provide a foundation for the BookShelf app's core functionality. Each screen focuses on a specific user task while maintaining coherent navigation between them.