'use strict';

require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;
const app = express();

app.set('view engine', 'ejs');


app.listen(PORT, () => console.log(`My server is up and running on ${PORT}`));
