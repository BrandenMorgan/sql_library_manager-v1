var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

const err = new Error();
err.status = 404;
err.message = `Looks like the book you want to delete doesn't exist`;


function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  }
}

// /* GET search results */
// router.get('/:search', asyncHandler(async (req, res) => {
//   const search = req.params.search;
//   console.log(search);
// }));

/* GET books listing. */
router.get('/', asyncHandler(async (req, res) => {
  const search = req.query.search;
  // if (search) {
  //   console.log("search: ", search);
  // }
  const books = await Book.findAll();
  for (const book in books) {
    const title = books[book].title;
    const author = books[book].author;
    const genre = books[book].genre;
    const year = books[book].year;

    console.log(`Title: ${title}, Author: ${author}, Genre: ${genre}, Year: ${year}`);

    // if (search.includes(books[book])) {
    //   console.log("Your search has results!")
    // }
  }

  res.render('books/index', { books });
}));

/* Create new book form */
router.get('/new', (req, res) => {
  res.render("books/new-book", { book: {}, title: "New Book" });
});

/* POST create book */
// /books/new - post ?
router.post('/', asyncHandler(async (req, res) => {
  let book;
  try {
    await Book.create(req.body);
    res.redirect("/");
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("books/new-book", { book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
  }
}));

/* GET individual book to update with form */
router.get("/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render("books/update-book", { book, title: "Update Book" });
  } else {
    res.render("page-not-found", { err });
  }
}));

/* Update book */
router.post('/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect('/');
    } else {
      res.render("page-not-found", { err });
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("books/update-book", { book, errors: error.errors, title: "update-book" });
    } else {
      throw error;
    }
  }
}));

/* POST delete book */
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect('/');
  } else {
    res.render("page-not-found", { err });
  }
}));


module.exports = router;
