import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema({
    videoFile : {
        type : String, //cloudenary link
        required : true,
    },

    thumbNail : {
        type : String, //cloudenary url
        required : true,
    },
    title : {
        type : String,
        required : true,
    },

    description : {
        type : String,
        required : true,   
    },

    duration : {
        type : Number, //cloudenary link
        required : true,
    },

    veiws : {
        type : Number,
        default : 0,
    },

    isPublished : {
        type : Boolean,
        default : true,
    },

    Owner : {
      type : Schema.Types.ObjectId,
      ref : "User",
    }

}, {timestamps : true});

videoSchema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model("Video", videoSchema)