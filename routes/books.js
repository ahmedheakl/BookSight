const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const imageMimeTypes = ["image/jpeg", "image/png", "images/gif"];

// All Books Route
router.get("/", async (req, res) => {
  // Initializing the query
  let query = Book.find();

  // Setting the query data
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    // Execture the query then render the index page with results
    const books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query,
    });
  } catch {
    // if there's an error go to the index page
    res.redirect("/");
  }
});

// New Book Route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

// Create Book Route
router.post("/", async (req, res) => {
  // Initializing a new book and setting its params
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });
  saveCover(book, req.body.cover);

  try {
    // Save the book data and go to its page
    const newBook = await book.save();
    res.redirect(`books/${newBook.id}`);
  } catch {
    // if there's an error, render a page with an error message
    renderNewPage(res, book, true);
  }
});

// A book view page
router.get("/:id", async (req, res) => {
  try {
    // Getting the desired book
    const book = await Book.findById(req.params.id).populate("author").exec();

    // render the book view page
    res.render("books/view", { book: book });
  } catch {
    // if there's an error go to the index page
    res.redirect("/");
  }
});

// The edit page for books
router.get("/:id/edit", async (req, res) => {
  try {
    // Getting the desired book and authors
    const book = await Book.findById(req.params.id);
    const authors = await Author.find({});

    // render the edit page with the authors and book's data
    res.render("books/edit", { book: book, authors: authors });
  } catch {
    // if there's an error, go to
    // the book's view page with an error message
    res.redirect(`/books/${req.params.id}`, {
      message: "Cannot Edit the book",
    });
  }
});

// The editing logic of books
router.put("/:id", async (req, res) => {
  let book;
  try {
    // Getting the desired book and setting its params
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;

    if (req.body.cover != null && req.body.cover != "") {
      saveCover(book, req.body.cover);
    }

    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch {
    // if there's an error, go to
    // the book's view page with an error
    renderNewPage(res, book, true);
  }
});

// The delete logic for books
router.delete("/:id", async (req, res) => {
  let book;
  try {
    // Get the desired book then remove it
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect(`/books`);
  } catch {
    // if there's no book, go to the index page
    if (book == null) {
      res.redirect("/");
    } else {
      // if there's an error,
      //  render the book's page with an error message
      res.render("books/view", {
        book,
        errorMessage: "Could not delete the book",
      });
    }
  }
});

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) params.errorMessage = "Error creating/updating Book";
    res.render("books/new", params);
  } catch {
    res.redirect("/books");
  }
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
