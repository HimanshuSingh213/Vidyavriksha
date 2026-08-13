"use server";
import dbConnect from '@/lib/db'
import { Semester } from '@/models/semester.model';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { User } from '@/models/user.model';
import { subject } from '@/models/subject.model';


export const getVaultData = async () => {
    const session = await auth();

    if (!session) redirect("/login");
    const userId = session?.user?.id;

    await dbConnect();
    
    // Calculating all Historical SemesterWise Data
    const userData = await User.findById(userId).lean();
    const TotalSemesters = await Semester.find({
        userId,
    }).sort({ semester: 1 }).lean();
    
    const allSubjects = await subject.find({
        userId
    }).lean();

    let totalCredits = 0;
    allSubjects.forEach((sub) => { 
        totalCredits += (sub.credits || 0) 
    });

    return JSON.parse(JSON.stringify({ totalCredits, TotalSemesters, userData }));
}