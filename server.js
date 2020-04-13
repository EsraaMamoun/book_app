'use strict';

require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;
const app = express();

app.set('view engine', 'ejs');
// app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

// const url = 'https://www.googleapis.com/books/v1/volumes?q=quilting';
// superagent.get(url).then((apiResponse) => {
//     console.log(apiResponse.body.items[0]);
// });

app.get('/', (req, res) => {
    res.render('pages/index');
});

app.use('/public', express.static('public'));
app.get('/hello', (req, res) => {
    res.render('pages/index');
});

app.get('/searches/new', (req, res) => {
    res.render('pages/searches/new.ejs');
});

app.post('/searches/show', (req, res) => {
    superagent.get(`https://www.googleapis.com/books/v1/volumes?q=${req.body.searchBy}+in${req.body.resultSearch}`)
        .then(data => {
            let theBook = data.body.items.map((book) => {
                return new Book(book);
            })
            res.render('pages/searches/show.ejs', { theBook: theBook });
        }).catch(err => {
            errorHandler(err, req, res);
        });
    console.log('The data what we getting from post:', req.body);
});

////////////////////////////////////////////////////////////////////

function Book(theBook) {
    this.imageLinks = theBook.volumeInfo.imageLinks.thumbnail;
    this.title = theBook.volumeInfo.title;
    this.authors = theBook.volumeInfo.authors;
    this.description = theBook.volumeInfo.description;
}

function errorHandler(err, req, res) {
    res.status(500).render('pages/error', { anError: err });
  }

app.use('*', (request, response) => {
    response.status(404).send('NOT FOUND!');
});

app.listen(PORT, () => console.log(`My server is up and running on ${PORT}`));
