//require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import express from "express"
import {app}from './aap.js'

dotenv.config({
    path: './.env',
})

// Second way to connect with mongoDB
connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("MONGO DB connection Failed...", err);
    })







/*
import express from "express"


//first way to connect MongoDB
// function connectDB()

(async () => {
    try {
        //connect to MongoDB
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error", () => {
            console.log("Error Can't connect to DB")
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listning on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("Error: ", error);

    }
})()

*/
