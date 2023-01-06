const User = require("../../model/user/User")
const expressAsyncHandler = require('express-async-handler')
const generateToken = require("../../config/token/generateToken")
const { validateMongodbId } = require("../../utils/validae'Mongodb")

//-------------------------------
//register
//-------------------------------
const userRegisterCtrl=expressAsyncHandler(async(req,res)=>{
    
    //check is user exist
    const userExist=await User.findOne({email:req?.body?.email})
    
 
    if(userExist)throw new Error("User already exists")
 
 try {
      //Register user
      const user= await User.create({
         firstName: req?.body?.firstName,//req.body&& req.body.firstName,
         lastName:req?.body?.lastName,
         email: req?.body?.email,
         password: req?.body?.password,   
     })
     res.json(user)
 } catch (error) {
     res.json(error)
 }
     
 })
 //-------------------------------
 //login
  //-------------------------------
const loginUserCtrl=expressAsyncHandler(async(req,res)=>{
    const {email, password}=req.body
    //check if user is already logged in

    const userFound= await User.findOne({email})
    //check if password is matches
    if(userFound && (await userFound.isPasswordMatched(password)))
    {
        res.json({
            _id: userFound?._id,
            firstName:userFound?.firstName,
            lastName:userFound?.lastName,
            email:userFound?.email,
            profilePhoto:userFound?.profilePhoto,
            isAdmin:userFound?.isAdmin,
            token:generateToken(userFound?._id)
        })
    }
    else
    {
        res.status(401)
        throw new Error ("Invalid login credentials")
    }
    
})
//-------------------------------
//users
//-------------------------------
const fetchUserCtrl=expressAsyncHandler(async(req,res)=>{
    try
    {
        const users=await User.find({})
        res.json(users)
    }catch(error)
    {
        res.json(error)
    }
})
 //-------------------------------
 //delete users
 //-------------------------------
  const deleteUserCtrl=expressAsyncHandler(async(req,res)=>{
    const {id}=req.params
    //check if user id is valid
    validateMongodbId(id)
    try
    {
        const deletedUser=await User.findByIdAndDelete(id)
        res.json(deletedUser)
    }catch(error)
    {
        res.json(error)
        
    }
})

module.exports = {userRegisterCtrl,loginUserCtrl,fetchUserCtrl,deleteUserCtrl}
