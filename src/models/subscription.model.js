import mongoose, {Schema} from "mongoose";
import { User } from "./user.model";

const subscriptionSchema = new Schema({
    subscribe : {
        type : Schema.Types.ObjectId, //One who is subscribing
        ref : "User"
    },

    channel : {
        type : Schema.Types.ObjectId, //one who is getting subscribed
        ref : "User"
    }
}, {timestamps : true})


export const Subscription = mongoose.model("Subscription", subscriptionSchema)