const express = require("express");
const dotenv=require('dotenv')
const cors=require('cors');
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
//cors
app.use(cors());
//routes
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);
//users routes
app.use("/api/users",userRoutes)

//error handlers
app.use(notFound);
app.use(errorHandler);

//server
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server is running ${PORT}`));


