const origins=require('./origins');

const corsConfig = {
    origin: (origin, callback) => {
        // console.log(origin);
        if (origins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}

module.exports=corsConfig;