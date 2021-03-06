'use strict';

require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;
const app = express();

const pg = require('pg');
const methodOverride = require('method-override');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (err) => console.log(err));

app.set('view engine', 'ejs');
// app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// const url = 'https://www.googleapis.com/books/v1/volumes?q=quilting';
// superagent.get(url).then((apiResponse) => {
//     console.log(apiResponse.body.items[0]);
// });

app.get('/', databaseResults);
app.get('/books/:book_id', getOneBook);
app.get('/add', getForm);
app.post('/add', addBook);
app.put('/update/:book_id', updateBook);
app.delete('/delete/:book_id', deleteBook);
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
        }).catch((err) => {
            errorHandler(err, req, res);
        });
    console.log('The data what we getting from post:', req.body);
});

function getOneBook(req, res) {
    const SQL = 'SELECT * FROM books WHERE id=$1;';
    const value = [req.params.book_id];
    client.query(SQL, value).then((result) => {
        res.render('pages/books/details', { book: result.rows[0] });
    }).catch((err) => {
        errorHandler(err, req, res);
    });
}

function getForm(req, res) {
    res.render('pages/books/add-book');
}

function addBook(req, res) {
    const { author, title, isbn, image_url, description, bookshelf } = req.body;
    const SQL = 'INSERT INTO books (author,title,isbn,image_url,description,bookshelf) VALUES ($1,$2,$3,$4,$5,$6);';
    const value = [author, title, isbn, image_url, description, bookshelf];
    client.query(SQL, value).then((results) => {
        res.redirect('/');
    }).catch((err) => errorHandler(err, req, res));
}

function databaseResults(req, res) {
    const SQL = 'SELECT * FROM books;';
    client.query(SQL).then((results) => {
        res.render('pages/index', { books: results.rows });
    }).catch((err) => errorHandler(err, req, res));
}

function updateBook(req, res) {
    const { author, title, isbn, image_url, description, bookshelf } = req.body;
    const SQL =
        'UPDATE books SET author=$1,title=$2,isbn=$3,image_url=$4,description=$5,bookshelf=$6 WHERE id=$7';
    const values = [author, title, isbn, image_url, description, bookshelf,req.params.book_id];
    client
        .query(SQL, values)
        .then((results) => res.redirect(`/books/${req.params.book_id}`))
        .catch((err) => errorHandler(err, req, res));
}

function deleteBook(req, res) {
    const SQL = 'DELETE FROM books WHERE id=$1';
    const values = [req.params.book_id];
    client
      .query(SQL, values)
      .then((results) => res.redirect('/'))
      .catch((err) => errorHandler(err, req, res));
}


function Book(theBook) {
    this.imageLinks = theBook.volumeInfo.imageLinks.thumbnail;
    // this.imageLinks = (theBook.volumeInfo.imageLinks.thumbnail) ? theBook.volumeInfo.imageLinks.thumbnail : 'https://i7.uihere.com/icons/829/139/596/thumbnail-caefd2ba7467a68807121ca84628f1eb.png';
    this.title = theBook.volumeInfo.title;
    this.authors = theBook.volumeInfo.authors;
    this.description = theBook.volumeInfo.description;
}



// ----------------------------------------------------------------------------------------------------------------

function errorHandler(err, req, res) {
    res.status(500).render('pages/error', { error: err });
}

app.use('*', (request, response) => {
    response.status(404).send('NOT FOUND!');
});

client.connect().then(() => {
    app.listen(PORT, () => console.log(`My server is up and running on ${PORT}`));
});
