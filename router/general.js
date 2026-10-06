const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        const userExists = users.some(user => user.username === username);
        if (!userExists) {
            users.push({ "username": username, "password": password });
            return res.status(201).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(409).json({ message: "User already exists!" });
        }
    }
    return res.status(400).json({ message: "Unable to register user. Please provide both username and password." });
});

// Task 1 & Task 10: Get the book list available in the shop using Async/Await
public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => {
            return new Promise((resolve) => {
                resolve(books);
            });
        };
        const allBooks = await getBooks();
        return res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// Task 2 & Task 11: Get book details based on ISBN using Async/Await
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const getBookByIsbn = (isbn) => {
            return new Promise((resolve, reject) => {
                if (books[isbn]) {
                    resolve(books[isbn]);
                } else {
                    reject("Book not found");
                }
            });
        };
        const book = await getBookByIsbn(isbn);
        return res.status(200).json(book);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

// Task 3 & Task 12: Get book details based on author using Async/Await
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        const getBooksByAuthor = (author) => {
            return new Promise((resolve, reject) => {
                const booksByAuthor = [];
                for (const bookId in books) {
                    if (books[bookId].author.toLowerCase() === author.toLowerCase()) {
                        booksByAuthor.push(books[bookId]);
                    }
                }
                if (booksByAuthor.length > 0) {
                    resolve(booksByAuthor);
                } else {
                    reject("No books found by this author");
                }
            });
        };
        const matchingBooks = await getBooksByAuthor(author);
        return res.status(200).json(matchingBooks);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

// Task 4 & Task 13: Get all books based on title using Async/Await
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;
        const getBooksByTitle = (title) => {
            return new Promise((resolve, reject) => {
                const booksByTitle = [];
                for (const bookId in books) {
                    if (books[bookId].title.toLowerCase() === title.toLowerCase()) {
                        booksByTitle.push(books[bookId]);
                    }
                }
                if (booksByTitle.length > 0) {
                    resolve(booksByTitle);
                } else {
                    reject("No books found with this title");
                }
            });
        };
        const matchingBooks = await getBooksByTitle(title);
        return res.status(200).json(matchingBooks);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

// Task 5: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Reviews not found for this book" });
    }
});

module.exports.general = public_users;
