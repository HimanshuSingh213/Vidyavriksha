"use server"
import { auth } from '@/auth'
import dbConnect from '@/lib/db';
import { Semester } from '@/models/semester.model';
import { Timetable } from '@/models/timetable.model';
import { attendance } from '@/models/Attendance.model';
import { Exam } from '@/models/exam.model';
import mongoose from 'mongoose';
import { subject } from '@/models/subject.model';
import { User } from '@/models/user.model';

const Account = mongoose.models.Account || mongoose.model('Account', new mongoose.Schema({}, { strict: false }));

export default async function deleteAccount() {
    const session = await auth();

    if (!session?.user?.id)
        return { success: false, error: "Unauthorized access" };

    const userId = session?.user?.id;

    await dbConnect();

    try {

        const objectIdUserId = new mongoose.Types.ObjectId(userId);
        const [
            timetableDel,
            attendanceDel,
            examsDel,
            subjectsDel,
            semestersDel,
            userDel,
            accountDel,
            sessionDel
        ] = await Promise.all([
            Timetable.deleteMany({ userId }),     //  Delete all timetables
            attendance.deleteMany({ userId }),    //  Delete all attendance records
            Exam.deleteMany({ userId }),          //  Delete all exams
            subject.deleteMany({ userId }),       //  Delete all subjects
            Semester.deleteMany({ userId }),      //  Delete all semesters
            User.findByIdAndDelete(userId),       //  Delete the actual User Profile
            mongoose.connection.db.collection('accounts').deleteMany({ userId: objectIdUserId }),
            mongoose.connection.db.collection('sessions').deleteMany({ userId: objectIdUserId })
        ]);

        if (!userDel) {
            return { success: false, error: "User account not found." };
        }

        return { success: true, message: "Account and all associated data completely deleted." };

    } catch (err) {
        return { success: false, error: "Failed to delete account due to a server error." };
    }
}
