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
            type: Number,
            default: 0
        },
        endsem: {
            type: Number,
            default: 0
        },
        minor1: {
            type: Number,
            default: 0
        },
        minor2: {
            type: Number,
            default: 0
        }
    }

}, { timestamps: true });

// Register the model under the name "subject"
const SubjectModel =
    mongoose.models.subject || mongoose.model("subject", subjectSchema);

// Also register a capitalized alias "Subject"
if (!mongoose.models.Subject) {
    mongoose.model("Subject", SubjectModel.schema);
}

export const subject = SubjectModel;
