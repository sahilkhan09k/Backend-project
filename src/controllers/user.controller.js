import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { Subscription } from "../models/subscription.model.js";

const generateAccessAndRefresToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if(!user) {
            throw new apiError(404, "User not found")
        }
        const accessToken = await user.generateAccesToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
         await user.save({validateBeforeSave : false})

         return {accessToken, refreshToken}
    } catch (error) {
        throw new apiError(500, "Spmething went wrong while generating refresh and acces tokens")
    }
}

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
        "-password -refreshToken"
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

const loginUser = asyncHandler( async (req, res) => {
    //1. take username, email, password from user
    //2. check if any of this field is not empty
    //3. check if the user/ email exists in our database or not
    //4.if user exists the check if the provided password matches the password stored in our database
    //5. if matches then login the user and provide them with access and refresh tokens else say wrong password
    //6.Now when the acces token axpires provide the user with new acces token using refresh tokens

    const{email, userName, password} = req.body;
    if(!userName && !email) {
        throw new apiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or : [{email}, {userName}]
    })

    if(!user) {
        throw new apiError(404, "User does not exist")
    }

    const isPasswordValid = user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new apiError(401, "wrong password entered")
    }

    const{accessToken, refreshToken} = await generateAccessAndRefresToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "User loggedIn succesfully"
        )
    )

})

const logoutUser = asyncHandler(async (req, res) => {
    try {
        // Ensure req.user is populated
        if (!req.user || !req.user._id) {
            throw new apiError(400, "User information is missing.");
        }

        // Remove refresh token from database
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: { refreshToken: undefined } // Clear all refresh tokens for simplicity
            },
            { new: true }
        );

        // Cookie options
        const options = {
            httpOnly: true,
            secure : true
        };

        // Clear cookies and respond
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(
                new apiResponse(200, {}, "User logged out successfully.")
            );
    } catch (error) {
        throw new apiError(500, "Failed to log out user.");
    }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incominRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incominRefreshToken) {
        throw new apiError(400, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incominRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if(!user) {
            throw new apiError(401, "invalid refresh token")
        }
    
        if(incominRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "refresh token is expired or used")
        }
    
        const options  = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefresToken(user._id)
    
       return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", refreshToken, options
       .json(
            new apiResponse(
                200,
                {accessToken, refreshToken : refreshToken},
                "Access token refreshed succesfully"
            )
        )
       )
    } catch (error) {
        throw new apiError(401, error?.message || "refersh token was wrong")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const{oldPassword, newPassword} = req.body
    const user =  await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect) {
        throw new apiError(401, "incorrect old password entered")
    }

    user.password = newPassword
   await user.save({validateBeforeSave : false})

   return res
   .status(200)
   .json(
      new apiResponse(200, "Passowrd changed succesfully")
   )
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(
       new apiResponse(200, req.user, "User fetched succesfully")
    )
})

const changeProfileDetails = asyncHandler(async(req, res) => {
    const {userName, fullName} = req.body
    if(!userName || !fullName) {
        throw new apiError(401, "Provide username and fullname")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullName : fullName,
                userName : userName
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            user,
            "Account details updated succesfully"
        )
    )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new apiError(400, "Provide the avatar to change");
    }

    // Upload the new avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new apiError(400, "Error occurred while uploading the avatar");
    }

    // Fetch the user and delete the old avatar *after* successful upload
    const user = await User.findById(req.user._id);
    if (user?.avatar) {
        const oldAvatarPublicId = user.avatar.split('/').pop().split('.')[0]; // Extract the public_id
        try {
            await uploadOnCloudinary.v2.uploader.destroy(oldAvatarPublicId);
        } catch (error) {
            console.error("Failed to delete old avatar:", error.message);
        }
    }

    // Update the user record with the new avatar
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password");

    return res.status(200).json(
        new apiResponse(200, updatedUser, "Avatar updated successfully")
    );
});



const updateCoverImage = asyncHandler(async (req, res) => {
    const localCoverImagePath = req.file?.path;

    if (!localCoverImagePath) {
        throw new apiError(400, "Provide the cover to be updated");
    }

    // Upload the new cover image to Cloudinary
    const coverImage = await uploadOnCloudinary(localCoverImagePath);

    if (!coverImage.url) {
        throw new apiError(400, "Something went wrong while uploading the file");
    }

    // Fetch the user and delete the old cover image *after* successful upload
    const user = await User.findById(req.user._id);
    if (user?.coverimage) {
        const oldCoverPublicId = user.coverimage.split('/').pop().split('.')[0]; // Extract the public_id
        try {
            await uploadOnCloudinary.v2.uploader.destroy(oldCoverPublicId);
        } catch (error) {
            console.error("Failed to delete old cover image:", error.message);
        }
    }

    // Update the user record with the new cover image
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverimage: coverImage.url,
            },
        },
        { new: true }
    );

    return res.status(200).json(
        new apiResponse(200, updatedUser, "Cover image updated successfully")
    );
});

const getUserChannelProfile = asyncHandler(async(req, res) => {  //i.e displaying profile of a channel
        const {userName} = req.params
        if(!userName || !userName?.trim()) {
            throw new apiError(400, "User not found")
        }

        const normalizedUserName = userName.trim().toLowerCase(); 

       const channel =  await User.aggregate([
            {
              $match : {
                userName : normalizedUserName,
              }
            },
            {
                $lookup : {
                    from : "subscriptions",
                    localField : "_id",
                    foreignField : "channel",
                    as : "subscribers"
                }
            },
            {
                $lookup : {
                    from : "subscriptions",
                    localField : "_id",
                    foreignField : "subscriber",
                    as : "subscribeTo"
                }
            },
            {
                $addFields : {
                    subscribersCount : {
                        $size : "$subscribers"
                    },
                    channelSubscribeToCount : {
                        $size : "$subscribeTo"
                    },
                    isSubscribed : {
                        $cond : {
                            if: {$in : [req.user?._id, "$subscribers.subscriber"]},
                            then: true,
                            else:false
                        }
                    }
                }
            },
            {
                $project : {
                    fullName : 1,
                    userName : 1,
                    avatar : 1,
                    coverimage : 1,
                    createdAt : 1,
                    subscribersCount : 1,
                    channelSubscribeToCount : 1,
                    isSubscribed : 1
                }
            }
        ])

        if(!channel?.length) {
            throw new apiError(400, "Channel do not exist")
        }


        return res
        .status(200)
        .json(new apiResponse(200,channel[0], "User fetched successfully"))    
})



export {
    refreshAccessToken,
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    changeProfileDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile
}
