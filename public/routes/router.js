const express = require('express');
const path = require('path');
const user = require('../models/user');
const car = require('../models/cars');
const joinTable = require('../models/cars_users');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const router = express();

router.use(session({ name:"sid" , secret: "cool", saveUninitialized: true, resave: true }));
let sess;

router.use(cookieParser());
const isloggedin = (req,res,next)=>{
    if(req.session.username){
     res.redirect('/home');
    }
    next();
}
router.get('/', isloggedin , (req, res) => {
    let url = __dirname;
    url = url.replace('routes', 'views/index.html');
    res.sendFile(url);
    //console.log(next());
});


// multer config

const storage = multer.diskStorage({
    destination: './uploads',
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

 
router.post('/',(req, res) => {
    // sign up button is pressed

    if (req.body.sign_up && req.body.username && req.body.password && req.body.email) {
        //checking if username doesn't exist 
        let usernameMatch = false;
        let mailMatch = false;

        // you might ask why did he use findOne instead of find 
        // its simple findOne return docs as null of not found which is easier to check 
        //find return [] so i have to check for length which is more work 

        user.findOne({ username: req.body.username }, (err, docs) => {
            if (docs) {
                console.log(docs);
                usernameMatch = true;
            }


        }).then(() => {
            user.findOne({ email: req.body.email }, (err, doc) => {
                if (doc) {
                    console.log(doc);
                    mailMatch = true;
                }
            }).then(() => {
                if (!usernameMatch && !mailMatch) {
                    //hasing the password 
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (!err) {
                            let UserData = {
                                username: req.body.username,
                                password: hash,
                                email: req.body.email,
                            }
                            //store in database
                            user.create(UserData, (err, docs) => {
                                if (!err) {
                                    console.log(docs);
                                }
                            });

                        }
                    });

                }

                else {
                    console.log("user not created");

                }

            });

        }).catch((error) => {
            console.log(error);
        });

        return res.redirect('/');
    }

    if (req.body.login && req.body.username && req.body.password) {
        let data;
        let usernameMatch = false;
        // find username in data 
        user.findOne({ username: req.body.username }, (err, docs) => {
            if (docs) {
                //return result in obj
                data = docs;
                usernameMatch = true;
            }
        }).then(() => {
            if (usernameMatch) {
                //compare this password 
                bcrypt.compare(req.body.password, data.password, (err, result) => {
                    if (result) {
                        console.log("user found and loged in successfully");
                        sess = req.session;
                        sess.username = req.body.username;
                        return res.redirect('/home');
                    }
                    else {
                        return res.send("password is wrong");
                    }
                });
            }
            else {
                return res.send("user not found");
            }
        }).catch((error) => {
            console.log(error);
        });
        /* console.log(passwordMatch );
         console.log(usernameMatch);
         if(passwordMatch&&usernameMatch){
           return  res.redirect('/home');
         }*/
    }

    //  return res.send("err");
});

router.get('/home', (req, res) => {
    let url = __dirname;
    url = url.replace('routes', 'views/home.ejs');
    let result;
    car.find({},(err,doc)=>{
        if (!err){
            console.log(doc);
            result=doc;
        }
    }).then(()=>{
        if (!req.session.username) {
            return res.render(url, { name: "stranger", doc:result });
        }
    
        else {
    
            return res.render(url, { name: req.session.username , doc:result });
        }
    }).catch((error)=>{
        console.log(error);
    })
   

   // res.send("err");
});

router.post('/home', (req, res) => {

    if (req.body.logout) {
        if (req.session.username) {
            req.session.destroy((err) => { console.log(err); });
            sess=null;
            res.clearCookie("sid");
        }
    }
    res.redirect('/home');
});

router.get('/sell', (req, res) => {
    let url = __dirname;
    url = url.replace('routes', 'views/sell.html');
    if (req.session.username) {
      
        return res.sendFile(url);
        
    }
    else {
        return res.send("please login first to preform " + 'click <a href="/">here </a>');
    }
});

router.post('/sell', (req, res) => {
    let picName;
    upload(req, res, (err) => {
            //multer upload function

        if (!err) {
            console.log(req.file);
            picName = req.file.filename;

            if (picName && req.body.model && req.body.year && req.body.desc) {
                let data = {
                    owner: req.session.username,
                    picture: picName,
                    model: req.body.model,
                    year: req.body.year,
                    describtion: req.body.desc,
                    date:Date.now()
                }
                car.create(data, (err, docs) => {
                    if (!err) {
                        console.log(docs);
                        let joint = {
                            carID:docs._id,
                            Owner:docs.owner
                        }
                        // cars & users join table
                        joinTable.create(joint ,(errr,doc)=>{
                            if(!errr){
                                console.log(doc);
                            }
                            else {
                                console.log(errr);
                            }
                        });
                    }
                });
                return res.redirect('/home');
            }
            else {
                return res.send("not successful");
            }
        }
    });

});
router.get('/ad',(req,res)=>{
    console.log(req.query.id);
    car.findById(req.query.id,(err,doc)=>{
        let url = __dirname;
        url=url.replace('/routes','/views/ads.ejs');
        let found="not found";
        if(doc){
            let edit = false;
            if (doc.owner===req.session.username){
                edit = true;
            }
            found="found";
            res.render(url,{found , doc , edit});
            console.log(doc);
        }
        else {
            res.render(url,{found});
        }
    
    });
});
module.exports = router;    