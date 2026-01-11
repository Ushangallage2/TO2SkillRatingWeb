export async function fetchSkillLeaderboard() {
    const res = await fetch("/.netlify/functions/leaderboard-skill");
    return res.json();
  }
  
  export async function fetchStatsLeaderboard(sort: string) {
    const res = await fetch(
      `/.netlify/functions/leaderboard-stats?sort=${sort}`
    );
    return res.json();
  }
  