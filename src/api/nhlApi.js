// NHL API Integration with caching
// Using the official NHL API via Vite proxy to bypass CORS

const BASE_URL = '/api/nhl/v1';
const SEARCH_URL = '/api/search/api/v1';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get current season string (e.g., "20252026")
export function getCurrentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // NHL season typically starts in October
  if (month >= 9) {
    return `${year}${year + 1}`;
  }
  return `${year - 1}${year}`;
}

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

async function fetchWithCache(url, cacheKey, cacheDuration = CACHE_DURATION) {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cacheDuration) {
    return cached.data;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

// Get team standings with stats - use date-specific endpoint
export async function getStandings() {
  const today = getTodayDate();
  const url = `${BASE_URL}/standings/${today}`;
  const data = await fetchWithCache(url, 'standings');

  if (!data.standings) return [];

  return data.standings.map(team => ({
    id: team.teamAbbrev?.default,
    name: team.teamName?.default,
    commonName: team.teamCommonName?.default,
    logo: team.teamLogo,
    wins: team.wins || 0,
    losses: team.losses || 0,
    otLosses: team.otLosses || 0,
    points: team.points || 0,
    gamesPlayed: team.gamesPlayed || 0,
    goalFor: team.goalFor || 0,
    goalAgainst: team.goalAgainst || 0,
    goalDifferential: team.goalDifferential || 0,
    winPct: team.gamesPlayed > 0 ? (team.wins / team.gamesPlayed) : 0,
    streakCode: team.streakCode,
    streakCount: team.streakCount,
    l10Wins: team.l10Wins || 0,
    l10Losses: team.l10Losses || 0,
    l10OtLosses: team.l10OtLosses || 0,
    homeWins: team.homeWins || 0,
    homeLosses: team.homeLosses || 0,
    homeOtLosses: team.homeOtLosses || 0,
    roadWins: team.roadWins || 0,
    roadLosses: team.roadLosses || 0,
    roadOtLosses: team.roadOtLosses || 0,
    divisionName: team.divisionName,
    divisionAbbrev: team.divisionAbbrev,
    conferenceName: team.conferenceName,
    conferenceAbbrev: team.conferenceAbbrev,
    leagueSequence: team.leagueSequence,
    wildcardSequence: team.wildcardSequence,
  }));
}

// Get top scoring leaders - use season-specific endpoint
export async function getSkaterLeaders(category = 'points', limit = 10) {
  const season = getCurrentSeason();
  // gameType 2 = regular season
  const url = `${BASE_URL}/skater-stats-leaders/${season}/2?categories=${category}&limit=${limit}`;
  const data = await fetchWithCache(url, `leaders-${category}-${limit}`);
  return data;
}

// Get player game log for recent performance
export async function getPlayerGameLog(playerId, numGames = 10) {
  const season = getCurrentSeason();
  const url = `${BASE_URL}/player/${playerId}/game-log/${season}/2`;

  try {
    const data = await fetchWithCache(url, `gamelog-${playerId}`);
    if (!data.gameLog) return null;

    // Get last N games
    const recentGames = data.gameLog.slice(0, numGames);

    // Calculate stats over the period
    const stats = recentGames.reduce((acc, game) => {
      acc.goals += game.goals || 0;
      acc.assists += game.assists || 0;
      acc.points += game.points || 0;
      acc.plusMinus += game.plusMinus || 0;
      acc.shots += game.shots || 0;
      acc.games += 1;
      return acc;
    }, { goals: 0, assists: 0, points: 0, plusMinus: 0, shots: 0, games: 0 });

    return {
      recentGames,
      stats,
      pointsPerGame: stats.games > 0 ? stats.points / stats.games : 0,
    };
  } catch (error) {
    console.error(`Error fetching game log for player ${playerId}:`, error);
    return null;
  }
}

// Get player stats leaders with hotness calculation
export async function getTopPlayers(numGames = 10) {
  try {
    const [pointsData, goalsData, assistsData] = await Promise.all([
      getSkaterLeaders('points', 30),
      getSkaterLeaders('goals', 30),
      getSkaterLeaders('assists', 30),
    ]);

    // Create a map to aggregate player stats
    const playerMap = new Map();

    const processLeaders = (data, statKey) => {
      if (!data || !data[statKey]) return;
      data[statKey].forEach(player => {
        const existing = playerMap.get(player.id) || {
          id: player.id,
          name: `${player.firstName?.default || ''} ${player.lastName?.default || ''}`.trim(),
          firstName: player.firstName?.default || '',
          lastName: player.lastName?.default || '',
          teamAbbrev: player.teamAbbrev,
          teamLogo: player.teamLogo,
          headshot: player.headshot,
          position: player.positionCode,
          sweaterNumber: player.sweaterNumber,
          goals: 0,
          assists: 0,
          points: 0,
        };

        if (statKey === 'goals') existing.goals = player.value || 0;
        if (statKey === 'assists') existing.assists = player.value || 0;
        if (statKey === 'points') existing.points = player.value || 0;

        playerMap.set(player.id, existing);
      });
    };

    processLeaders(pointsData, 'points');
    processLeaders(goalsData, 'goals');
    processLeaders(assistsData, 'assists');

    // Get all players and fetch their recent game logs
    const players = Array.from(playerMap.values());

    // Fetch game logs for top 20 players to calculate hotness
    const top20 = players.sort((a, b) => b.points - a.points).slice(0, 20);

    const playersWithGameLogs = await Promise.all(
      top20.map(async (player) => {
        const gameLog = await getPlayerGameLog(player.id, numGames);
        return {
          ...player,
          recentStats: gameLog?.stats || null,
          recentPointsPerGame: gameLog?.pointsPerGame || 0,
          recentGames: gameLog?.recentGames || [],
        };
      })
    );

    // Sort by recent points per game (hotness)
    return playersWithGameLogs
      .sort((a, b) => b.recentPointsPerGame - a.recentPointsPerGame)
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching top players:', error);
    return [];
  }
}

// Get team schedule/recent games for trend data
export async function getTeamSchedule(teamAbbrev) {
  const season = getCurrentSeason();
  const url = `${BASE_URL}/club-schedule-season/${teamAbbrev}/${season}`;
  const data = await fetchWithCache(url, `schedule-${teamAbbrev}`);
  return data;
}

// Get recent games results for a team
export async function getTeamRecentGames(teamAbbrev, limit = 10) {
  try {
    const schedule = await getTeamSchedule(teamAbbrev);
    if (!schedule || !schedule.games) return [];

    const now = new Date();
    const completedGames = schedule.games
      .filter(game => game.gameState === 'OFF' || game.gameState === 'FINAL')
      .filter(game => new Date(game.gameDate) <= now)
      .slice(-limit);

    return completedGames.map(game => {
      const isHome = game.homeTeam?.abbrev === teamAbbrev;
      const teamScore = isHome ? game.homeTeam?.score : game.awayTeam?.score;
      const oppScore = isHome ? game.awayTeam?.score : game.homeTeam?.score;
      const opponent = isHome ? game.awayTeam?.abbrev : game.homeTeam?.abbrev;

      return {
        date: game.gameDate,
        opponent,
        teamScore: teamScore || 0,
        oppScore: oppScore || 0,
        isWin: teamScore > oppScore,
        isHome,
        gameId: game.id,
      };
    });
  } catch (error) {
    console.error(`Error fetching recent games for ${teamAbbrev}:`, error);
    return [];
  }
}

// Search for players - uses separate search API
export async function searchPlayers(query) {
  if (!query || query.length < 2) return [];

  const url = `${SEARCH_URL}/search/player?culture=en-us&limit=20&q=${encodeURIComponent(query)}&active=true`;
  try {
    const data = await fetchWithCache(url, `search-player-${query}`, 60000); // 1 min cache for searches
    return data || [];
  } catch (error) {
    console.error('Error searching players:', error);
    return [];
  }
}

// Get player details
export async function getPlayerDetails(playerId) {
  const url = `${BASE_URL}/player/${playerId}/landing`;
  const data = await fetchWithCache(url, `player-${playerId}`);
  return data;
}

// Get top teams by performance metrics with configurable period
export async function getTopTeams(limit = 32, numGames = 10) {
  const standings = await getStandings();

  // Fetch recent games for each team to calculate hotness
  const teamsWithRecentGames = await Promise.all(
    standings.map(async (team) => {
      try {
        const recentGames = await getTeamRecentGames(team.id, numGames);

        // Calculate recent form stats
        const recentWins = recentGames.filter(g => g.isWin).length;
        const recentLosses = recentGames.length - recentWins;
        const recentGoalsFor = recentGames.reduce((sum, g) => sum + g.teamScore, 0);
        const recentGoalsAgainst = recentGames.reduce((sum, g) => sum + g.oppScore, 0);
        const recentGoalDiff = recentGoalsFor - recentGoalsAgainst;

        // Calculate hotness score based on recent performance
        const recentWinPct = recentGames.length > 0 ? recentWins / recentGames.length : 0;
        const recentGDPerGame = recentGames.length > 0 ? recentGoalDiff / recentGames.length : 0;

        // Hotness score: 60% recent win%, 40% recent goal diff per game
        const hotnessScore = (recentWinPct * 0.6) + ((recentGDPerGame + 3) / 6 * 0.4);

        return {
          ...team,
          recentGames,
          recentWins,
          recentLosses,
          recentGoalsFor,
          recentGoalsAgainst,
          recentGoalDiff,
          recentWinPct,
          recentGDPerGame,
          hotnessScore,
          recentRecord: `${recentWins}-${recentLosses}`,
        };
      } catch (error) {
        return {
          ...team,
          recentGames: [],
          recentWins: 0,
          recentLosses: 0,
          recentGoalsFor: 0,
          recentGoalsAgainst: 0,
          recentGoalDiff: 0,
          recentWinPct: 0,
          recentGDPerGame: 0,
          hotnessScore: 0,
          recentRecord: '0-0',
        };
      }
    })
  );

  return teamsWithRecentGames
    .sort((a, b) => b.hotnessScore - a.hotnessScore)
    .slice(0, limit);
}

// Get all teams (for filtering)
export async function getAllTeams() {
  return getStandings();
}

// Clear cache (useful for forcing refresh)
export function clearCache() {
  cache.clear();
}
