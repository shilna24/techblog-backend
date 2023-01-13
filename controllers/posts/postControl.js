const expressAsyncHandler = require("express-async-handler");
const Filter=require('bad-words')
const Post = require("../../model/post/Post");
const { validateMongodbId } = require("../../utils/validateMongodbId");
const User=require("../../model/user/User");
const cloudinaryUploadImg = require("../../utils/cloudinary");
const fs=require("fs")
//--------------------------
//create post
//--------------------------
const createPostCtrl = expressAsyncHandler(async (req, res) => {
    const {_id}=req.user
//   validateMongodbId(req.body.user);
  //check for bad words
 const filter = new Filter()
 const isProfane=filter.isProfane(req.body.title,req.body.description);
 //Block user
 if(isProfane)
 {
    const user=await User.findByIdAndUpdate(_id,{
    isBlocked:true  
    })
   throw new Error('Creating Failed because it contains profane words and you  have been blocked') 
 }

 const localPath =`public/images/posts/${req.file.filename}` 
    //upload the image to cloudinary
    const imgUploaded =await cloudinaryUploadImg(localPath)
 
//  console.log(isProfane)
  try {
    // const post = await Post.create( {...req.body,image:imgUploaded?.url,
    // user:_id});
    res.json(imgUploaded);
//remove uploaded image from cloudinary
fs.unlinkSync(localPath)
  } catch (error) {
    res.json(error);
  }
});
//--------------------------
//fetch all posts
//--------------------------
const fetchAllPostsCtrl = expressAsyncHandler(async (req, res) => {
  try {
    const posts = await Post.find({}).populate('user');
    res.json(posts);
  } catch (error) {
    res.json(error);
  }})

//--------------------------------
//fetch a single post
//--------------------------------
const fetchSinglePostCtrl = expressAsyncHandler(async (req, res) => {
  const {id} = req.params
  validateMongodbId(id)
  try {
    const post = await Post.findById(id)
    .populate('user')
    .populate("dislikes")
    .populate('likes');
    //update number of views
    await Post.findByIdAndUpdate(id,
    { 
      $inc:{numViews:1},
    },
    {
      new:true
    });
    res.json(post);
  } catch (error) {
    res.json(error);
  }})
//--------------------------------
//update post
//--------------------------------
const updatePostCtrl=expressAsyncHandler(async (req, res) => {
  const {id} = req.params
  validateMongodbId(id)
  try
  {
    const post = await Post.findByIdAndUpdate(id,
        {
          ...req.body,
          user:req.user?._id
        },
        {
          new:true
        });
        res.json(post);
        } 
        catch (error) 
        {
          res.json(error);
        }
})
//--------------------------------
//delete post
//--------------------------------
const deletePostCtrl=expressAsyncHandler(async (req, res) => {
  const {id} = req.params
  validateMongodbId(id)
  try
  {
    await Post.findByIdAndDelete(id);
    res.json({message:"Post deleted successfully"});
  }
  catch (error)
  {
    res.json(error);
  }
})
//------------------------------
//Likes
//------------------------------

const toggleAddLikeToPostCtrl = expressAsyncHandler(async (req, res) => {
  //1.Find the post to be liked
  const { postId } = req.body;
  const post = await Post.findById(postId);
  //2. Find the login user
  const loginUserId = req?.user?._id;
  //3. Find is this user has liked this post?
  const isLiked = post?.isLiked;
  //4.Chech if this user has dislikes this post
  const alreadyDisliked = post?.disLikes?.find(
    userId => userId?.toString() === loginUserId?.toString()
  );
  //5.remove the user from dislikes array if exists
  if (alreadyDisliked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { disLikes: loginUserId },
        isDisLiked: false,
      },
      { new: true }
    );
    res.json(post);
  }
  //Toggle
  //Remove the user if he has liked the post
  if (isLiked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(post);
  } else {
    //add to likes
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      { new: true }
    );
    res.json(post);
  }
});

//------------------------------
//disLikes
//------------------------------

const toggleAddDislikeToPostCtrl = expressAsyncHandler(async (req, res) => {
  //1.Find the post to be disLiked
  const { postId } = req.body;
  const post = await Post.findById(postId);
  //2.Find the login user
  const loginUserId = req?.user?._id;
  //3.Check if this user has already disLikes
  const isDisLiked = post?.isDisLiked;
  //4. Check if already like this post
  const alreadyLiked = post?.likes?.find(
    userId => userId.toString() === loginUserId?.toString()
  );
  //Remove this user from likes array if it exists
  if (alreadyLiked) {
    const post = await Post.findOneAndUpdate(
      postId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(post);
  }
  //Toggling
  //Remove this user from dislikes if already disliked
  if (isDisLiked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { disLikes: loginUserId },
        isDisLiked: false,
      },
      { new: true }
    );
    res.json(post);
  } else {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { disLikes: loginUserId },
        isDisLiked: true,
      },
      { new: true }
    );
    res.json(post);
  }
});

module.exports = { 
  createPostCtrl ,
  fetchAllPostsCtrl,
  fetchSinglePostCtrl,
  updatePostCtrl,
deletePostCtrl,
toggleAddLikeToPostCtrl,toggleAddDislikeToPostCtrl};
