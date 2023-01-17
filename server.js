const express = require("express");
const dotenv=require('dotenv')
const cors=require('cors');
dotenv.config()

const dbConnect = require("./config/db/dbConnect");
const userRoutes = require("./route/users/usersRoute");

const { errorHandler,notFound } = require("./middleware/error/errorHandler");

const postRoute = require("./route/posts/postRoute");
const categoryRoute = require("./route/category/categoryRoute");
const commentRoute = require("./route/comments/commentRoute");



const app = express();

//DB
dbConnect();
//middleware
app.use(express.json());
//cors
app.use(cors());
//users routes
app.use("/api/users", userRoutes);
//post routes
app.use("/api/posts",postRoute)
//category routes
app.use("/api/category",categoryRoute)
//comments routes
app.use("/api/comments",commentRoute)

app.use(notFound);
app.use(errorHandler);



//error handlers
app.use(notFound);
app.use(errorHandler);

//server
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server is running ${PORT}`));


