export const STATUS_COLORS = {
    'Applied': '#fbbf24',
    'Interviewing': '#38bdf8',
    'Interview Conducted': '#a78bfa',
    'Offered': '#34d399',
    'Rejected': '#f87171'
};

export const canJoinInterview = (interviewDate) => {
    if (!interviewDate) return true; // Fallback for testing/legacy
    const now = new Date();
    const scheduled = new Date(interviewDate);
    const diffMin = (scheduled - now) / (1000 * 60);
    // Allow joining from EXACT time up to 45 mins after the scheduled time
    return diffMin <= 0 && diffMin >= -45;
};

export const isInterviewExpired = (interviewDate) => {
    if (!interviewDate) return false;
    const now = new Date();
    const scheduled = new Date(interviewDate);
    const diffMin = (scheduled - now) / (1000 * 60);
    return diffMin < -45; // Expired if more than 45 minutes past start
};
