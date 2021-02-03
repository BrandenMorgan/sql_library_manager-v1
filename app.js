var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const paginate = require('express-paginate');

const index = require('./routes/index');
const books = require('./routes/books');

var app = express();
// Import instance of Sequelize
var sequelize = require('./models/index').sequelize;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(paginate.middleware(10, 50));
app.use('/', index);
app.use('/books', books);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log("404 error handler called");
  const err = new Error();
  err.status = 404;
  err.message = `Oops! looks like this page doesn't exist.`;
  next(err)
  // next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (err) {
    console.log('Global error handler called', err);
  }
  if (err.status === 404) {
    console.log("404: ", err.status);
    res.status(404).render('page-not-found', { err })
  } else {
    console.log("500 or other: ", err.status);
    err.message = err.message || `Oops! It looks like something went wrong on the server`;
    res.status(err.status || 500).render('error', { err });
  }

  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');
});

(async () => {
  try {
    // Test the connection to the database 
    await sequelize.authenticate();
    console.log('Connection to the database successful!');

    // Sync the models
    await sequelize.sync();
    console.log('Synchronizing the models with the database...');

  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      console.error('Validation errors: ', errors);
    } else {
      throw error;
    }
  }
})();

module.exports = app;
