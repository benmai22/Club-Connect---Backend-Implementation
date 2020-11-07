const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("./userModel");
const keys = require('../config/keys');
const path = require('path');
const Resize = require('../../helpers/Resize')
const upload = require('../../helpers/uploadMiddleware');
const multer = require('multer');

const uploader = multer({ 
    dest: "upload/",
  });

let BASE_URL = "http://localhost:13000/"
router.post("/signup", (req, res) => {

    if (!req.body.name || !req.body.email || !req.body.username || !req.body.password) {
        return res.status(400).json({error: true, message:"All fields are required"})
    }

    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            return res.status(422).json({ error: "email already exist" });
        } else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                username: req.body.username,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save().then(reguser => {
                        res.json({ reguser })
                    }).catch(err => res.status(400).json({ error: err }))
                });
            });

        }
    });
})

router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = {}

    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                bcrypt
                    .compare(password, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            const payload = {
                                id: user.id,
                                email: user.email,
                                username: user.username,
                                name: user.name,
                                image: user.image
                            }
                            jwt.sign(payload, keys.secretOrKey, { expiresIn: 86400 }, (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token,
                                    user: payload
                                })

                            });
                        } else {
                            errors.message = "Email or Password is incorrect";
                            return res.status(400).json(errors);
                        }
                    })
                    .catch(err => console.log(err));
                console.log("here 2");
            } else {
                return res.status(400).json({error: true, message:"User does not exist"})
            }
        })
});


router.post('/updatePassword', (req, res) =>{

    console.log('==Body==', req.body)
    let newPassword = req.body.newPassword;
 
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) { 
                bcrypt
                    .compare(req.body.oldPassword, user.password)
                    .then(isMatch => {

                        if (isMatch) {

                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(newPassword, salt, (err, hash) => {
                                if (err) throw err;
                                user.password = hash;
                                user.save().then(reguser => {
                                    res.json({error: false, message:"password updated",user: reguser })
                                }).catch(err => res.status(400).json({ error: err }))
                            });
                            })
                            
                        } else {
                            return res.status(400).json({error: true, message:"Old password do not match"});
                        }
                    })
                    .catch(err => console.log(err));
                console.log("here 2");
            } else {
                return res.status(400).json({error: true, message:"User does not exist"})
            }
        })
})


router.post('/upload',upload.single('image'), async (req, res) =>{

    console.log('====', req.body)

    let filename;
    const imagePath = path.join(__dirname, '../uploads');
    const fileUpload = new Resize(imagePath);
    if(!req.body.user){
        return res.status(400).json({error: true, message:"user is required"})
    }
    if (!req.file) {
        res.status(401).json({ error: 'Please provide an image' });
    }
    if (!req.file || !req.file === undefined) {

    } else {
        filename = await fileUpload.save(req.file.buffer);
        let imageurl = BASE_URL + filename

        User.findOne({_id: req.body.user})
        .then(user =>{
            if(user){
                user.image = imageurl
                user.save()
                .then(() =>{
                    return res.status(200).json({error: false, message:"Image uploaded"})
                }).catch(err =>{
                    console.log('ERR: ', err)
                    return res.status(400).json({error: true, message:"Error uploading image"})
                })
            }else{
                return res.status(400).json({error:true, message:"user not found"})
            }
        })
    }

})
 
router.post("/upload2", uploader.single("image"), async (req, res) => {
    console.log("body =>", req.body);
    console.log('files => ', req.files);
    console.log("file =>", req.file); 
  
    // const oldpath = req.body.;
    // const newpath = '/Users/mperrin/test/test-native/test-upload-photo/server/lol.jpg';
  
    // fs.rename(oldpath, newpath, (err) => {
    //   if (err) { 
    //     throw err;
    //   }
  
    //   res.write('File uploaded and moved!');
    //   res.sendStatus(200);
    // });
  
    res.sendStatus(200);
  });
module.exports = router;