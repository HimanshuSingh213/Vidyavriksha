// "use server";

// import { auth } from "@/auth.js";
// import dbConnect from "@/lib/db.js";
// import { Exam } from "@/models/Exam.js";

// export async function seedExams() {
//   const session = await auth();
//   if (!session?.user?.email) throw new Error("Not logged in");

//   await dbConnect();
//   const email = session.user.email;

//   // 1. Wipe out any old test exams so we don't get duplicates
//   await Exam.deleteMany({ userEmail: email });

//   // 2. Inject the fresh data
//   // We use Date.now() + (days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
//   await Exam.create([
//     {
//       userEmail: email,
//       subjectName: "Computer Networks",
//       subjectCode: "CS305",
//       examType: "Quiz",
//       date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
//     },
//     {
//       userEmail: email,
//       subjectName: "Operating Systems",
//       subjectCode: "CS301",
//       examType: "Minor 1",
//       date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000) // 11 days from now
//     },
//     {
//       userEmail: email,
//       subjectName: "Data Structures & Algorithms",
//       subjectCode: "CS303",
//       examType: "Minor 1",
//       date: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000) // 13 days from now
//     }
//   ]);

//   return { success: true, message: "Exams injected successfully!" };
// }