const User = require("../../model/user/User")
const crypto = require("crypto");
const expressAsyncHandler = require('express-async-handler')
const generateToken = require("../../config/token/generateToken")
const { validateMongodbId } = require("../../utils/validateMongodbId")
const nodemailer = require("nodemailer");
const cloudinaryUploadImg = require("../../utils/cloudinary");
const fs=require("fs");
const blockUser = require("../../utils/blockUser");


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
         firstName: req?.body?.firstName,
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
    //check if blocked
    if(userFound?.isBlocked)throw new Error("Access denied you have been blocked")
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
            token:generateToken(userFound?._id),
            isVerified:userFound?.isAccountVerified,
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
        const users=await User.find({}).populate("posts")
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
         //find the login user
        //check if this particular if th e login user exists in the array of viewed by
        //get the login user
        const loginUserId=req?.user?._id?.toString()
        try{
           const myProfile=await User.findById(id)
           .populate("posts")
           .populate("viewedBy")
           const alreadyViewed=myProfile?.viewedBy?.find(user=>{
            return user?._id?.toString()  === loginUserId
           })
           if(alreadyViewed)
           {
            res.json(myProfile)

           }else{
            const profile=await User.findByIdAndUpdate(myProfile?._id,{$push:{viewedBy:loginUserId},
            })
            res.json(profile)
           }
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
    //block user
    blockUser(req?.user)
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
    const users = await User.findById(loginUserId);
    console.log(users);
    try {
      // Generate token
      const verificationToken = await users?.createAccountVerificationToken();
      // save user
      await users.save();
      //build your message
      const resetURL = `If you were requested to verify your account, verify now within 10 minutes, otherwise ignore this message <a href="http://localhost:3000/verify-account/${verificationToken}">Click to verify your account</a>`;
      let mailOptions = {
        from: "techblog.info2023@gmail.com",
        to: users?.email,
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
//------------------------------------
//forget token generator
//----------------------------------
const forgetPasswordToken=expressAsyncHandler(async(req,res)=>{
//find user by email

const { email } = req.body;

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const user = await User.findOne({ email });
if (!user) throw new Error("User Not Found");

try {
  //Create token
  const token = await user.createPasswordResetToken();
  // save user
  await user.save();
  //build your message
  const resetURL = `If you were requested to reset your password, verify now within 10 minutes, otherwise ignore this message <a href="http://localhost:3000/reset-password/${token}">Click to verify your account</a>`;
  let mailOptions = {
    from: process.env.EMAIL,
      to: user?.email,
      subject: "Reset password",
      message: "Reset your password now",
      html: resetURL,
  }

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error Occurs", err);
    } else {
      console.log("Email sent");
    }
  });
  res.json(resetURL);
} catch (error) {
  // res.json({
  //   msg: `A verification message is successfully sent to ${user?.email}. Reset now within 10 minutes, ${resetURL}`,
  // });
}
});

//------------------------------
//Password reset
//------------------------------

const passwordResetCtrl = expressAsyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  
    //find this user by token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error("Token Expired, try again later");
  
    //Update/change the password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
  });

  //-------------------------
  //profile photo upload
  //--------------------------
  const profilePhotoUploadCtrl=expressAsyncHandler(async(req,res)=>{
    //find the login user
    const {_id}=req.user
    //block user
    blockUser(req?.user)
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

module.exports = {
    forgetPasswordToken,
    passwordResetCtrl,
    userRegisterCtrl,
    loginUserCtrl,
    fetchUserCtrl,
    deleteUserCtrl,
    fetchUserDetailsCtrl,
    userProfileCtrl,
    updateUserProfileCtrl,
    updateUserPasswordCtrl,
    followingUserCtrl,
    unfollowUserCtrl,
    blockUserCtrl,
    unblockUserCtrl,
    generateVerificationToken,
    accountVerification,
    profilePhotoUploadCtrl}
