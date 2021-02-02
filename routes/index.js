var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', (req, res, next) => {
  // res.render('index', { title: 'Express' });
  // const books = await Book.findAll();
  // res.json(books);
  res.redirect("/books");
});

module.exports = router;
