import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        index: true
    },
    SubjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Attended', 'Missed', 'Cancelled'],
        required: true
    },
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimetableSlot'
    }

}, { timestamps: true });

export const attendance = mongoose.model('attendance', attendanceSchema)
