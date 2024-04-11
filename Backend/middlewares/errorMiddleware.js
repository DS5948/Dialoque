const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.orinalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message:  err.message,
        //this is something to get
        stack:process.env.NODE_ENV ==="production" ? null : err.stack,

    });
};

export default {notFound, errorHandler};

module.exports ={notFound, errorHandler};
