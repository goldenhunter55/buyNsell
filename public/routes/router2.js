const express = require('express');
const user = require('../models/user');
const multer = require('multer');
const router = express();

// multer config

const storage = multer.diskStorage({
    destination: './profilePics',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        const fileTypes = /jpg|png|jpeg/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);
        if (extname && mimeType) {
            cb(null, true);
        }
        else {
            cb("error images only");
        }
    }
}).single('fileup');
//// end of mutler config



router.get('/profile',(req,res) =>{

    let url=__dirname;
    url=url.replace('routes','views/profile.ejs');
    let edit = false;
    if (req.session.username===req.query.id){
        edit=true;
    }
    user.findOne({username:req.query.id},(err,doc)=>{
        if(!err){
            console.log(doc.picture);
            res.render(url,{edit , doc});
        }
    });

});


module.exports = router;