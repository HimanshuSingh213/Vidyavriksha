import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    emailVerified: {
        type: Date,
        default: null
    },
    image: {
        type: String
    },
    targetCGPA: {
        type: Number,
        default: 9.0,
        min: 0,
        max: 10
    },
    universityScale: {
        type: Number,
        default: 10
    },
    currentCGPA: {
        type: Number,
        default: 0.00
    },


}, { timestamps: true, strict: false });


export const userInfo = mongoose.model('userInfo', userSchema)