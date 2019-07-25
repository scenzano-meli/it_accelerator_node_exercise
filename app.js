var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var agenciesRouter = require('./routes/agencies');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Bootstrap 4 y librerías necesarias
app.use('/bootstrapcss', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/bootstrapjs', express.static(__dirname + '/node_modules/jquery'));
app.use('/bootstrapjs', express.static(__dirname + '/node_modules/popper.js/dist'));
app.use('/bootstrapjs', express.static(__dirname + '/node_modules/bootstrap/dist/js'));

//app.use('/', indexRouter);
app.use('/', agenciesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
