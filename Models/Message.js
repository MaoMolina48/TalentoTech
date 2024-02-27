const mongoose = require('mongoose');
const UserSchema = require('./Models/User');

const MessageSchema = new mongoose.Schema({

    body: {
        type : String,
        required: true
    },
    from: {
        type : UserSchema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    to: {
        type : UserSchema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    readed: {
        type: Boolean,
        required: true,
        default: false
    }
},{

    timestamps:true
})

module.exports = mongoose.model('message', MessageSchema)