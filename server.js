'use strict';

// URL Shortener
// Pass a URL as a parameter -> Receive a shortened URL in the JSON response
// Visit that shortened URL -> Redirect to original link

var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var Links = mongoose.model('Links', {
  'url': String,
  'short_url': String
});
// Empty the collection to reset
//Links.remove({}, function(err) { 
//   console.log('collection removed') 
//});

app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/index.html');
});

app.get('/new/:url(*)', function(req, res) {
  var url = req.params.url;
  if (/https?:\/\/.*\..*/.test(url) || /\?allow=true$/.test(url)) {
    Links.count({}, function( err, count){
      count = count.toString();
      var link = new Links({
        'url': url,
        'short_url': count
      });
      link.save();
      
      res.send(JSON.stringify({
       "original_url": url,
       "short_url": "https://" + req.get('host') + "/" + count
      }));
    });
  } else {
    res.send(JSON.stringify({"error":"URL invalid"}));
  }
});

app.get('/:id', function(req, res) {
  
  var query = Links.where({'short_url': req.params.id });
  query.findOne(function (err, link) {
    if (err) throw err;
    if (link) {
      res.redirect(link.url);
    } else {
      res.send(JSON.stringify({"error":"No short url found for given input"}));
    }
  });
});

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Server is listening on port ' + port + '.');
});