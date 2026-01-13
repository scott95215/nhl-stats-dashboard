import { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { usePlayerSearch } from '../hooks/useNhlData';
import PlayerModal from './PlayerModal';
import './Search.css';

export default function Search() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const { results, loading } = usePlayerSearch(query);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handlePlayerSelect = (playerId) => {
    setSelectedPlayerId(playerId);
    setIsOpen(false);
    setQuery('');
  };

  const handleCloseModal = () => {
    setSelectedPlayerId(null);
  };

  return (
    <>
      <div className="search-container" ref={containerRef}>
        <div className="search-input-wrapper">
          <SearchIcon size={18} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder="Search any NHL player..."
            className="search-input"
          />
          {loading && <Loader2 size={18} className="search-loader" />}
          {query && !loading && (
            <button onClick={handleClear} className="search-clear">
              <X size={16} />
            </button>
          )}
        </div>

        {isOpen && query.length >= 2 && (
          <div className="search-results">
            {results.length > 0 ? (
              results.map((player) => (
                <button
                  key={player.playerId}
                  className="search-result-item"
                  onClick={() => handlePlayerSelect(player.playerId)}
                >
                  <div className="result-avatar">
                    {player.sweaterNumber || '#'}
                  </div>
                  <div className="result-info">
                    <span className="result-name">{player.name}</span>
                    <span className="result-meta">
                      {player.teamAbbrev || 'Free Agent'} • {player.positionCode || 'N/A'}
                      {player.active === false && ' (Inactive)'}
                    </span>
                  </div>
                </button>
              ))
            ) : !loading ? (
              <div className="search-no-results">
                No players found for "{query}"
              </div>
            ) : null}
          </div>
        )}
      </div>

      {selectedPlayerId && (
        <PlayerModal
          playerId={selectedPlayerId}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
