const express = require("express");
const router = express.Router();
const Book = require("../models/book");

// Setting the index page
router.get("/", async (req, res) => {
  // Getting a list of the books avaible to render
  const books = await Book.find({});

  // Render the index page with the books
  res.render("index", { books: books });
});

module.exports = router;
