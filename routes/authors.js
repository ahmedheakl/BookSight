// Import the express and Mongoose models
const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");

// Main route for authors
router.get("/", async (req, res) => {
  // Getting the value of the authors search
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }

  // Try and catch of the error
  try {
    // Finding all the authors to be displayed
    const authors = await Author.find(searchOptions);

    // Render the index page with all authors
    res.render("authors/index", { authors: authors, searchOptions: req.query });
  } catch {
    // if an error happens redirect us to the index page
    res.redirect("/");
  }
});

// Setting the new author route
router.get("/new", async (req, res) => {
  // Rendering the 'new' ejs page with a new author
  res.render("authors/new", { author: new Author() });
});

// Setting the addition process of a new author
router.post("/", async (req, res) => {
  // Setting the name of the author
  const author = new Author({
    name: req.body.name,
  });

  // Try and catch of the error
  try {
    // Save the author data and redirect to its page
    const newAuth = await author.save();
    res.redirect(`authors/${newAuth.id}`);
  } catch {
    // if there's an error, render the 'new' page
    // with an error message
    res.render("authors/new", {
      author: author,
      errMessage: "Error Creating an Author",
    });
  }
});

// Setting each author page
router.get("/:id", async (req, res) => {
  // Try and catch of the error
  try {
    // Get the desired author and a list of his books
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id }).limit(6).exec();

    // Render the author's page with his data
    res.render("authors/view", { author: author, books: books });
  } catch {
    // if there's an error, go to the index page
    res.redirect("/");
  }
});

// Setting the edit page of the author
router.get("/:id/edit", async (req, res) => {
  // Get the desired author by his id,
  // then render the edit page with his data
  const author = await Author.findById(req.params.id);
  res.render("authors/edit", { author: author });
});

// Setting the editing logic of the author
router.put("/:id", async (req, res) => {
  let author;

  // Try and catch of the error
  try {
    // Get the desired author, edit his data, and save
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();

    // Go to the author's view page
    res.redirect(`/authors/${author.id}`);
  } catch {
    // if there's no author, go to the index page
    if (author == null) {
      res.redirect("/");
    } else {
      // if there's an error, render
      // the edit page with an error message
      res.render(`authors/edit`, {
        author: author,
        errMessage: "Error Updating an Author",
      });
    }
  }
});

// Handling the delete logic of the author
router.delete("/:id", async (req, res) => {
  let author;

  // Try and catch of the error
  try {
    // Get the deisred author and remove him
    author = await Author.findById(req.params.id);
    await author.remove();
    res.redirect("/authors");
  } catch {
    // if there's no author, go to the index page
    if (author == null) {
      res.redirect("/");
    } else {
      // if there's an error, go the author's page
      res.redirect(`/authors/${author.id}`);
    }
  }
});

module.exports = router;
