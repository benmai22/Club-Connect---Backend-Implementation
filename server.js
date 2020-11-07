const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 13000;
const cors = require('cors');
const logger = require('morgan');
const mongoose = require('mongoose');
const User = require('./api/users/user');
const Post = require('./api/posts/post');
const { mongoURI} = require('./helpers/config')
const path = require('path');


app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(express.static(path.join(__dirname, './api/uploads')));

app.use(bodyParser.json());
app.use(logger('dev'));
app.use(cors()) 

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Mongodb is running')
    }).catch(err => {
        console.log('Error connecting to Db', err)
    })

app.get('/',(req, res) =>{
    res.send('Lomai');
})
app.use('/api/v1/user', User);
app.use('/api/v1/post', Post);


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})