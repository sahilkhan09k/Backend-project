import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefresToken = async (userId) => {
    try {
        const user = await User.findById(userId)
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
    const incominRefreshToken = req.cookies.refreshToken
})

export {
    registerUser,
    loginUser,
    logoutUser
}
