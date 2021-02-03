var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");
const paginate = require('express-paginate');

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


/* GET books listing. */
router.get('/', asyncHandler(async (req, res) => {
  const search = req.query.search;
  let books;
  if (search) {
    books = await Book.findAndCountAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${search}%`
            }
          },
          {
            author: {
              [Op.like]: `%${search}%`
            }
          },
          {
            genre: {
              [Op.like]: `%${search}%`
            }
          },
          {
            year: {
              [Op.like]: `%${search}%`
            }
          }
        ]
      },
      limit: req.query.limit,
      offset: req.skip,
      order: [['createdAt', 'DESC']]
    });
  } else {
    books = await Book.findAndCountAll({
      limit: req.query.limit,
      offset: req.skip,
      order: [['createdAt', 'DESC']]
    });
  }
  const bookCount = books.count;
  const pageCount = Math.ceil(books.count / req.query.limit);
  res.render('books/index', {
    books: books.rows, // Returns different obj from findAll()
    pageCount,
    bookCount,
    pages: paginate.getArrayPages(req)(3, pageCount, req.query.page)
  });
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
