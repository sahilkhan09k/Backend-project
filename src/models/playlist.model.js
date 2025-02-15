import mongoose, {Schema} from "mongoose";

const playListSchema = new Schema({
        name : {
            type : String,
            required : true
        },

        description : {
            type : String
        },

        videos : [{
            type : Schema.Types.ObjectId,
            ref : "Video"
        }],

        creator : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
},{timestamps : true})

export const PlayList = mongoose.model("PlayList", playListSchema)