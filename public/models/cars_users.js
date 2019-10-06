const mongoose = require('mongoose');
const schema = mongoose.Schema;

//users and cars are one to many relation 

const CarS_usersSchema = new schema({
  carID:String,
  Owner:String
});

const cars_users = mongoose.model('carsUsers',CarS_usersSchema,'carsUsers');

module.exports=cars_users;