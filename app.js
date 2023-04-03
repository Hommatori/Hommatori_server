var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var port = 8080;

var userrRouter = require('./routes/userr');
var adRouter = require('./routes/ad');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/userr', userrRouter);
app.use('/ad', adRouter);

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
  })

module.exports = app;
