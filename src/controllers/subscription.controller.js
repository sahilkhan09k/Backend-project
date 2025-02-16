import { Subscription } from "../models/subscription.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const toggleSubscription = asyncHandler(async(req, res) => {
    const userId = req.user?._id;
    const {channelId} = req.params;

    if(!userId) {
        throw new apiError(400, "Please login to toggle subsciption status");
    }

    if(!channelId) {
        throw new apiError(400, "Please provide the valid channelId");
    }

    let subscriptionStatus;

    const isSubscribed = await Subscription.findOne({channel : channelId, subscriber : userId});

    if(!isSubscribed) {
        await Subscription.create({channel : channelId, subscriber : userId})
        subscriptionStatus = true;
    } else {
        await Subscription.deleteOne({channel : channelId, subscriber : userId})
        subscriptionStatus = false;
    }

    return res
    .status(200)
    .json(new apiResponse(200, subscriptionStatus, "subscription status toggled succesfully"))
})

const getUserChannelSubscribers = asyncHandler(async(req, res) => {
    const {channelId} = req.params;

    if(!channelId) {
        throw new apiError(400, "Please provide the channel Id");
    }

    const subscribers = await Subscription.find({channel : channelId}).populate("subscriber").lean();
    const subscriberCount = subscribers.length;

    return res
    .status(200)
    .json(new apiResponse(200, {subscribers, subscriberCount}, "Subscribers fetched succesfully"));
})

const getSubscribedChannel = asyncHandler(async(req, res) => {
    const userId = req.user?._id;

    if(!userId) {
        throw new apiError(400, "Please login to view the channels you subscribed");
    }

    const subscribedChannel = await Subscription.find({subscriber : userId}).populate("channel").lean();
    const subscribedChannelCount = subscribedChannel.length;

    return res
    .status(200)
    .json(new apiResponse(200, {subscribedChannel, subscribedChannelCount}, "Subscribed channel fetched succesfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannel
}