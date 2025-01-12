import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    //get user details from frontend
    //validation - not empty(we can add more)
    //check id user already exists - username, email
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //again check if avatar is properlu uploaded on cloudinaru or not
    //create user object - create entry in db
    //remove password and refresh token feild from response
    //check for user creation 
    //return res(response)


     //get user details from frontend
    const {userName, fullName, email, password} = req.body;
    console.log("email : ", email);


     //validation - not empty(we can add more)
    if(
        [userName, fullName, email, password].some((feild) => 
               feild?.trim() === ""
        )
    ) {
        throw new apiError(400, "all feilds are required")
    }
    //it can also be written as(>)
    // if(userName == "") {
    //     throw new apiError(400, "userName is required");
    // }
    // if(fullName == "") {
    //     throw new apiError(400, "fullName is required");
    // }
    // if(email == "") {
    //     throw new apiError(400, "email is required");
    // }
    // if(password == "") {
    //     throw new apiError(400, "password is required");
    // }


    //check id user already exists - username, email
   const existedUser = await User.findOne({
        $or : [{userName}, {email}]
    })

    if(existedUser) {
        throw new apiError(409, "user with email or username already exists")
    }


     //check for images, check for avatar

    //  console.log(req.files)
     const localAvatarPath = req.files?.avatar?.[0]?.path;
     const localCoverimagePath = req.files?.coverimage?.[0]?.path;

     if(!localAvatarPath) {
        throw new apiError(400, "Avaatar file is required")
     }
  
    //upload them to cloudinary, avatar
   const avatar = await uploadOnCloudinary(localAvatarPath);
   const coverimage = await uploadOnCloudinary(localCoverimagePath);

  
    //again check if avatar is properlu uploaded on cloudinaru or not
   if(!avatar) {
    throw new apiError(400, "Avaatar file is required")
   }



    //create user object - create entry in db
   const user =  await User.create({
    fullName,
    avatar : avatar.url,
    coverimage : coverimage?.url || "",
    email,
    userName :  userName.toLowerCase(),
    password
   })


   //remove password and refresh token feild from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    )


    //check for user creation 
    if(!createdUser) {
        throw new apiError(500, "something went wrong while registering a user!!")
    }

    //return res(response)
    return res.status(201).json(
         new apiResponse(201, createdUser, "user registered succenfully")
    )
})

export {registerUser}
