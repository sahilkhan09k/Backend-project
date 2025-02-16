import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express()
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
}))

app.use(express.json({
    limit : "16kb",
}))

app.use(express.urlencoded({
    extended : true, limit : "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())


//routes import
import useRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import commentRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'
import playListRouter from './routes/playlist.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import healthCheckRouter from './routes/healthCheck.routes.js'


//routes declaration
//e.g. https://localhost:3000/api/v1/users/register
app.use("/api/v1/users", useRouter);

app.use("/api/v1/videos", videoRouter);

app.use("/api/v1/comments", commentRouter);

app.use("api/v1/like", likeRouter);

app.use("api/v1/playList", playListRouter);

app.use("api/v1/subsCription", subscriptionRouter);

app.use("/api/v1/tweets",tweetRouter);

app.use("/api/v1/healthCheck", healthCheckRouter);





export { app }