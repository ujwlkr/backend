const express=require('express');
const User = require('../models/User');
const router=express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET='harryisagoodb$oy';

//Create a user using:POST "/api/auth/createuser".Doesn't require authentication/login
router.post('/',[
        body('name','Enter a valid name').isLength({min:3}),
        body('email','Enter a valid email').isEmail(),
        body('password','Password must be 5 characters').isLength({min:5}),
],async(req,res)=>{
  //if ther r errors,return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({errors:errors.array()});
        }
        //Check whether user with this email exists already
       
      try{
        let user= await User.findOne({email:req.body.email});  //findone hmne apne model pr ek method lgaya hy
      
        if(user){ //agr user already hy to return  krenge ek Bad reaquest
          return res.status(400).json({error:"Sorry a user with this email already exists"})
        }
      //Create a new user
      const salt=await bcrypt.genSalt(10)
      const secpass=await bcrypt.hash(req.body.password,salt) ;
       user= await User.create({

                name: req.body.name,
                password:secpass , //hashed password create ho jayega
                email: req.body.email,
                
              });
                // .then(user => res.json(user))
                // .catch(err=>{console.log(err)
                // res.json({error:'Please enter a unique value for email',message:err.message})
                // });
            const data={
              user:{
                id:user.id
              }
            }
            const authToken=jwt.sign(data,JWT_SECRET);
          
            res.json({authToken})
            // res.json(user)
       }catch(error){
        console.error(error.message)
        res.status(500).send("Some error occured");
       }
})
module.exports = router