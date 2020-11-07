const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const Post = require("./postModel");
const User = require("../users/userModel");
const path = require('path');


router.post("/create", (req, res) => {

    if (!req.body.title) {
        return res.status(400).json({ error: true, message: "title required" })
    }
    if (!req.body.user) {
        return res.status(400).json({ error: true, message: "user is required" })
    }

    const newPost = new Post({
        user: req.body.user,
        title: req.body.title,
        name:  req.body.name,
        description: req.body.description,
        date: req.body.date
    }).save().then(post => {
        return res.status(200).json({error: false, message:"Post created"})
    })
        .catch(err => {
        return res.status(200).json({error: true, message:"error creating post"})
    })

})

router.get('/fetchAll', (req, res) => {
    Post.find({})
        .then(post => {
        return res.status(200).json({error: false,posts:post})
        })
        .catch(err => {
        return res.status(400).json({error: true, message:'Error fetching posts'})
    })
})

router.post('/subscribe', (req, res) => {
    if (!req.body.user || !req.body.postId){
        return res.status(400).json({error: true, message:'user  and postId is required'})
    }else{
        User.findOne({_id: req.body.user})
        .then(user =>{
            if(user){
                console.log('YES')
                if(user.subscription.indexOf(req.body.postId) > -1)
                {
                    user.subscription.findIndex(index => console.log('------', index ))
                    return res.status(400).json({error: true, message:"subscription already exist"})
                }else{
                        user.subscription.push(req.body.postId)
                        user.save().then(() =>{
                        return res.status(200).json({error: false, message:"subscription done"})
                    })
                }
               
            }else{ 
                return res.status(400).json({error: true, message:"Error subscribing"})
            }
        })
        .catch(err =>{
            console.log('ERR: ', err)
        })
    }
})
router.post('/unsubscribe', (req, res) => {
    console.log('====>', req.body)
    if (!req.body.user || !req.body.postId){
        return res.status(400).json({error: true, message:'user and postId is required'})
    }else{
        User.findOne({_id: req.body.user}) 
        .then(user =>{
            if(user){

                if(user.subscription.indexOf(req.body.postId) >= 0){
                        user.subscription.pull(req.body.postId)
                        user.save().then(() =>{
                        return res.status(200).json({error: false, message:"unsubscription done"})
                    })
                }else{
                        return res.status(400).json({error: true, message:"subscription does not exist"})

                    }
            }else{
                return res.status(400).json({error: true, message:"Error subscribing"})
            }
        })
        .catch(err =>{
            console.log('ERR: ', err)
        })
    }
})

router.post('/fetchInterest',async (req, res) => {

    let fetchAllPost = await Post.find({});
    let toBeReturned = []
    User.findOne({_id: req.body.user})
    .then(user => {
        if(user){
            for(let i=0; i < user.subscription.length; i++){

                Post.findOne({_id: user.subscription[i]})
                .then(data =>{
                    console.log('>>>>>>>', data)
                    toBeReturned.push(data)
                }).catch(err =>{
                    console.log('ERR: ', err)
                }) 

                // if(user.subscription.indexOf(req.body.postId) >= 0){
            
                // } else{

                // }

                // if(fetchAllPost.findIndex(index => index._id === user.subscription[i] > 0)){
                //     toBeReturned.push(fetchAllPost[i])
                // }
            }
            setTimeout(() => {
             return res.status(200).json({error: false, subscription: toBeReturned})

            }, 1000);

        }else{
            return res.status(400).json({error: true, message:"User not found"})
        }
    })
    .catch(err =>{
        //console.log('ERR: ', err)
        return res.status(400).json({error: true, message:"An error occurred, try again later"})
    })

})
router.post('/fetchUnsub',async (req, res) => {

    let fetchAllPost = await Post.find({});
    let toBeReturned = []
    User.findOne({_id: req.body.user})
    .then(user => {
        if(user){


            arr3 = [].concat(
                fetchAllPost.filter(obj1 => user.subscription.every(obj2 => obj1._id !== obj2)),
                user.subscription.filter(obj2 => fetchAllPost.every(obj1 => obj2 !== obj1._id))
            );

            // var index;
            // fetchAllPost.some(function (elem, i) {
            //          return elem.id === 'yutu' ? (index = i, true) : false;
            // });
            // console.log('=================ooo==', fetchAllPost.indexOf(user.subscription[i]))



            // for(let i=0; i < fetchAllPost.length; i++){
            //     let j = fetchAllPost[i]

            //     var indexOfStevie = user.subscription.findIndex(i => console.log('=**=',j._id));
            //     console.log('==0', indexOfStevie)
            //     console.log('==1',user.subscription[i])
            //     //console.log('==2')


            //     // if(fetchAllPost.findIndex(index => index.id === user.subscription[i] > 0)){
            //     //     let newindex = fetchAllPost.findIndex(index => console.log('+++++', user.subscription[i]))
            //     //     //toBeReturned.push(fetchAllPost[i])
            //     //     console.log('HHH: ',newindex)
            //     //     fetchAllPost.splice(i,1)
            //     // }
            // }
           // console.log('=======', arr3)

            return res.status(200).json({error: false, subscription: arr3})
        }else{
            return res.status(400).json({error: true, message:"User not found"})
        }
    })
    .catch(err =>{
        console.log('ERR: ', err)
        return res.status(400).json({error: true, message:"An error occurred, try again later"})
    })

})
module.exports = router;