const expressAsyncHandler = require("express-async-handler");
const User = require("../../model/user/User");
const jwt=require("jsonwebtoken");


const authMiddleware = expressAsyncHandler(async(req,res,next)=>{
  let token;
  if(req?.headers?.authorization?.startsWith("Bearer ")){
    try{
        token = req.headers.authorization.split(" ")[1];
        if(token)
        {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            //find user by id
            const user=await User.findById(decoded?.id).select("-password")
            //attach the user to the request object
            req.user=user;
            next();

        }

    }catch(error){
throw new Error("Not authorized token expired, login again")
  }
}else{
  throw new error("there is no token attached to the header")
}
});
module.exports = authMiddleware;