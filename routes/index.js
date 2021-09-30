const express = require("express");
const router = express.Router();
const Book = require("../models/book");

// Setting the index page
router.get("/", async (req, res) => {
  let books;
  try {
    // Getting a list of the books avaible to render
    books = await Book.find().sort({ createdAt: "desc" }).limit(10).exec();
  } catch {
    books = [];
  }
  // Render the index page with the books
  res.render("index", { books: books });
});

module.exports = router;
