'use strict';

require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;
const app = express();

app.set('view engine', 'ejs');
// app.use(express.static('./public'));
// app.use(express.urlencoded({ extended: true }));

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
    console.log('The data what we getting from get:', req.query);
    res.render('pages/searches/new.ejs');
    //   res.redirect('/searches/new');
    // console.log('Constructor:', Book.all);
});

app.post('/searches/show', (req, res) => {
    superagent.get('https://www.googleapis.com/books/v1/volumes?q=quilting')
        .then(data => {
            let theBook = data.body.items.map((book) => {
                return new Book(book)
            })
            res.render('pages/searches/show.ejs', { theBook: theBook });
            //   res.redirect('/searches/show');
        }).catch(err => {
            res.status(500).send(err);
        });
    console.log('The data what we getting from post:', req.body);
});

////////////////////////////////////////////////////////////////////

function Book(theBook) {
    this.imageLinks = theBook.volumeInfo.imageLinks.smallThumbnail;
    this.title = theBook.volumeInfo.title;
    this.authors = theBook.volumeInfo.authors;
    this.description = theBook.volumeInfo.description;
    // Book.all.push(this);
}
// Book.all = [];

app.use('*', (request, response) => {
    response.status(404).send('NOT FOUND!');
});

app.listen(PORT, () => console.log(`My server is up and running on ${PORT}`));
