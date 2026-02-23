import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserInfo",
        required: true,
        index: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true
    },
    dayOfWeek: {
        type: Number,
        min: 0,
        max: 6,
        required: true,
        index: true
    },
    startMinutes: {
        type: Number,
        required: true
    },
    endMinutes: {
        type: Number,
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

export const Timetable = mongoose.models.Timetable || mongoose.model("Timetable", timetableSchema);
