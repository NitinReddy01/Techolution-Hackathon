const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
    username:{
        required:true,
        type:String,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    refreshToken:String
});

module.exports=mongoose.model('User',userSchema);