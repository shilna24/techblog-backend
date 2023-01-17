const User = require("../../model/user/User")
const crypto = require("crypto");
const expressAsyncHandler = require('express-async-handler')
const generateToken = require("../../config/token/generateToken")
const { validateMongodbId } = require("../../utils/validateMongodbId")
const nodemailer = require("nodemailer");
const cloudinaryUploadImg = require("../../utils/cloudinary");
const fs=require("fs");


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
    console.log(req.headers)
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
//-------------------------------
//users details
//-------------------------------
const fetchUserDetailsCtrl=expressAsyncHandler(async(req,res)=>{
   const {id}=req.params
   //check if user id is valid
   validateMongodbId(id)
   try
   {
       const user=await User.findById(id)
       res.json(user)
   } catch(error)
   {
    res.json(error)

   }
})
//-------------------------------
//user Profile
//-------------------------------
const userProfileCtrl=expressAsyncHandler(async(req,res)=>{
    const {id}=req.params
        validateMongodbId(id)
        try{
           const myProfile=await User.findById(id)
            res.json(myProfile)
        }
        catch(error){
            res.json(error)
        }
})
//-------------------------------
//update profile
//-------------------------------
const updateUserProfileCtrl=expressAsyncHandler(async(req,res)=>{
    const {_id}=req?.user
    validateMongodbId(_id)
    const user=await User.findByIdAndUpdate(_id,{
        firstName:req?.body?.firstName,
        lastName:req?.body?.lastName,
        email:req?.body?.email,
        bio:req?.body?.bio
    },{
        new:true,
        runValidators:true
    })
    res.json(user)
})
//-------------------------------
//update password
//-------------------------------
const updateUserPasswordCtrl=expressAsyncHandler(async(req,res)=>{
    //destructure the login user
    const {_id}=req.user
    const {password}=req.body
    // validateMongodbId(_id)
//find the user by _id
    const user=await User.findById(_id)
    if(password)
    {
        user.password = password
        const updatedUser=await user.save()
        res.json(updatedUser)

    }
    else
    {
        res.json(user)
    }
    
})
//-------------------------------
//following
//-------------------------------
const followingUserCtrl=expressAsyncHandler(async(req,res)=>{
    
    
    const {followId}=req.body
    const loginUserId=req.user.id
//find the target user and check if the login id exist

const targetUser=await User.findById(followId)
const alreadyFollowing=targetUser?.followers?.find(user=>user?.toString()===loginUserId.toString())
    if(alreadyFollowing)throw new Error('you have already followed this user')

console.log(alreadyFollowing);
    //find the user we want to follow and update it's followers field
    await User.findByIdAndUpdate(followId,{
        $push:{followers:loginUserId},
        isFollowing:true,
    },{new:true})
    //update the login user following field
    await User.findByIdAndUpdate(loginUserId,{
        $push:{following:followId}
    },{new:true})
    
    res.json('You have successfully followed this user')
})
//----------------------------
//unfollow
//----------------------------
const unfollowUserCtrl=expressAsyncHandler(async(req,res)=>{
    const {unfollowId}=req.body
    const loginUserId=req.user.id

    await User.findByIdAndUpdate(unfollowId,{
$pull:{followers:loginUserId},
isFollowing:false,
    },{new:true} )

    await User.findByIdAndUpdate(loginUserId,{
        $pull:{following:unfollowId}
    },{new:true})
    res.json("You have successfully unfollowed ")
})
//------------------------------
//block user
//------------------------------
const blockUserCtrl=expressAsyncHandler(async(req,res)=>{
    const {id}=req.params
    validateMongodbId(id)
    const user=await User.findByIdAndUpdate(id,
    {
    isBlocked:true,
    },{new:true})
     res.json(user)   
    })
//----------------------------
//unblock user
//----------------------------
const unblockUserCtrl=expressAsyncHandler(async(req,res)=>{
const {id}=req.params
validateMongodbId(id)
const user=await User.findByIdAndUpdate(id,{
    isBlocked:false,
},
{new:true})
    res.json(user)   
    })
//---------------------------
//email verification
//--------------------------
const generateVerificationToken = expressAsyncHandler(async (req, res) => {
    console.log("generateVerificationToken");
    const { to, from, subject, message, resetURL } = req.body;
  
    // Step 1
    // transporter is what going to connect you to whichever host domain that using or either services that you'd like to
    // connect
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const loginUserId = req.user.id;
    const user = await User.findById(loginUserId);
    console.log(user);
    try {
      // Generate token
      const verificationToken = await user?.createAccountVerificationToken();
      // save user
      await user.save();
      //build your message
      const resetURL = `If you were requested to verify your account, verify now within 10 minutes, otherwise ignore this message <a href="http://localhost:3000/verify-account/${verificationToken}">Click to verify your account</a>`;
      let mailOptions = {
        from: "techblog.info2023@gmail.com",
        to: user?.email,
        // to: "devblog.info2022@gmail.com",
        subject: "techblog Verification",
        message: "verify your account now",
        html: resetURL,
      };
      // step 3
      transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
          console.log("Error Occurs", err);
        } else {
          console.log("Email sent");
        }
      });
      res.json(resetURL);
    } catch (error) {
      res.json(error);
    }
  });
  //-------------------------------
  //account verification
  //-------------------------------
  const accountVerification = expressAsyncHandler(async (req, res) => {
    const { token } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  
    //find this user by token
  
    const userFound = await User.findOne({
      accountVerificationToken: hashedToken,
      accountVerificationTokenExpires: { $gt: new Date() },
    });
    if (!userFound) throw new Error("Token expired, try again later");
    //update the property to true
    userFound.isAccountVerified = true;
    userFound.accountVerificationToken = undefined;
    userFound.accountVerificationTokenExpires = undefined;
    await userFound.save();
    res.json(userFound);
  });
  //-------------------------
  //profile photo upload
  //--------------------------
  const profilePhotoUploadCtrl=expressAsyncHandler(async(req,res)=>{
    //find the login user
    const {_id}=req.user
    //get the path to image
    const localPath =`public/images/profile/${req.file.filename}` 
    //upload the image to cloudinary
    const imgUploaded =await cloudinaryUploadImg(localPath)
    
    const foundUser=await User.findByIdAndUpdate(_id,{
    profilePhoto:imgUploaded?.url,
    },{new:true})
    //remove the saved profile photo
    fs.unlinkSync(localPath)
    res.json(imgUploaded)
  })

module.exports = {userRegisterCtrl,loginUserCtrl,fetchUserCtrl,deleteUserCtrl,fetchUserDetailsCtrl,userProfileCtrl,updateUserProfileCtrl,updateUserPasswordCtrl,followingUserCtrl,unfollowUserCtrl,blockUserCtrl,unblockUserCtrl,generateVerificationToken,accountVerification,profilePhotoUploadCtrl}
