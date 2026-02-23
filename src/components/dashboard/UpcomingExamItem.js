function calculateDaysLeft(dateString) {
    const examDate = new Date(dateString);
    const today = new Date();

    examDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffInMs = examDate.getTime() - today.getTime();
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

export default function UpcomingExamItem({
    subject,
    code,
    examType,
    examDateString
}) {
    const daysLeft = calculateDaysLeft(examDateString);

    // Default styling for exams that are far away (15+ days)
    let badgeStyle = "bg-white/[0.05] text-secondary border-white/10";
    let badgeText = `${daysLeft}d left`;

    // Dynamic styling based on urgency
    if (daysLeft < 0) {
        badgeStyle = "bg-white/[0.02] text-secondary border-white/5 opacity-50";
        badgeText = "Completed";
    } 
    else if (daysLeft === 0) {
        badgeStyle = "bg-brand/20 text-brand border-brand/30 animate-pulse";
        badgeText = "Today";
    } 
    else if (daysLeft <= 7) {
        badgeStyle = "bg-danger/10 text-danger border-danger/20"; // Red
    } 
    else if (daysLeft <= 14) {
        badgeStyle = "bg-warning/10 text-warning border-warning/20"; // Yellow
    }

    return (
        <div className="flex justify-between items-center p-4 mb-3 border border-white/5 bg-white/2 rounded-xl hover:bg-white/4 transition-colors">

            <div>
                <h4 className="text-primary font-medium tracking-wide">{subject}</h4>
                <p className="text-secondary text-xs font-mono mt-1">
                    {code} &middot; {examType}
                </p>
            </div>

            <div className={`px-3 py-1 rounded-lg border text-xs font-mono font-medium tracking-wider ${badgeStyle}`}>
                {badgeText}
            </div>

        </div>
    );
}