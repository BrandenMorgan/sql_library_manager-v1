const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Exceeds pagination requirement
const paginate = require('express-paginate');

// Import index and books routes
const index = require('./routes/index');
const books = require('./routes/books');

// Create instance of express
const app = express();

// Import instance of Sequelize
const sequelize = require('./models/index').sequelize;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware/boiler plate code generated by express application generator
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(paginate.middleware(10, 50));
app.use('/', index);
app.use('/books', books);

// Catch 404 and forward to global error handler
app.use((req, res, next) => {
  console.log("404 error handler called");
  const err = new Error();
  err.status = 404;
  err.message = `Oops! Looks like this page doesn't exist.`;
  next(err)
});

// Global error handler
app.use((err, req, res, next) => {
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
});

(async () => {
  try {
    // Test the connection to the database 
    await sequelize.authenticate();
    console.log('Connection to the database successful!');

    // Sync the models
    await sequelize.sync();
    console.log('Synchronizing the models with the database...');

    // Catch any errors
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
