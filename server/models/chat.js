const mongoose=require('mongoose');

const chatSchema=mongoose.Schema({
    filename:{
        type:String,
        required:true,
        trim:true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users' 
    },
    messages:[{
            message:{
                type:String,
                required:true
            },
            sender:{
                type:String,
                required:true
            }
        }
    ]
});

module.exports=mongoose.model('Chat',chatSchema);