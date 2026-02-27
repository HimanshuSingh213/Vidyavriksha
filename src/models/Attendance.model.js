import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userInfo",
        required: true,
        index: true
    },
    subjectId: {
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

attendanceSchema.index({ userId: 1, subjectId: 1, date: 1, slotId: 1 }, { unique: true });

export const attendance = mongoose.models.attendance || mongoose.model('attendance', attendanceSchema);
