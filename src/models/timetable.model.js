import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        index: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true
    },
    daysOfWeek: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thrusday", "Friday", "Saturday", "Sunday"],
        required: true
    },
    startTime: { 
        type: String, 
        required: true 
    },
    endTime: { 
        type: String, 
        required: true 
    },
    room: { 
        type: String, 
        default: 'TBA' 
    },
    teacher: {
        type: String, 
        default: 'TBA'
    }

}, { timestamps: true });

export const timetable = mongoose.model('timetable', timetableSchema)
