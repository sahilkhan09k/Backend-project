import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.model.js";
import {Like} from "../models/like.model.js"
import {Commentt} from "../models/comment.model.js"
import { User } from "../models/user.model.js";
import extractPublicId from "../utils/extractPublicId.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary .js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;
    
    try {
        const filter = {};
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        if (userId) {
            filter.userId = userId;
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortType === 'desc' ? -1 : 1;

        const videos = await Video.find(filter)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalVideos = await Video.countDocuments(filter);

       return res.status(200).json({
            success: true,
            totalVideos,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalVideos / limit),
            videos
        });

    } catch (error) {
       return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});


const publishVideo = asyncHandler(async(req, res) => {
    const {title, description} = req.body
    if(
        [title, description].some((feild) => 
               feild?.trim() === ""
        )
    ) {
        throw new apiError(400, "all feilds are required")
    }

    const localThumbnailPath = req.files?.thumbNail?.[0]?.path;
    const localVideoPath = req.files?.videoFile?.[0]?.path;

    if(! localThumbnailPath || !localVideoPath) {
        throw new apiError(400, "please provide thumbnail and video")
    }

    const thumbNail = await uploadOnCloudinary(localThumbnailPath);
    const videoFile = await uploadOnCloudinary(localVideoPath);

    if(!thumbNail) {
        throw new apiError(500, "something happened while uploading the thumbnail")
    }

    if(!videoFile) {
        throw new apiError(500, "something went wrong while uploading the video")
    }

    const uploaded = await Video.create({
        title,
        description,
        thumbNail : thumbNail.url,
        videoFile : videoFile.url,
        Owner : req.user._id,
        duration : videoFile.duration
    })

    if(!uploaded) {
        throw new apiError(500, "something went wrong while upoading")
    }

    return res
    .status(200)
    .json(new apiResponse(200, uploaded, "Video uploaded succesfully"))
})

const getVideoById = asyncHandler(async(req, res) => {
    const {videoId} = req.params;

    const video = await Video.findById(videoId);
    if(!video) {
        throw new apiError(400, "wrong video url");
    }

    return res
    .status(200)
    .json(new apiResponse(200, video, "video fetched succesfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if(!videoId || !isValidObjectId(videoId)) {
        throw new apiError(400, "please provide valid video id")
    }

    if (!title && !description) {
        throw new apiError(400, "Provide at least one field to update");
    }

    const vid = await Video.findById(videoId);
    if(!vid) {
        throw new apiError(400, "Video doesnot exists")
    }

    if(!vid.Owner.equals(req.user._id)) {
        throw new apiError(400, "you have no rights to modify this video")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        { $set: { title, description } },
        { new: true} 
    );

    if (!video) {
        throw new apiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new apiResponse(200, video, "Video details updated successfully"));
});


const updateThumbnail = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
    if(!videoId) {
        throw new apiError(400, "provide the video id");
    }

    const localThumbnailPath = req.file?.path;
    if(!localThumbnailPath) {
        throw new apiError(400, "please provide the new thumbnail")
    }

    const thumbNail = await uploadOnCloudinary(localThumbnailPath);
    if(!thumbNail.url) {
        throw new apiError(500, "something went wrong while uplading the thumbnail")
    }

    const video = await Video.findById(videoId);
    if(video?.thumbNail) {
        const oldThumbNailPublicId = extractPublicId(video.thumbNail);
        await deleteFromCloudinary(oldThumbNailPublicId);
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set : {
                thumbNail : thumbNail.url
            }
        },
        {new : true}
    )

    return res
    .status(200)
    .json(new apiResponse(200, updatedVideo, "Thumbnail updated succesfully"))
})

const deleteVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params;

    if(!videoId) {
        throw new apiError(400, "please provide the valid api id");
    }
    const vid = Video.findById(videoId);
    if(!vid) {
        throw new apiError(400, "video with given videoId doesn't exist");
    }

    if(!vid.Owner.equals(req.user._id)) {
        throw new apiError(400, "you have no rights to delete the video");
    }

    const video =  await Video.findByIdAndDelete(videoId).select("videoFile title veiws isPublished Owner");
    if(!video) {
        throw new apiError(500, "something went wrong while deleting the video");
    }

    const cloudinaryVideoId = extractPublicId(vid.videoFile);
    await deleteFromCloudinary(cloudinaryVideoId);

    await Like.deleteMany({videoId})
    await Commentt.deleteMany({videoId})
    await User.updateMany(
        { watchHistory: videoId },
        { $pull: { watchHistory: videoId } }
      );
   

    return res
    .status(200)
    .json(new apiResponse(200, video, "Video deleted succesfully"));
})

const updateToggleStatus = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
    if(!videoId) {
        throw new apiError(400, "provide the video id");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new apiError(400, "provide valid video id")
    }

    if(!video.Owner.toString().equals(req.user._id.toString())) {
        throw new apiError(400, "you have no rights to change the video details");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set : {
                isPublished : !video.isPublished,
            }
        },{new : true}
    )

    return res
    .status(200)
    .json(new apiResponse(200, updatedVideo, "Toggle status updated succesfully"))
})


export {
    publishVideo,
    getVideoById,
    updateVideo,
    updateThumbnail,
    deleteVideo,
    updateToggleStatus,
    getAllVideos
}