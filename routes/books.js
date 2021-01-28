var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

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
  const books = await Book.findAll();
  res.render('books/index', { books });
}));



module.exports = router;
