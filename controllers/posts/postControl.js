const expressAsyncHandler = require("express-async-handler");
const Filter=require('bad-words')
const Post = require("../../model/post/Post");
const { validateMongodbId } = require("../../utils/validateMongodbId");
const User=require("../../model/user/User");
const cloudinaryUploadImg = require("../../utils/cloudinary");
const fs=require("fs");
const blockUser = require("../../utils/blockUser");
const SavedPost = require("../../model/savedPosts/SavedPosts");


//--------------------------
//create post
//--------------------------
const createPostCtrl = expressAsyncHandler(async (req, res) => {


    const {_id}=req.user
    //display message if user is blocked
    blockUser(req.user)
//  validateMongodbId(req.body.user);
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
//check user if their account is a starter account
if(req?.user?.accontType==="Starter Account"&& req?.user?.postCount>=2)
throw new Error('starter account can only create two posts.Get more followers')
 const localPath =`public/images/posts/${req.file.filename}` 
    //upload the image to cloudinary
     const imgUploaded =await cloudinaryUploadImg(localPath)

  try {
    const post = await Post.create( {
    ...req.body,
    image:imgUploaded?.url,
    user:_id
  });
  console.log(req.user)
  //update the user post count
  await User.findByIdAndUpdate(_id,{
    $inc:{postCount:1}
  },
  {
    new:true,
  }
  )
  
//remove uploaded image from cloudinary
fs.unlinkSync(localPath)
res.json(post);
  } catch (error) {
    res.json(error);
  }
});
//--------------------------
//fetch all posts
//--------------------------
const fetchAllPostsCtrl = expressAsyncHandler(async (req, res) => {
  const hasCategory=req.query.category
  try {
    //check if it has a category
    if (hasCategory)
    {
      const posts = await Post.find({category:hasCategory})
      .populate('user')
      .populate('comments').sort('-createdAt')
      res.json(posts);
    }else{
      const posts = await Post.find({})
      .populate('user')
      .populate('comments').sort('-createdAt')
      res.json(posts);
    }
    
  } catch (error) {
    res.json(error);
  }
})
  

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
    .populate('likes')
    .populate('comments');
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

// //-------------report a post---------------
const reportPostController = expressAsyncHandler(async(req,res) =>{
  //find the post to report
  const { postId } = req.body;
  const post = await Post.findById(postId);


   //find the login user
   const loginUserId = req?.user?._id;
   const reportUserId = post?.reports?.includes(loginUserId)
     //find the user has reported this post ?
    const isReported = post?.isReported;
    if (!isReported || !reportUserId ) {
      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $push: { reports: loginUserId },
          isReported: true,
        },
        { new: true }
      );
      res.json(post);
    }else{
      res.json(post)
    }

 })

  //--------fetch reported posts---------------
const fetchReportedPostController = expressAsyncHandler(async (req, res) => {
  try {
    const posts = await Post.find({isReported:true }).populate('user');
    console.log(posts)
    res.json(posts);
  } catch (error) {
    throw new Error(error.message);
  }
});

//-------------Block post---------------
const blockPostController = expressAsyncHandler(async (req, res) => {
  const { postId } = req.body;

  const post = await Post.findByIdAndUpdate(
    postId,
    {
      isBlocked: true,
    },
    {
      new: true,
    }
  );
  res.json(post);
});

module.exports = { 
  createPostCtrl ,
  fetchAllPostsCtrl,
  fetchSinglePostCtrl,
  updatePostCtrl,
deletePostCtrl,
toggleAddLikeToPostCtrl,toggleAddDislikeToPostCtrl,
reportPostController,
fetchReportedPostController,
blockPostController};
