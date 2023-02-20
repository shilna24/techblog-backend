const express = require("express");
const { createCommentCtrl,
    fetchAllCommentsCtrl,
    fetchSingleCommentCtrl,
    updateCommentCtrl,
    deleteCommentCtrl} = require("../../controllers/comments/commentController");
const authMiddleware = require("../../middleware/auth/authMiddleware");

const commentRoute = express.Router();

commentRoute.post("/", authMiddleware, createCommentCtrl);
commentRoute.get("/",fetchAllCommentsCtrl);
commentRoute.get("/:id", authMiddleware, fetchSingleCommentCtrl);
commentRoute.put("/:id", authMiddleware, updateCommentCtrl);
commentRoute.delete("/:id", authMiddleware, deleteCommentCtrl);

module.exports = commentRoute;