import { PlayList} from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createPlayList = asyncHandler(async(req,res) => {
    const {name, description} = req.body;
    const userId = req.user?._id;

    if(!userId) {
        throw new apiError(400, "Please login to create a playList");
    }

    if(!name) {
        throw new apiError(400, "Please provide the name to create a playList")
    }

    const playlist = await PlayList.create({name, description, creator : userId});

    if(!playlist) {
        throw new apiError(400, "Something went wrong while creating a playlist");
    }

    return res
    .status(200)
    .json(new apiResponse(200, playlist, "Playlist created succesfully"))
})

const getUserPlayLists = asyncHandler(async(req, res) => {
    const userId = req.user?._id;

    if(!userId) {
        throw new apiError(400, "Please login to access your playlist");
    }

    const playLists = await PlayList.find({creator : userId})
    .populate("videos")
    .select("videos");
 
    return res
    .status(200)
    .json(new apiResponse(200, playLists, "User playList fetched succesully"));
})


const getPlayListById = asyncHandler(async(req, res) => {
    const {playListId} = req.params;

    if(!playListId) {
        throw new apiError(400, "Please provide a playlist Id");
    }

    const userId = req.user?._id;

    if(!userId) {
        throw new apiError(400, "Please login to view your playList");
    }

    const Playlist = await PlayList.findById(playListId)
    .populate("videos");

    if(!Playlist) {
        throw new apiError(400, "Invalid playlist id provided");
    }

    if(!Playlist.creator.equals(userId)) {
        throw new apiError(400, "you have no rights to access these payList");
    }


    return res
    .status(200)
    .json(new apiResponse(200, Playlist, "PlayList fetched succesully"));
})

const addVideoToPlayList = asyncHandler(async(req, res) => {
    const {playListId, videoId} = req.params;

    if(!playListId || !videoId) {
        throw new apiError(400, "Please provide playList id and video Id");
    }

    const userId = req.user?._id;
    if(!userId) {
        throw new apiError(400, "Please login to make changes in playList");
    }

    const playlist = await PlayList.findById(playListId);

    if(!playlist) {
        throw new apiError(400, "Invalid playlist Id is provided");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new apiError(400, "Invalid videoId is provided");
    }

    if(!playlist.creator.equals(userId)) {
        throw new apiError(400, "You have no rights to add video in this playList");
    }

    if(playlist.videos.includes(videoId)) {
        throw new apiError(400, "Video already added in playList");
    }

    playlist.videos.push(videoId);
    await playlist.save();


    return res
    .status(200)
    .json(new apiResponse(200, playlist, "Video addded to playList succesfully"));
})


const removeVideoFromPlayList = asyncHandler(async(req, res) => {
    const {playListId, videoId} = req.params;

    if(!playListId || !videoId) {
        throw new apiError(400, "Please provide both playlist and video id");
    }

    const userId = req.user?._id;

    if(!userId) {
        throw new apiError(400, "Please Login to delete a video from playList");
    }

    const playlist = await PlayList.findById(playListId);

    if(!playlist) {
        throw new apiError(400, "Please provide valid playList id");
    }

    if(!playlist.creator.equals(userId)) {
        throw new apiError(400, "You have no rights to make changes in this playList");
    }

    if(playlist.videos.includes(videoId)) {
        playlist.videos.pull(videoId);
        await playlist.save();
    } else {
        throw new apiError(400, "Video does not included in playList");
    }

    return res
    .status(200)
    .json(new apiResponse(200, playlist, "Video deleted from playList succesfully"));
})


const deletePlayList = asyncHandler(async(req, res) => {
    const {playListId} = req.params;
    if(!playListId) {
        throw new apiError(400, "Please provide the playList Id");
    }

    const userId = req.user?._id;
    if(!userId) {
        throw new apiError(400, "Please login to manage your playLists");
    }

    const playlist = await PlayList.findById(playListId);

    if(!playlist) {
        throw new apiError(400, "Please provide valid playlist Id");
    }

    if(!playlist.creator.equals(userId)) {
        throw new apiError(400, "You have no rights to delete these playList");
    }

    await PlayList.findByIdAndDelete(playListId);


    return res
    .status(200)
    .json(new apiResponse(200, null, "PlayList deleted succesflly"))
})


const updatePlayList = asyncHandler(async(req, res) => {
    const {playListId} = req.params;

    const {name, description} = req.body;

    const userId = req.user?._id;

    if(!userId) {
        throw new apiError(400, "Please login to edit the playList");
    }

    const playlist = await PlayList.findById(playListId);

    if(!playlist.creator.equals(userId)) {
        throw new apiError(400, "You have no rights to edit these playList")
    }

    if(!name && !description) {
        throw new apiError(400, "Please provide something to change");
    }

    const updatedFields = {};

    if (name) updatedFields.name = name;
    if (description) updatedFields.description = description;

    const updatedPlaylist = await PlayList.findByIdAndUpdate(playListId, updatedFields, { new: true });


    return res
    .status(200)
    .json(new apiResponse(200, updatePlayList, "PlayList updated succesully"));
})

export {
    createPlayList,
    getUserPlayLists,
    getPlayListById,
    addVideoToPlayList,
    removeVideoFromPlayList,
    deletePlayList,
    updatePlayList,
}