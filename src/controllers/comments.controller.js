import { Commentt } from "../models/comment.model";
import { Video } from "../models/video.model";
import { apiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";


const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortType = 'desc'} = req.query;

    if(!videoId) {
        return new apiError(400, "wrong videoId provided");
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortType === 'desc' ? -1 : 1;

    try {
        const comments = await Commentt.find({video : videoId})
        .populate("owner", "userName avatar")
        .sort(sortOptions)
        .skip((page-1) * limit)
        .limit(parseInt(limit))

        const totalDoc = await Commentt.countDocuments({video : videoId});

        return res
        .status(200)
        .json(new apiResponse(200, {comments, totalDoc}, "comments fetched succesfully"))
        

    } catch (error) {
        return new apiError(500, "Something went wrong while fetching the comments")
    }
})

const addComments = asyncHandler(async(req, res) => {
    const {comment} = req.body;
    const{videoId} = req.params;
    const userId = req.user?._id;

    if(!videoId) {
        throw new apiError(400, "Video not found");
    }
    if(!comment) {
        throw new apiError(400, "please provide the comment")
    }
    if(!userId) {
        throw new apiError(400, "Please login to comment");
    }

    const videoExists = await Video.findById(videoId);
    if(!videoExists) {
        throw new apiError(400, "Video id doesn't exists because")
    }

    const comm = await Commentt.create({
        content : comment,
        video : videoId,
        owner : userId
    })

    if(!comm) {
        throw new apiError(400, "Something went wrong while uploading the comment")
    }

    return res
    .status(200)
    .json(new apiResponse(200, comm, "Comment added succesfully"));

})


const updateComment = asyncHandler(async (req, res) => {
    const { comment } = req.body;
    const { videoId, commentId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        throw new apiError(401, "Please login to update the comment");
    }

    if (!comment) {
        throw new apiError(400, "Please provide the updated comment");
    }

    // Find and validate comment ownership
    const existingComment = await Commentt.findOne({ _id: commentId, video: videoId, owner: userId });
    if (!existingComment) {
        throw new apiError(404, "Comment not found or unauthorized");
    }

    // Update and save comment
    existingComment.content = comment;
    await existingComment.save();

    return res.status(200).json(new apiResponse(200, existingComment, "Comment updated successfully"));
});


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!commentId) {
        throw new apiError(400, "Invalid comment ID");
    }

    // Find comment
    const comment = await Commentt.findById(commentId);
    if (!comment) {
        throw new apiError(404, "Comment not found");
    }

    // Check ownership
    if (comment.owner.toString() !== userId.toString()) {
        throw new apiError(403, "You are not authorized to delete this comment");
    }

    // Delete comment
    await comment.deleteOne();

    return res.status(200).json(new apiResponse(200, comment, "Comment deleted successfully"));
});


export {
    getVideoComments,
    addComments,
    updateComment,
    deleteComment
}