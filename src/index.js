

import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config();

connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is listening on port ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.error("mongodb connection error!");
});



//one way to connect to db
// import express from "express";
// const app=express();
// (async()=>{
// try{
// await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
// app.on("error:",()=>{
//     console.log("error");
//     throw err;
// })

// app.listen(process.env.PORT,()=>{
//     console.log(`app is listening on port${process.env.PORT}`);
// })
// }catch(err){
//     console.error("error:",err)
//     throw err
// }
// })();