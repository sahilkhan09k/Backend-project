import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Tweet} from "../models/tweet.model.js";



const createTweet = asyncHandler(async(req, res) => {
    const {content} = req.body;
    const userId = req.user?._id;

    if(!userId) {
        throw new apiError(400, "Please login to create a tweet");
    }

    if(!content || content.trim() === "") {
        throw new apiError(400, "Please provide a content to create a tweet");
    }

    const tweet = await Tweet.create({content, creator : userId});

    if(!tweet) {
        throw new apiError(400, "Something went wrong while creating the tweet");
    }

    return res
    .status(200)
    .json(new apiResponse(200, tweet, "Tweet created succesfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new apiError(401, "Please login to get tweets");
    }

    const [tweets, totalTweets] = await Promise.all([
        Tweet.find({ creator: userId }).sort({ createdAt: -1 }).lean(),
        Tweet.countDocuments({ creator: userId })
    ]);

    return res
        .status(200)
        .json(new apiResponse(200, { tweets, totalTweets }, "Tweets fetched successfully"));
})


const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        throw new apiError(401, "Please login to update a tweet");
    }

    if (!content || content.trim() === "") {
        throw new apiError(400, "Please provide content to update the tweet");
    }

   
    const tweet = await Tweet.findOneAndUpdate(
        { _id: tweetId, creator: userId }, 
        { content },
        { new: true } 
    );

    if (!tweet) {
        throw new apiError(404, "Tweet not found or unauthorized to update");
    }

    return res.status(200).json(new apiResponse(200, tweet, "Tweet updated successfully"));
});


const deletTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        throw new apiError(401, "Please login to delete a tweet");
    }

    const tweet = await Tweet.findOneAndDelete({ _id: tweetId, creator: userId });

    if (!tweet) {
        throw new apiError(404, "Tweet not found or unauthorized to delete");
    }

    return res.status(200).json(new apiResponse(200, tweet, "Tweet deleted successfully"));
})


export { createTweet, getUserTweets, updateTweet, deletTweet }