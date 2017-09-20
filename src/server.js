// server.js

import path from 'path';
import express from 'express';
import data from './data.json';

var app     = express();

app.use(express.static(path.join(__dirname, 'static'), { maxAge: 2592000000 }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/transaction', function(req, res) {
    return res.send(JSON.parse(JSON.stringify(data)));
});

app.get('/', function(req, res) {
    let markups =  "tes";

    return res.render('index', { markups });
});

const port = process.env.PORT || 8080;
const env = process.env.NODE_ENV || 'production';
app.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  console.info(`Server running on http://localhost:${port} [${env}]`);
});
