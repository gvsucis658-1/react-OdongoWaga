import { useState } from 'react';
import './BookList.css';

function BookList() {
  const [books, setBooks] = useState([
    { id: 1, title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960 },
    { id: 2, title: '1984', author: 'George Orwell', year: 1949 },
    { id: 3, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925 },
    { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', year: 1813 },
    { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', year: 1951 },
  ]);
  
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    author: '',
    year: ''
  });

  const handleEditClick = (book) => {
    setEditingId(book.id);
    setEditFormData({
      title: book.title,
      author: book.author,
      year: book.year
    });
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData({
      ...editFormData,
      [name]: name === 'year' ? parseInt(value, 10) || '' : value
    });
  };

  const handleEditFormSubmit = (event) => {
    event.preventDefault();
    
    const updatedBooks = books.map(book => {
      if (book.id === editingId) {
        return {
          ...book,
          title: editFormData.title,
          author: editFormData.author,
          year: editFormData.year
        };
      }
      return book;
    });
    
    setBooks(updatedBooks);
    setEditingId(null);
  };

  return (
    <div className="book-list">
      <h1>Book Collection</h1>
      <ul>
        {books.map(book => (
          <li key={book.id} className="book-item">
            {editingId === book.id ? (
              <form onSubmit={handleEditFormSubmit} className="edit-form">
                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Author:</label>
                  <input
                    type="text"
                    name="author"
                    value={editFormData.author}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Year:</label>
                  <input
                    type="number"
                    name="year"
                    value={editFormData.year}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
                <div className="button-group">
                  <button type="submit" className="save-button">Save</button>
                  <button type="button" onClick={handleCancelClick} className="cancel-button">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h3>{book.title}</h3>
                <p>Author: {book.author}</p>
                <p>Year: {book.year}</p>
                <button onClick={() => handleEditClick(book)} className="edit-button">Edit</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BookList;