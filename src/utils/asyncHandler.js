const asyncHandler = (reqHandler) => {
    // console.log("Enter in asyncHandler ");

    return (req, res, next) => {
        Promise.resolve(reqHandler(req, res, next))
            .catch((err) => next(err))
    }
}

export { asyncHandler }

/*
const asyncHandler = (fn) => async (req,res,next) => {
    try {
        await fn(req,res,next);        
    } catch (error) {
        res.status(error.code).json({
            success:false,
            message:error.message
        });
    }
}
*/