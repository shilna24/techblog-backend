const express = require("express");
const dotenv=require('dotenv')
const dbConnect = require("./config/db/dbConnect");
dotenv.config()
const app = express();
const {userRegisterCtrl} = require('./controllers/users/usersControl')
//DB
dbConnect();
//middleware

app.use(express.json());
//Register
app.post("/api/users/register",userRegisterCtrl)
//Login
app.post("/api/users/login",(req,res)=>{
    res.json({user:"user login"})
})
//fetch all users
app.get("/api/users",(req,res)=>{
    res.json({user:"fetch all user"})
})


//server
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server is running ${PORT}`));


