const express=require('express');
const User = require('../models/User');
const router=express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser=require('../middleware/fetchuser');
const JWT_SECRET='harryisagoodb$oy';

//Route1:Create a User using:POST "/api/auth/createuser".Doesn't require authentication/login (User ko create krne ka end-point ho gya)
router.post('/createuser',[
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
//Route2:Authentic a User using:POST "/api/auth/createuser".Doesn't require authentication/login  (ye hmara ek aur end-point ho gya)
router.post('/login',[
  body('email','Enter a valid email').isEmail(),
  body('password','Password can not be blank').exists(),
],async(req,res)=>{
//if ther r errors,return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors:errors.array()});
  }
  const {email,password}=req.body;  //destructuring khte hy isko (email aur pwd ko bhar nikala req.body sse)
  try{  //'try' krenge is email ka user exist krta hy ya nhi agr nhi krta to 'error' dena pdega
    let user=await User.findOne({email}); //user ko pull krunga database se jiska bhi match kre
    if(!user){
      return res.status(400).json({error:"Please try to login with correct credentials"});
    }
    const comparepassword= await bcrypt.compare(password,user.password);
    if(!comparepassword){
      return res.status(400).json({error:"Please try to login with correct credentials"});
    }
    //agr shi password hy 
    const data={
      user:{
        id:user.id
      }
    }
    const authToken=jwt.sign(data,JWT_SECRET);
  
    res.json({authToken})

  }catch(error){
    console.error(error.message)
    res.status(500).send("Internal server error");
   }
})
// Route3:Get loggedin  User details using:POST "/api/auth/getuser".Login required
router.post('/getuser',fetchuser,async(req,res)=>{
  try {
     let userId=req.user.id;
    const user=await User.findById(userId).select("-password")
    res.send(user)
  } catch(error){
    console.error(error.message)
    res.status(500).send("Internal servera error");
   }


})
module.exports = router