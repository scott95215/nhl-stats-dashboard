import { useState, useEffect, useCallback } from 'react';
import {
  getTopPlayers,
  getTopTeams,
  getStandings,
  getTeamRecentGames,
  searchPlayers,
  getPlayerDetails,
  getPlayerGameLog,
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
