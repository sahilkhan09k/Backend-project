import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
const healthCheckController = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new apiResponse(200, null, "Server is running"));
})
export {
     healthCheckController,
    }