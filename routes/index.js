//modules

var express   = require('express');
var app       = module.exports = express();
var Reader    = require('./lib/reader');
var reader = new Reader;
var _      = require('lodash');

//routes
app.get('/*', function(req,res) {
  var slug = req.params[0].split('/');
  var payload = {};
  var format = req.query.format ? req.query.format : null;
  payload = reader.getFile(slug);

  if (payload.error) {
    res.render('404', payload);
  } else {
    if (format === 'json') {
      res.send(payload);
    } else {
      res.render('index', payload);
    }
  }
});

app.get('/posts', function(req, res) {
  //posts
  var payload = {};

  payload.posts = reader.getPosts(10);
  payload.pages = reader.getPages(10);

  res.render('index', payload);
});

