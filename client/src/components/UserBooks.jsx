import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function UserBooks() {
    const [ebooks, setEbooks] = useState([]);
    const [formVisibility, setFormVisibility] = useState(false);
    const [title, setTitle] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [subtitle, setSubTitle] = useState("");
    const [file, setFile] = useState(null); // Set to null initially

    const getUserBooks = async () => {
        const books = await axios.post("http://localhost:3005/myBooks", {}, {
            withCredentials: true,  // Ensure cookies are sent with the request
            headers: {
                'Content-Type': 'application/json',
            }
        });
    
        if (books) {
            console.log(books.data.data);
            setEbooks(books.data.data);
        }
    };
    
    

    const handleForm = () => {
        setFormVisibility(true);
    };

    const handleAddBook = async () => {
        console.log(file); // Check file is set correctly
        const formData = new FormData();
        formData.append('book_title', title);
        formData.append('author_name', name);
        formData.append('price', price);
        formData.append('description', description);
        formData.append('subtitle', subtitle);
        formData.append('author_email', "sim@gmail.com");
        formData.append('file', file); // Append file object

        for (const pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }

        try {
            const result = await axios.post("http://localhost:3005/addBook", formData,{withCredentials:true}, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Important for file uploads
                }
            });
            console.log(result.data);
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Properly set the file from the input
    };

    useEffect(() => {
       getUserBooks();
    }, []);

    return (
        <div className='userBooks'>
            <div className="links" style={{ margin: '5px', display: 'flex', justifyContent: 'space-between' }}>
                <Link to="/profile">Profile</Link>
                <Link to="/home">All Books</Link>
                <button onClick={handleForm}>Add Book</button>
            </div>
            {ebooks.map((book) => (
                <div className="bookContainer" style={{ border: '1px solid black', borderRadius: '10px', padding: '10px' }} key={book.book_title}>
                    <h3>{book.book_title}</h3>
                </div>
            ))}
            {formVisibility && (
                <dialog open={formVisibility}>
                    <h3>Add New Book</h3>
                    <div className='addBookContainer' style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input name='Book Title' placeholder='Enter book title' value={title} onChange={(e) => setTitle(e.target.value)} />
                        <input name='Author Name' placeholder='Enter author name' value={name} onChange={(e) => setName(e.target.value)} />
                        <input name='Description' placeholder='Enter description' value={description} onChange={(e) => setDescription(e.target.value)} />
                        <input name='SubTitle' placeholder='Enter subtitle' value={subtitle} onChange={(e) => setSubTitle(e.target.value)} />
                        <input name='Book Price' placeholder='Enter book price' value={price} onChange={(e) => setPrice(e.target.value)} />
                        <input type='file' onChange={handleFileChange} /> {/* Correctly handle file input */}
                        <button onClick={handleAddBook}>Save</button>
                    </div>
                </dialog>
            )}
        </div>
    );
}

export default UserBooks;
