import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    marks: {
        internal: {
            type: Number
        },
        endsem: {
            type: Number
        },
        minor1: {
            type: Number
        },
        minor2: {
            type: Number
        }
    }

}, { timestamps: true });

export const subject = mongoose.model('subject', subjectSchema )
