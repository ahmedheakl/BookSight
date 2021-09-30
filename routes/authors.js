const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");

router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index", { authors: authors, searchOptions: req.query });
  } catch {
    res.redirect("/");
  }
});

router.get("/new", async (req, res) => {
  res.render("authors/new", { author: new Author() });
});

router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });
  try {
    const newAuth = await author.save();
    res.redirect(`authors/${newAuth.id}`);
    // res.redirect("authors");
  } catch {
    res.render("authors/new", {
      author: author,
      errMessage: "Error Creating an Author",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id }).limit(6).exec();
    res.render("authors/view", { author: author, books: books });
  } catch {
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  const author = await Author.findById(req.params.id);
  res.render("authors/edit", { author: author });
});

router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    console.log("DONE");
    res.redirect(`/authors/${author.id}`);
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.render(`authors/edit`, {
        author: author,
        errMessage: "Error Updating an Author",
      });
    }
  }
});

router.delete("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    await author.remove();
    res.redirect("/authors");
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.redirect(`/authors/${author.id}`);
    }
  }
});

module.exports = router;
