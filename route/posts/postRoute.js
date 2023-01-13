const express = require('express')
const { 
createPostCtrl,
fetchAllPostsCtrl,
fetchSinglePostCtrl,
updatePostCtrl ,
deletePostCtrl,
toggleAddLikeToPostCtrl,
toggleAddDislikeToPostCtrl} = require('../../controllers/posts/postControl')
const authMiddleware = require('../../middleware/auth/authMiddleware')
const { photoUpload,postImgResize } = require('../../middleware/uploads/photoUpload')
photoUpload
const postRoute=express.Router()

postRoute.post('/',authMiddleware,photoUpload.single("image"),postImgResize,createPostCtrl)
postRoute.get('/',fetchAllPostsCtrl)
postRoute.get('/:id',fetchSinglePostCtrl)
postRoute.put('/:id',updatePostCtrl)
postRoute.delete('/:id',deletePostCtrl)
postRoute.put('/likes',authMiddleware,toggleAddLikeToPostCtrl)
postRoute.put('/dislikes',authMiddleware,toggleAddDislikeToPostCtrl)
module.exports=postRoute