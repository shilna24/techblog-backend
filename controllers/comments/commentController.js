const expressAsyncHandler = require("express-async-handler");
const { validateMongodbId } = require("../../utils/validateMongodbId");
const Comment = require("../../model/comment/Comment");
const blockUser = require("../../utils/blockUser");
blockUser
//-------------------------------------------------------------
//Create
//-------------------------------------------------------------
const createCommentCtrl = expressAsyncHandler(async (req, res) => {
    //1.Get the user
    const user = req.user;
    //check if the user is blocked
   blockUser(user)

    //2.Get the post Id
    const { postId, description } = req.body;
    
    try {
      const comment = await Comment.create({
        post: postId,
        user,
        description,
      });
      res.json(comment);
    } catch (error) {
      res.json(error);
    }
  });
  
  //-------------------------------
  //fetch all comments
  //-------------------------------
  
  const fetchAllCommentsCtrl = expressAsyncHandler(async (req, res) => {
    try {
      const comments = await Comment.find({}).sort("-created");
      res.json(comments);
    } catch (error) {
      res.json(error);
    }
  });
  //-------------------------------
  //fetch single comment
  //-------------------------------
  

const fetchSingleCommentCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const comment = await Comment.findById(id);
      res.json(comment);
    } catch (error) {
      res.json(error);
    }
  });
  //-------------------------------
  //update comment
  //-------------------------------
  const updateCommentCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
  validateMongodbId(id)
    try {
      const update = await Comment.findByIdAndUpdate(
        id,
        {
          description: req?.body?.description,
        },
        {
          new: true,
          runValidators: true,
        }
      );
      res.json(update);
    } catch (error) {
      res.json(error);
    }
  });
  
  //-------------------------------
  //delete comment
  //-------------------------------
  

const deleteCommentCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
      await Comment.findByIdAndDelete(id);
      res.json({message:"comment deleted successfully"});
    } catch (error) {
      res.json(error);
    }
  });
  module.exports = { createCommentCtrl, fetchAllCommentsCtrl, fetchSingleCommentCtrl ,updateCommentCtrl,deleteCommentCtrl};
  
