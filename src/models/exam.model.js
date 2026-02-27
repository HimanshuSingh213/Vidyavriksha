import mongoose, { Schema } from 'mongoose';

const examSchema = new Schema({
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

    title: {
        type: String, 
        enum: ['Minor-1', 'Minor-2', "End-Semester"], 
        default: "Minor-1",
        required: true
    }, 
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Completed'], 
        default: 'Upcoming'
    }
}, { timestamps: true });

// Indexing by date allows MongoDB to sort your upcoming exams incredibly fast
examSchema.index({ userEmail: 1, date: 1 });

export const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);