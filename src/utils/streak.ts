export interface StreakResult {
  currentStreak: number;
  maxStreak: number;
}

export function calculateStreaks(analyticsData: any[]): StreakResult {
  const uniqueDays = new Set<string>();
  analyticsData.forEach(item => {
    if (item.practiced) {
      // use local string to ensure consistent timezone-based days
      uniqueDays.add(new Date(item.createdAt).toLocaleDateString('en-CA')); 
    }
  });

  const sortedDays = Array.from(uniqueDays).sort();
  
  let currentStreak = 0;
  let maxStreak = 0;
  let lastDate: Date | null = null;

  for (const dateStr of sortedDays) {
    // Create date object at noon to avoid timezone shift issues
    const currentDate = new Date(dateStr + 'T12:00:00'); 
    if (!lastDate) {
      currentStreak = 1;
    } else {
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }
    lastDate = currentDate;
  }

  if (lastDate) {
    const today = new Date();
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    // If it's been more than 1 day since last practice, current streak is broken
    if (diffDays > 1) {
      currentStreak = 0; 
    }
  }

  return { currentStreak, maxStreak };
}
