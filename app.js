var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var auth = require('auth');

var accentRouter = require('./routes/accent');
var listRouter = require('./routes/list');
var expireRouter = require('./routes/expire');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var dataRouter = require('./routes/data');
var watchRouter = require('./routes/watch');

var app = express();

// view engine setup
app.engine('art', require('express-art-template'));
app.set('view options', {
  debug: process.env.NODE_ENV !== 'production'
  // debug:process.env.NODE_ENV = 'development'
})
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'art');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouter);
app.use(auth); //权限验证
app.use('/accent', accentRouter);
app.use('/list', listRouter);
app.use('/data', dataRouter);
app.use('/watch', watchRouter);
app.use('/expire', expireRouter);
app.use('/user', userRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log('err:', err)
  res.render('error');
});

module.exports = app;