const asyncHandler = (fn) => {
       return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch((error) => next(error))
        }
}


export {asyncHandler}


// const asyncHandler2 = (func) => {async () => {}}
// const asyncHandler2 = (func) => async (req, res, next) => {
//     try {
//        await func(req, res, next) 
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success : false,
//             message : err.message,
//         })
//     }
// }