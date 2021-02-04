const express = require('express');
const router = express.Router();

// Import instance of Book model
const Book = require('../models').Book;

// Import sequelize comparison operators
const { Op } = require("sequelize");

// Exceeds pagination requirement
const paginate = require('express-paginate');

// Create new error to be forwarded to global error handler
const err = new Error();
err.status = 404;
err.message = `Oops! Looks like this page doesn't exist.`;

// Async helper function
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

  // Exceeds search requirement. Get value with req.query.search
  const search = req.query.search;
  let books;

  /*
    [Op.or] Sequelize OR || operator. [Op.like] for partial matches. %search%. findAndCountAll
    used for pagination and contains the number of books returned in the .count property. 
    .rows are the books themselves
   */
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
  // Calculate number of pages
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
router.post('/', asyncHandler(async (req, res) => {
  let book;
  try {
    // Create a book
    await Book.create(req.body);
    res.redirect("/");
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      /* 
        If theres an error use .build() to create a non-persistent model instance. 
        to allow sequelize to retrieve an instance if there is an error
        .build() is a two step process needing .save() to be called as well to
        make an instance. 
      */
      book = await Book.build(req.body);
      res.render("books/new-book", { book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
  }
}));

/* GET individual book to update with form */
router.get("/:id", asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render("books/update-book", { book, title: "Update Book" });
  } else {
    // Forward the error to the global error handler
    next(err);
  }
}));

/* Update book */
router.post('/:id', asyncHandler(async (req, res, next) => {
  let book;
  try {
    // req.params.id grabs value from url. findByPk queries the db for the correct entry
    book = await Book.findByPk(req.params.id);
    if (book) {
      // If the book exists, update it with the new data
      await book.update(req.body);
      res.redirect('/');
    } else {
      next(err);
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
router.post('/:id/delete', asyncHandler(async (req, res, next) => {
  // Retrieve book to delete
  const book = await Book.findByPk(req.params.id);
  if (book) {
    // If it exists, delete it with .destroy() which is a permanent deletion.
    await book.destroy();
    res.redirect('/');
  } else {
    next(err);
  }
}));


module.exports = router;
