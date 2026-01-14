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

// Get today's date in Edmonton timezone (MST/MDT)
function getEdmontonDate() {
  const now = new Date();
  const edmontonTime = now.toLocaleString('en-CA', { timeZone: 'America/Edmonton' });
  // Parse the localized date string to get YYYY-MM-DD
  const [datePart] = edmontonTime.split(',');
  return datePart.trim();
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
    // Fetch more players to ensure filtering works across all positions
    const [pointsData, goalsData, assistsData] = await Promise.all([
      getSkaterLeaders('points', 100),
      getSkaterLeaders('goals', 100),
      getSkaterLeaders('assists', 100),
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

    // Fetch game logs for top 50 players to calculate hotness (more for better filtering)
    const top50 = players.sort((a, b) => b.points - a.points).slice(0, 50);

    const playersWithGameLogs = await Promise.all(
      top50.map(async (player) => {
        const gameLog = await getPlayerGameLog(player.id, numGames);
        return {
          ...player,
          recentStats: gameLog?.stats || null,
          recentPointsPerGame: gameLog?.pointsPerGame || 0,
          recentGames: gameLog?.recentGames || [],
        };
      })
    );

    // Sort by recent points per game (hotness) and return more for filtering
    return playersWithGameLogs
      .sort((a, b) => b.recentPointsPerGame - a.recentPointsPerGame);
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
    if (!data) return [];

    // The search API returns an array of player objects with different field names
    // Transform to match expected format used by Search component
    const players = Array.isArray(data) ? data : [];

    return players.map(player => ({
      playerId: player.playerId || player.id,
      name: player.name || `${player.firstName || ''} ${player.lastName || ''}`.trim(),
      teamAbbrev: player.teamAbbrev || player.lastTeamAbbrev || player.currentTeamAbbrev,
      positionCode: player.positionCode || player.position,
      sweaterNumber: player.sweaterNumber || player.jerseyNumber,
      active: player.active !== false,
      headshot: player.headshot,
    }));
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
      } catch {
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

// Get today's games schedule with live scores (Edmonton timezone)
export async function getTodaysGames() {
  const today = getEdmontonDate();
  const url = `${BASE_URL}/schedule/${today}`;

  try {
    // Use shorter cache for live games (60 seconds)
    const data = await fetchWithCache(url, `schedule-${today}`, 60000);

    if (!data?.gameWeek?.[0]?.games) return [];

    return data.gameWeek[0].games.map(game => ({
      id: game.id,
      startTime: game.startTimeUTC,
      gameState: game.gameState, // 'FUT', 'LIVE', 'OFF', 'FINAL', 'CRIT'
      period: game.periodDescriptor?.number,
      periodType: game.periodDescriptor?.periodType,
      clock: game.clock?.timeRemaining,
      homeTeam: {
        abbrev: game.homeTeam?.abbrev,
        name: game.homeTeam?.placeName?.default,
        logo: game.homeTeam?.logo,
        score: game.homeTeam?.score,
        record: game.homeTeam?.record,
      },
      awayTeam: {
        abbrev: game.awayTeam?.abbrev,
        name: game.awayTeam?.placeName?.default,
        logo: game.awayTeam?.logo,
        score: game.awayTeam?.score,
        record: game.awayTeam?.record,
      },
    }));
  } catch (error) {
    console.error('Error fetching today\'s games:', error);
    return [];
  }
}

// Get goalie leaders
export async function getGoalieLeaders(limit = 30) {
  const season = getCurrentSeason();
  const url = `${BASE_URL}/goalie-stats-leaders/${season}/2?categories=wins,savePctg,goalsAgainstAverage&limit=${limit}`;
  try {
    const data = await fetchWithCache(url, `goalie-leaders-${limit}`);
    return data;
  } catch (error) {
    console.error('Error fetching goalie leaders:', error);
    return {};
  }
}

// Get goalie game log for recent performance
export async function getGoalieGameLog(playerId, numGames = 10) {
  const season = getCurrentSeason();
  const url = `${BASE_URL}/player/${playerId}/game-log/${season}/2`;

  try {
    const data = await fetchWithCache(url, `gamelog-goalie-${playerId}`);
    if (!data.gameLog) return null;

    const recentGames = data.gameLog.slice(0, numGames);

    // Calculate goalie-specific stats
    const stats = recentGames.reduce((acc, game) => {
      acc.gamesPlayed += 1;
      acc.wins += game.decision === 'W' ? 1 : 0;
      acc.losses += game.decision === 'L' ? 1 : 0;
      acc.otLosses += game.decision === 'O' ? 1 : 0;
      acc.shotsAgainst += game.shotsAgainst || 0;
      acc.goalsAgainst += game.goalsAgainst || 0;
      acc.saves += (game.shotsAgainst || 0) - (game.goalsAgainst || 0);
      acc.shutouts += game.shutouts || 0;
      return acc;
    }, { gamesPlayed: 0, wins: 0, losses: 0, otLosses: 0, shotsAgainst: 0, goalsAgainst: 0, saves: 0, shutouts: 0 });

    // Calculate averages
    stats.savePct = stats.shotsAgainst > 0 ? stats.saves / stats.shotsAgainst : 0;
    stats.gaa = stats.gamesPlayed > 0 ? stats.goalsAgainst / stats.gamesPlayed : 0;
    stats.winPct = stats.gamesPlayed > 0 ? stats.wins / stats.gamesPlayed : 0;

    return { recentGames, stats };
  } catch (error) {
    console.error(`Error fetching goalie game log for ${playerId}:`, error);
    return null;
  }
}

// Edmonton Oilers team abbreviation
const OILERS_ABBREV = 'EDM';

// Get Oilers weekly schedule (next 7 days)
export async function getOilersWeeklySchedule() {
  try {
    const schedule = await getTeamSchedule(OILERS_ABBREV);
    if (!schedule || !schedule.games) return [];

    const now = new Date();
    const edmontonNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Edmonton' }));
    const weekFromNow = new Date(edmontonNow);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    // Get today's date at midnight in Edmonton timezone
    const todayStart = new Date(edmontonNow);
    todayStart.setHours(0, 0, 0, 0);

    return schedule.games
      .filter(game => {
        const gameDate = new Date(game.gameDate + 'T00:00:00');
        return gameDate >= todayStart && gameDate <= weekFromNow;
      })
      .map(game => {
        const isHome = game.homeTeam?.abbrev === OILERS_ABBREV;
        const opponent = isHome ? game.awayTeam : game.homeTeam;
        const oilersTeam = isHome ? game.homeTeam : game.awayTeam;

        const gameDate = new Date(game.gameDate + 'T00:00:00');
        const isToday = gameDate.toDateString() === edmontonNow.toDateString();

        return {
          id: game.id,
          date: game.gameDate,
          startTimeUTC: game.startTimeUTC,
          gameState: game.gameState,
          isHome,
          isToday,
          opponent: {
            abbrev: opponent?.abbrev,
            name: opponent?.placeName?.default || opponent?.commonName?.default,
            logo: opponent?.logo,
            score: opponent?.score,
          },
          oilers: {
            abbrev: oilersTeam?.abbrev,
            name: oilersTeam?.placeName?.default || oilersTeam?.commonName?.default,
            logo: oilersTeam?.logo,
            score: oilersTeam?.score,
          },
          venue: game.venue?.default,
          period: game.periodDescriptor?.number,
          periodType: game.periodDescriptor?.periodType,
          clock: game.clock?.timeRemaining,
        };
      });
  } catch (error) {
    console.error('Error fetching Oilers weekly schedule:', error);
    return [];
  }
}

// Get live game data for a specific game (30-second cache for live updates)
export async function getLiveGameData(gameId) {
  const url = `${BASE_URL}/gamecenter/${gameId}/landing`;
  try {
    const data = await fetchWithCache(url, `live-game-${gameId}`, 30000);
    return data;
  } catch (error) {
    console.error(`Error fetching live game data for ${gameId}:`, error);
    return null;
  }
}

// Get game boxscore
export async function getGameBoxscore(gameId) {
  const url = `${BASE_URL}/gamecenter/${gameId}/boxscore`;
  try {
    const data = await fetchWithCache(url, `boxscore-${gameId}`, 30000);
    return data;
  } catch (error) {
    console.error(`Error fetching boxscore for ${gameId}:`, error);
    return null;
  }
}

// Get play-by-play data
export async function getGamePlayByPlay(gameId) {
  const url = `${BASE_URL}/gamecenter/${gameId}/play-by-play`;
  try {
    const data = await fetchWithCache(url, `pbp-${gameId}`, 30000);
    return data;
  } catch (error) {
    console.error(`Error fetching play-by-play for ${gameId}:`, error);
    return null;
  }
}

// Get Oilers current game status (live, recent, or upcoming)
export async function getOilersGameStatus() {
  try {
    const weeklySchedule = await getOilersWeeklySchedule();
    const now = new Date();

    // Check for live game
    const liveGame = weeklySchedule.find(game =>
      game.gameState === 'LIVE' || game.gameState === 'CRIT'
    );

    if (liveGame) {
      return { status: 'live', game: liveGame };
    }

    // Check for recently completed game (within 12 hours)
    const recentGame = weeklySchedule.find(game => {
      if (game.gameState !== 'FINAL' && game.gameState !== 'OFF') return false;
      const gameTime = new Date(game.startTimeUTC);
      const hoursSinceGame = (now - gameTime) / (1000 * 60 * 60);
      return hoursSinceGame >= 0 && hoursSinceGame <= 12;
    });

    if (recentGame) {
      return { status: 'recap', game: recentGame };
    }

    // Find next upcoming game
    const upcomingGame = weeklySchedule.find(game =>
      game.gameState === 'FUT' || game.gameState === 'PRE'
    );

    if (upcomingGame) {
      return { status: 'preview', game: upcomingGame };
    }

    return { status: 'none', game: null };
  } catch (error) {
    console.error('Error getting Oilers game status:', error);
    return { status: 'error', game: null };
  }
}

// Get Oilers momentum score
export async function getOilersMomentum(numGames = 10) {
  try {
    const teams = await getTopTeams(32, numGames);
    const oilers = teams.find(t => t.id === OILERS_ABBREV);
    return oilers || null;
  } catch (error) {
    console.error('Error fetching Oilers momentum:', error);
    return null;
  }
}

// Get momentum comparison between Oilers and opponent
export async function getMomentumComparison(opponentAbbrev, numGames = 10) {
  try {
    const teams = await getTopTeams(32, numGames);
    const oilers = teams.find(t => t.id === OILERS_ABBREV);
    const opponent = teams.find(t => t.id === opponentAbbrev);

    return {
      oilers: oilers || null,
      opponent: opponent || null,
      oilersRank: oilers ? teams.findIndex(t => t.id === OILERS_ABBREV) + 1 : null,
      opponentRank: opponent ? teams.findIndex(t => t.id === opponentAbbrev) + 1 : null,
    };
  } catch (error) {
    console.error('Error fetching momentum comparison:', error);
    return { oilers: null, opponent: null, oilersRank: null, opponentRank: null };
  }
}

// Get Oilers roster players with recent performance
export async function getOilersRosterStats(numGames = 10) {
  try {
    const players = await getTopPlayers(numGames);
    return players.filter(p => p.teamAbbrev === OILERS_ABBREV);
  } catch (error) {
    console.error('Error fetching Oilers roster stats:', error);
    return [];
  }
}

// Get top goalies with hotness calculation
export async function getTopGoalies(numGames = 10) {
  try {
    const leadersData = await getGoalieLeaders(30);

    // Aggregate goalies from different categories
    const goalieMap = new Map();

    ['wins', 'savePctg', 'goalsAgainstAverage'].forEach(category => {
      if (!leadersData?.[category]) return;
      leadersData[category].forEach(goalie => {
        if (!goalieMap.has(goalie.id)) {
          goalieMap.set(goalie.id, {
            id: goalie.id,
            name: `${goalie.firstName?.default || ''} ${goalie.lastName?.default || ''}`.trim(),
            teamAbbrev: goalie.teamAbbrev,
            teamLogo: goalie.teamLogo,
            headshot: goalie.headshot,
            sweaterNumber: goalie.sweaterNumber,
          });
        }
      });
    });

    const goalies = Array.from(goalieMap.values());

    // Fetch game logs for top goalies
    const goaliesWithStats = await Promise.all(
      goalies.slice(0, 20).map(async (goalie) => {
        const gameLog = await getGoalieGameLog(goalie.id, numGames);
        if (!gameLog?.stats) return null;

        const { stats } = gameLog;

        // Goalie hotness formula: 50% SV%, 30% GAA (inverted), 20% win%
        // Normalize each component to 0-1 scale
        const svPctScore = stats.savePct; // already 0-1
        const gaaScore = Math.max(0, 1 - (stats.gaa / 5)); // GAA of 0 = 1.0, GAA of 5+ = 0
        const winScore = stats.winPct; // already 0-1

        const hotnessScore = (svPctScore * 0.5) + (gaaScore * 0.3) + (winScore * 0.2);

        return {
          ...goalie,
          recentStats: stats,
          hotnessScore,
        };
      })
    );

    return goaliesWithStats
      .filter(Boolean)
      .sort((a, b) => b.hotnessScore - a.hotnessScore)
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching top goalies:', error);
    return [];
  }
}
