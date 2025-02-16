import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const healthCheckController = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new apiResponse(200, null, "Server is running"));
})
export {
     healthCheckController,
    }