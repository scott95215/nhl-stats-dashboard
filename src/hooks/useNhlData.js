import { useState, useEffect, useCallback } from 'react';
import {
  getTopPlayers,
  getTopTeams,
  getStandings,
  getTeamRecentGames,
  searchPlayers,
  getPlayerDetails,
  getPlayerGameLog,
  getTodaysGames,
  getTopGoalies,
  getOilersWeeklySchedule,
  getOilersGameStatus,
  getLiveGameData,
  getGameBoxscore,
  getMomentumComparison,
} from '../api/nhlApi';

// Generic data fetching hook
export function useDataFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    refetch();
  }, deps);

  return { data, loading, error, refetch };
}

// Hook for top players with configurable game period
export function useTopPlayers(numGames = 10) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTopPlayers(numGames);
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [numGames]);

  useEffect(() => {
    refetch();
  }, [numGames]);

  return { data, loading, error, refetch };
}

// Hook for top teams with configurable game period
export function useTopTeams(limit = 32, numGames = 10) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTopTeams(limit, numGames);
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [limit, numGames]);

  useEffect(() => {
    refetch();
  }, [limit, numGames]);

  return { data, loading, error, refetch };
}

// Hook for all standings
export function useStandings() {
  return useDataFetch(getStandings, []);
}

// Hook for team recent games
export function useTeamRecentGames(teamAbbrev, limit = 10) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teamAbbrev) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getTeamRecentGames(teamAbbrev, limit);
        setData(result);
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamAbbrev, limit]);

  return { data, loading, error };
}

// Hook for player search with debounce
export function usePlayerSearch(query, debounceMs = 300) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchPlayers(query);
        setResults(data);
      } catch (err) {
        setError(err.message || 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs]);

  return { results, loading, error };
}

// Hook for player details
export function usePlayerDetails(playerId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playerId) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPlayerDetails(playerId);
        setData(result);
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [playerId]);

  return { data, loading, error };
}

// Hook for player game log
export function usePlayerGameLog(playerId, numGames = 10) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playerId) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPlayerGameLog(playerId, numGames);
        setData(result);
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [playerId, numGames]);

  return { data, loading, error };
}

// Hook for today's games with 60-second auto-refresh
export function useTodaysGames() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      const result = await getTodaysGames();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();

    // Auto-refresh every 60 seconds for live scores
    const interval = setInterval(refetch, 60000);
    return () => clearInterval(interval);
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Hook for top goalies with configurable game period
export function useTopGoalies(numGames = 10) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTopGoalies(numGames);
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [numGames]);

  useEffect(() => {
    refetch();
  }, [numGames]);

  return { data, loading, error, refetch };
}

// Hook for Oilers weekly schedule
export function useOilersSchedule() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOilersWeeklySchedule();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Hook for Oilers game status with auto-refresh (30 seconds for live games)
export function useOilersGameStatus() {
  const [data, setData] = useState({ status: 'none', game: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      const result = await getOilersGameStatus();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load game status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();

    // Auto-refresh every 30 seconds for live game updates
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Hook for live game data with fast refresh
export function useLiveGameData(gameId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!gameId) return;
    try {
      const result = await getLiveGameData(gameId);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load game data');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (!gameId) {
      setData(null);
      return;
    }

    setLoading(true);
    refetch();

    // Auto-refresh every 30 seconds
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, [gameId, refetch]);

  return { data, loading, error, refetch };
}

// Hook for game boxscore
export function useGameBoxscore(gameId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!gameId) return;
    try {
      const result = await getGameBoxscore(gameId);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load boxscore');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (!gameId) {
      setData(null);
      return;
    }

    setLoading(true);
    refetch();

    // Auto-refresh every 30 seconds for live games
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, [gameId, refetch]);

  return { data, loading, error, refetch };
}

// Hook for momentum comparison
export function useMomentumComparison(opponentAbbrev, numGames = 10) {
  const [data, setData] = useState({ oilers: null, opponent: null, oilersRank: null, opponentRank: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!opponentAbbrev) {
      setData({ oilers: null, opponent: null, oilersRank: null, opponentRank: null });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getMomentumComparison(opponentAbbrev, numGames);
        setData(result);
      } catch (err) {
        setError(err.message || 'Failed to load momentum comparison');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [opponentAbbrev, numGames]);

  return { data, loading, error };
}
