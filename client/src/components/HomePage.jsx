import { useEffect, useState } from "react"
import axios from "axios";
import { Link } from "react-router-dom";
import './HomePage.css';

export default function HomePage(){
    const [ebooks,setEbooks] = useState([{book_title:"harry potter",author_name:"nimrat","description":"gjfdhdgd",price:100},{book_title:"harry potter",author_name:"nimrat","description":"gjfdhdgd",price:100},{book_title:"harry potter",author_name:"nimrat","description":"gjfdhdgd",price:100},{book_title:"harry potter",author_name:"nimrat","description":"gjfdhdgd",price:100},{book_title:"harry potter",author_name:"nimrat","description":"gjfdhdgd",price:100}]);
    
    const getAllBooks = async () => {
        const books = await axios.get("http://localhost:3005/allBooks");
        console.log(books.data.data)
        setEbooks(books.data.data)
    } 

    useEffect(()=>{
       getAllBooks()
    },[])

    return (
        <div className="homePage">
            <div className="links">
            <Link to="/signIn">Sign In</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/UserBooks">My Books</Link>
            </div>
            {ebooks && (
                <div className="booksSection">
                    {ebooks.map((book)=>(
               <div className="bookContainer">
                 <h3 key={book.book_title}>{book.book_title}</h3>
                 <span>Author: {book.author_name}</span>
                 <p>{book.description}</p>
                 <h2>${book.price}</h2>
                 <button>Read</button>
                </div>
            ))}
                    </div> 
            )}
             
        </div>
    )
}