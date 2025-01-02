// require('dotenv').config({path : './env'
// })

import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path : './env'
})

connectDB().then(() => {
    let port = process.env.PORT || 4000;

    app.on("error", (err) => {
        console.log("error !!", err)
    })
    app.listen(port, () => {
        console.log(`server is running on the port ${port}`)
    })
})
.catch((error) => {
    console.log(`MONGODB CONNECTION ERROR FAILED`, error);
})















/*
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/