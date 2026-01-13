import { AlertCircle, RefreshCw } from 'lucide-react';
import './ErrorMessage.css';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message">
      <AlertCircle size={24} />
      <p>{message || 'Something went wrong'}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
}
