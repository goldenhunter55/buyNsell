const mongoose = require('mongoose');
const schema = mongoose.Schema;

const CarSchema = new schema({
    owner:String,
    picture:String,
    model:String,
    year:String,
    describtion:String,
    date:Date,
});

const car = mongoose.model('car',CarSchema,'car');

module.exports=car;