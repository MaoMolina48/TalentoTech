const mongoose = require('mongoose');
const UserSchema = require('./Models/User');

const ChatSchema = new mongoose.Schema({
    from:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    to:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    message:{
        type : [{
            type : mongoose.Schema.Types.ObjectId,
            ref: 'message',
        }],
        required: true
    }
}, {
    timestamps: true
}
)

module.exports = mongoose.model('chat',ChatSchema)