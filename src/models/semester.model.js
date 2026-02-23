import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userInfo",
        index: true,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    sgpa: {
        type: Number,
        default: 0.00
    },
    status: {
        type: String,
        enum: ["Ongoing", "Completed"],
        default: "Ongoing"
    }
}, { timestamps: true });

semesterSchema.index({ userEmail: 1, semester: 1 }, { unique: true });

export const Semester = mongoose.model('Semester', semesterSchema);