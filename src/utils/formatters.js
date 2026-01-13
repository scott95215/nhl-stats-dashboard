// Utility functions for formatting data

export function formatWinPct(winPct) {
  return (winPct * 100).toFixed(1) + '%';
}

export function formatRecord(wins, losses, otLosses) {
  return `${wins}-${losses}-${otLosses}`;
}

export function formatGoalDiff(diff) {
  if (diff > 0) return `+${diff}`;
  return diff.toString();
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getStreakDisplay(code, count) {
  if (!code || !count) return '-';
  const labels = {
    W: 'W',
    L: 'L',
    OT: 'OT',
  };
  return `${labels[code] || code}${count}`;
}

export function getPositionLabel(positionCode) {
  const positions = {
    C: 'Center',
    L: 'Left Wing',
    R: 'Right Wing',
    D: 'Defenseman',
    G: 'Goalie',
  };
  return positions[positionCode] || positionCode;
}

export function truncateName(name, maxLength = 20) {
  if (!name) return '';
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + '...';
}
