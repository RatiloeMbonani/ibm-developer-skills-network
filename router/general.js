const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

/**
 * Task 6: Register a new user
 * @route POST /register
 */
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ 
            status: "error",
            message: "Registration failed. Both username and password are required." 
        });
    }

    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ 
            status: "error",
            message: "Registration failed. Username already exists!" 
        });
    }

    users.push({ "username": username, "password": password });
    return res.status(201).json({ 
        status: "success",
        message: "User successfully registered. Now you can login." 
    });
});

/**
 * Task 1 & Task 10: Get all available books using Async/Await & Promises
 * @route GET /
 */
public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                if (books) {
                    resolve(books);
                } else {
                    reject(new Error("Unable to fetch book catalog. Database unavailable."));
                }
            });
        };

        const allBooks = await getBooks();
        return res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (err) {
        return res.status(500).json({ 
            status: "error",
            message: "Internal server error while fetching all books.",
            error: err.message || err 
        });
    }
});

/**
 * Task 2 & Task 11: Get book details based on ISBN using Async/Await & Promises
 * @route GET /isbn/:isbn
 */
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const { isbn } = req.params;

        const getBookByIsbn = (isbnKey) => {
            return new Promise((resolve, reject) => {
                if (books[isbnKey]) {
                    resolve(books[isbnKey]);
                } else {
                    reject(new Error(`Book with ISBN ${isbnKey} was not found.`));
                }
            });
        };

        const book = await getBookByIsbn(isbn);
        return res.status(200).json(book);
    } catch (err) {
        return res.status(404).json({ 
            status: "error",
            message: err.message || "Book not found." 
        });
    }
});

/**
 * Task 3 & Task 12: Get book details based on Author using Async/Await & Promises
 * @route GET /author/:author
 */
public_users.get('/author/:author', async function (req, res) {
    try {
        const { author } = req.params;

        const getBooksByAuthor = (authorName) => {
            return new Promise((resolve, reject) => {
                const booksByAuthor = [];
                for (const bookId in books) {
                    if (books[bookId].author.toLowerCase() === authorName.toLowerCase()) {
                        booksByAuthor.push(books[bookId]);
                    }
                }

                if (booksByAuthor.length > 0) {
                    resolve(booksByAuthor);
                } else {
                    reject(new Error(`No books found authored by '${authorName}'.`));
                }
            });
        };

        const matchingBooks = await getBooksByAuthor(author);
        return res.status(200).json(matchingBooks);
    } catch (err) {
        return res.status(404).json({ 
            status: "error",
            message: err.message || "No books found for specified author." 
        });
    }
});

/**
 * Task 4 & Task 13: Get book details based on Title using Async/Await & Promises
 * @route GET /title/:title
 */
public_users.get('/title/:title', async function (req, res) {
    try {
        const { title } = req.params;

        const getBooksByTitle = (titleQuery) => {
            return new Promise((resolve, reject) => {
                const booksByTitle = [];
                for (const bookId in books) {
                    if (books[bookId].title.toLowerCase() === titleQuery.toLowerCase()) {
                        booksByTitle.push(books[bookId]);
                    }
                }

                if (booksByTitle.length > 0) {
                    resolve(booksByTitle);
                } else {
                    reject(new Error(`No books found with title matching '${titleQuery}'.`));
                }
            });
        };

        const matchingBooks = await getBooksByTitle(title);
        return res.status(200).json(matchingBooks);
    } catch (err) {
        return res.status(404).json({ 
            status: "error",
            message: err.message || "No books found for specified title." 
        });
    }
});

/**
 * Task 5: Get book reviews based on ISBN
 * @route GET /review/:isbn
 */
public_users.get('/review/:isbn', function (req, res) {
    const { isbn } = req.params;

    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ 
            status: "error",
            message: `Reviews not found for ISBN ${isbn}.` 
        });
    }
});

module.exports.general = public_users;;
