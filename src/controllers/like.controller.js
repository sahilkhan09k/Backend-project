import { json } from "express";
import { Commentt } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import {Tweet} from "../models/tweet.model.js";
import { Video } from "../models/video.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const toggleVideoLike = asyncHandler(async(req, res) => {
    const {videoId} = req.params;

    if(!videoId) {
        throw new apiError(400, "Please provide video id");
    }

    const videoExists = await Video.findById(videoId);

    if(!videoExists) {
        throw new apiError(400,"Please provide valid VideoId");
    }

    const userId = req.user?._id;
    if(!userId) {
        throw new apiError(400, "Please login / provide valid userId")
    }

    const liked = await Like.findOne({video : videoId, likedBy : userId})

    if(!liked) {
        await Like.create({video : videoId, likedBy : userId})
    } else {
       await Like.deleteOne({_id : liked._id})
    }

    return res
    .status(200)
    .json(new apiResponse(200, null , "Liked status toggled succesfully"))
})


const toggleCommentLike = asyncHandler(async(req, res) => {
    const {commentId} = req.params;

    if(!commentId) {
        throw new apiError(400, "Please provide the commentId");
    }

    const userId = req.user?._id;

    if(!userId) {
        throw new apiError(400, "Please login");
    }

    const commentExists = await Commentt.findById(commentId);

    if(!commentExists) {
        throw new apiError(404, "comment not found");
    }

    const isLikedBy = await Like.findOne({comment : commentId, likedBy : userId});

    if(!isLikedBy) {
        await Like.create({comment : commentId, likedBy : userId})
    } else {
        await Like.deleteOne({_id : isLikedBy._id})
    }

    return res
    .status(200)
    .json(new apiResponse(200, null, "Comment like toggle succesfully"))
})

const toggleTweetLike = asyncHandler(async(req, res) => {
    const {tweetId} = req.params;

    if(!tweetId) {
        throw new apiError(400, "Please provide tweet id");
    }

    const userId = req.user?._id;

    if(!userId) {
        throw new apiError(400, "Please log in")
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet) {
        throw new apiError(404, "Tweet does not exists");
    }

    const isLikeComment = await Like.findOne({tweet : tweetId, likedBy : userId})

    if(!isLikeComment) {
        await Like.create({tweet : tweetId, likedBy : userId})
    } else {
        await Like.deleteOne({_id : isLikeComment._id})
    }

    return res
    .status(200)
    .json(new apiResponse(200, null, "tweet liked togggled succesfully"))
})

const getLikedVideos = asyncHandler(async(req, res) => {
    const userId = req.user?._id;

    if(!userId) {
        throw new apiError(400, "Please login to watch your liked Videos");
    }

    const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true } })
    .populate("video") 
    .select("video -_id");


    if (likedVideos.length === 0) {
        return res.status(200).json(new apiResponse(200, [], "No liked videos found"));
    }


    return res
    .status(200)
    .json(new apiResponse(200, likedVideos, "Liked videos fetches successfully"))
})


export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
}