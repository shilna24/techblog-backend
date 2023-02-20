const express=require('express')
const {
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
    accountVerification,profilePhotoUploadCtrl,
  forgetPasswordToken,
  passwordResetCtrl}=require("../../controllers/users/usersControl")
const {photoUpload, photoResize}=require("../../middleware/uploads/photoUpload")
const authMiddleware=require("../../middleware/auth/authMiddleware")
const userRoutes=express.Router()
userRoutes.post('/register',userRegisterCtrl)
userRoutes.post('/login',loginUserCtrl)
userRoutes.put(
  "/profilephoto-upload",
  authMiddleware,
  photoUpload.single("image"),photoResize,profilePhotoUploadCtrl)
userRoutes.get('/',authMiddleware,fetchUserCtrl)
userRoutes.delete('/:id',deleteUserCtrl)
userRoutes.get('/:id',fetchUserDetailsCtrl)
userRoutes.get('/profile/:id',authMiddleware,userProfileCtrl)
userRoutes.put('/follow',authMiddleware,followingUserCtrl)
userRoutes.post('/follow',authMiddleware,followingUserCtrl)
userRoutes.post("/verify-mail-token",authMiddleware,generateVerificationToken);
userRoutes.post('/forget-password-token',forgetPasswordToken)
userRoutes.put('/reset-password',passwordResetCtrl)
userRoutes.put("/verify-account",authMiddleware,accountVerification);
userRoutes.put('/unblock-user/:id',authMiddleware,unblockUserCtrl)
userRoutes.put('/block-user/:id',authMiddleware,blockUserCtrl)
userRoutes.put('/unfollow',authMiddleware,unfollowUserCtrl)
userRoutes.put('/password',authMiddleware,updateUserPasswordCtrl)

userRoutes.put('/',authMiddleware,updateUserProfileCtrl)


module.exports=userRoutes