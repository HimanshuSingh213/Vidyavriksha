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
        ref: 'timetable'
    }

}, { timestamps: true });

attendanceSchema.index({ userEmail: 1, subjectId: 1, date: 1, slotId: 1 }, { unique: true });

export const attendance = mongoose.model('attendance', attendanceSchema)
