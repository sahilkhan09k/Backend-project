import mongoose, {Schema} from "mongoose";

const tweetSchema = new Schema({
        content : {
            type : String,
            required : true
        },

        creator : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
}, {timestamps : true})


export default Tweet = mongoose.model("Tweet", tweetSchema)