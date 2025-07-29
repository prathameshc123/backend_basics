import express, { json } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

 export const app=express();

 app.use(cookieParser());
 app.use(cors());
 app.use(express.json({limit:"16kb"}));
 app.use(express.urlencoded({extended:true,limit:"16kb"}));
 app.use(express.static("public"));