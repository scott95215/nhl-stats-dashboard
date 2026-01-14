import OilersSchedule from '../components/OilersSchedule';
import GameCenter from '../components/GameCenter';
import Methodology from '../components/Methodology';
import { useOilersSchedule, useOilersGameStatus } from '../hooks/useNhlData';
import './OilersFocusPage.css';

export default function OilersFocusPage() {
  const { data: schedule, loading: scheduleLoading } = useOilersSchedule();
  const { data: gameStatus, loading: statusLoading } = useOilersGameStatus();

  return (
    <div className="oilers-focus-page">
      {/* Weekly Schedule Header */}
      <OilersSchedule
        schedule={schedule}
        loading={scheduleLoading}
      />

      {/* Dynamic Game Center */}
      <section className="game-center-section">
        {statusLoading ? (
          <div className="loading-placeholder">Loading game status...</div>
        ) : (
          <GameCenter gameStatus={gameStatus} />
        )}
      </section>

      {/* Methodology */}
      <Methodology />

      <footer className="page-footer">
        <p>
          Data provided by the NHL API. All times shown in Edmonton (MST/MDT).
        </p>
      </footer>
    </div>
  );
}
