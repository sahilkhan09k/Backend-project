import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from '../utils/apiError.js'
import { Subscription } from "../models/subscription.model.js"
import { Video } from '../models/video.model.js'
import { Tweet } from '../models/tweet.model.js'
import { Like } from '../models/like.model.js'
import mongoose from 'mongoose';
import { apiResponse } from '../utils/apiResponse.js';

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id; 

  if (!userId) {
    throw new apiError(401, 'Please Provide the userId');
  }


  const totalSubscribers = await Subscription.countDocuments({ channel: userId });

  
  const totalViews = await Video.aggregate([
    { $match: { Owner: userId } }, 
    { $group: { _id: null, totalViews: { $sum: "$veiws" } } }
  ]);

  
  const totalVideos = await Video.countDocuments({ Owner: userId });


  const totalTweets = await Tweet.countDocuments({ creator: userId });

  
  const totalVideoLikes = await Like.aggregate([
    {
      $match: {
        video: { $in: await Like.distinct('video', { likedBy: userId }) } 
      }
    },
    { $count: "videoLikes" }
  ]);
  const videoLikesCount = totalVideoLikes[0]?.videoLikes || 0;


  const totalTweetLikes = await Like.aggregate([
    {
      $match: {
        tweet: { $in: await Like.distinct('tweet', { likedBy: userId }) } 
      }
    },
    { $count: "tweetLikes" }
  ]);
  const tweetLikesCount = totalTweetLikes[0]?.tweetLikes || 0;

  return res.status(200)
    .json(new apiResponse(200, {
      totalSubscribers, totalViews, totalVideos, totalTweets,
      videoLikesCount, tweetLikesCount
    }, "Channel stats fetched successfully"));
});


const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if(!userId) {
        throw new apiError(400, "Please provide the userId");
    }

    const videos = await Video.find({Owner : userId}).sort({createdAt : -1});


    if(!videos) {
        throw new apiError(400, "No videos found for this channel");
    }

    return res
    .status(200)
    .json(new apiResponse(200, videos, "videos fetched successfully"));
})

export { 
    getChannelStats,
    getChannelVideos,
 };
