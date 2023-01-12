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
    blockUserCtrl,unblockUserCtrl,generateVerificationToken,accountVerification}=require("../../controllers/users/usersControl")
const authMiddleware=require("../../middleware/auth/authMiddleware")
const userRoutes=express.Router()
userRoutes.post('/register',userRegisterCtrl)
userRoutes.post('/login',loginUserCtrl)
userRoutes.get('/',authMiddleware,fetchUserCtrl)
userRoutes.delete('/:id',deleteUserCtrl)
userRoutes.get('/:id',fetchUserDetailsCtrl)
userRoutes.get('/profile/:id',authMiddleware,userProfileCtrl)
userRoutes.put('/follow',authMiddleware,followingUserCtrl)
userRoutes.post('/follow',authMiddleware,followingUserCtrl)
// userRoutes.put("/verify-account",authMiddleware,accountVerification);
userRoutes.post("/verify-mail-token",authMiddleware,generateVerificationToken);
userRoutes.put("/verify-account",authMiddleware,accountVerification);
userRoutes.put('/unblock-user/:id',authMiddleware,unblockUserCtrl)
userRoutes.put('/block-user/:id',authMiddleware,blockUserCtrl)
userRoutes.put('/unfollow',authMiddleware,unfollowUserCtrl)
userRoutes.put('/:id',authMiddleware,updateUserProfileCtrl)
userRoutes.put('/password',authMiddleware,updateUserPasswordCtrl)

module.exports=userRoutes