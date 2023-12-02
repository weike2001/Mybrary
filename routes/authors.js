const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");

// All Authors Route
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    // req.query contains the query parameters from the URL.
    res.render("authors/index", { authors: authors, searchOptions: req.query }); // render the authors/index.ejs
  } catch {
    res.redirect("/");
  }
});

// New Authors Route
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

// Create Authors Route
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });

  try {
    const newAuthor = await author.save();
    // Redirect or handle success
    res.redirect(`authors/${newAuthor.id}`);
  } catch (err) {
    res.render("authors/new", {
      author: author,
      errorMessage: "Error creating Author",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id }).limit(6).exec();
    res.render("authors/show", {
      author: author,
      booksByAuthor: books,
    });
  } catch (err) {
    //console.log(err)
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", { author: author });
  } catch {
    res.redirect("/authors");
  }
});

router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    // Redirect or handle success
    res.redirect(`/authors/${author.id}`);
  } catch (err) {
    if (author == null) {
      res.redirect("/");
    } else {
      res.render("authors/edit", {
        author: author,
        errorMessage: "Error updating Author",
      });
    }
  }
});

router.delete("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    if (!author) {
      // Author not found
      return res.redirect("/authors");
    }

    await author.deleteOne(); // This should trigger your middleware
    res.redirect("/authors");
  } catch (err) {
    if (author) {
      // Redirect to the author's page if the author was found but deletion failed
      res.redirect(`/authors/${author.id}`);
    } else {
      // Redirect to the main authors page if the author was not found
      res.redirect("/authors");
    }
  }
});

module.exports = router;
