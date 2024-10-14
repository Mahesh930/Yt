import mongoose from "mongoose";
import{DB_NAME} from "./constants"

import express from "express"

const app = express();

//first way to connect MongoDB
// function connectDB()
/*
(async()=>{
    try {
        //connect to MongoDB
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        app.listen(process.env.PORT,()=>{
            console.log(`App is listning on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.log("Error: ",error);
        
    }
})()
*/

// Second way to connect with mongoDB
