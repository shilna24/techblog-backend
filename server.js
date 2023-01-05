const express = require("express");
const dotenv=require('dotenv')
dotenv.config()

const dbConnect = require("./config/db/dbConnect");
const userRoutes = require("./route/users/usersRoute");
const { errorHandler,notFound } = require("./middleware/error/errorHandler");
errorHandler

const app = express();

//DB
dbConnect();
//middleware
app.use(express.json());
//users routes
app.use("/api/users",userRoutes)

//error handlers
app.use(notFound);
app.use(errorHandler);

//server
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server is running ${PORT}`));


