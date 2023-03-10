const express = require('express')
const { 
createPostCtrl,
fetchAllPostsCtrl,
fetchSinglePostCtrl,
updatePostCtrl ,
deletePostCtrl,
toggleAddLikeToPostCtrl,
toggleAddDislikeToPostCtrl,reportPostController,fetchReportedPostController,
blockPostController,
savePostController,
fetchSavedPostController,
deleteSavedPostController} = require('../../controllers/posts/postControl')
const authMiddleware = require('../../middleware/auth/authMiddleware')
const { photoUpload,postImgResize } = require('../../middleware/uploads/photoUpload')
photoUpload
const postRoute=express.Router()

postRoute.put('/likes',authMiddleware,toggleAddLikeToPostCtrl)
postRoute.put('/dislikes',authMiddleware,toggleAddDislikeToPostCtrl)
postRoute.post("/report-post",authMiddleware, reportPostController);
postRoute.get("/reported-list",fetchReportedPostController);
postRoute.post("/block-post",blockPostController);


postRoute.post('/',authMiddleware,photoUpload.single("image"),postImgResize,createPostCtrl)
postRoute.get('/',fetchAllPostsCtrl)

postRoute.post("/save",authMiddleware,savePostController);
postRoute.get("/saved-list",authMiddleware,fetchSavedPostController);
postRoute.delete("/saved/:id",authMiddleware,deleteSavedPostController);


postRoute.get('/:id',fetchSinglePostCtrl)
postRoute.put('/:id',updatePostCtrl)
postRoute.delete('/:id',deletePostCtrl)
module.exports=postRoute