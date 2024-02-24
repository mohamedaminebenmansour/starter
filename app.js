const express = require('express');
// Importing Express.js framework
const app = express(); // Creating an instance of Express application
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./contorollers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// 1) Global MIDDLEWARES
//set security HTTP headers
app.use(helmet());//put it really in the beginning
//development looging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// limit resuests from same API
/*we need to find a balancewhich work best for our application
For ex : If we're building an API which needs a lot of requests for one IP */
const limiter = rateLimit({
  max:80,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({limit:'10kb'}));
//Serving static files
app.use(express.static(`${__dirname}/public`));
// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
