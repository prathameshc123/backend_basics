import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB=async ()=>{
 try{
      const connectiondbi= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(
        `mongodb database connected!!!  Host:${connectiondbi.connection.host}
        Port:${connectiondbi.connection.port} `
    )
 }catch(err){
    console.log('mongodb connection error!',err);
    process.exit(1);
 }
}
export default connectDB;