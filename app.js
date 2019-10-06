const express = require('express');
const bodyParser = require('body-parser');
const router = require('./public/routes/router');
const mongoose = require('mongoose');
const router2 = require('./public/routes/router2');
const app = express();


//connection to DB 

mongoose.connect('mongodb://localhost:27017/BuyNsell', {useNewUrlParser: true}) .then(()=>{
    console.log("connection is established");
}).catch((err)=>{

    console.log(err);
});


app.use('/uploads',express.static('./uploads'));
app.use('/profilePics',express.static('./profilePics'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.set('view engine', 'ejs');
app.use(router);
app.use(router2);

app.listen(3000,()=>{
    console.log('listening on port 3000');
});
