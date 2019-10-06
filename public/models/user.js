const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
 username : String , 
 password : String ,
 email : String ,
 picture : String
});

const user = mongoose.model('user' , userSchema ,'user');

module.exports=user;