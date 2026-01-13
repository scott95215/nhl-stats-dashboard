# NHL Stats Dashboard

A modern, responsive web application that displays real-time NHL player and team analytics. Built with React and Vite, featuring interactive charts and live data from the NHL API.

## Features

- **Top 10 Hottest Players**: View the league's leading scorers with goals, assists, and total points
- **Top Performing Teams**: Team standings ranked by win percentage, goal differential, and recent form
- **Team Performance Trends**: Interactive line charts showing goals for/against and cumulative goal differential over recent games
- **Player Search**: Search for any NHL player and view detailed stats including career totals
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Data Caching**: API responses are cached for 5 minutes to improve performance and avoid rate limiting

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Recharts** - Composable charting library for React
- **Lucide React** - Beautiful, consistent icons
- **NHL API** - Official NHL statistics API (api-web.nhle.com)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd nhl-stats-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── api/
│   └── nhlApi.js          # NHL API integration with caching
├── components/
│   ├── ErrorMessage.jsx   # Error display component
│   ├── Header.jsx         # App header with refresh button
│   ├── LoadingSpinner.jsx # Loading indicator
│   ├── PlayerModal.jsx    # Player details modal
│   ├── Search.jsx         # Player search component
│   ├── TeamTrendChart.jsx # Performance trend chart
│   ├── TopPlayers.jsx     # Top players list
│   └── TopTeams.jsx       # Team standings table
├── hooks/
│   └── useNhlData.js      # Custom hooks for data fetching
├── utils/
│   └── formatters.js      # Utility formatting functions
├── App.jsx                # Main application component
├── App.css                # Global styles and CSS variables
├── index.css              # Base CSS reset
└── main.jsx               # Application entry point
```

## API Information

This application uses the official NHL API endpoints:

- `api-web.nhle.com/v1/standings/now` - Current standings
- `api-web.nhle.com/v1/skater-stats-leaders/current` - Scoring leaders
- `api-web.nhle.com/v1/club-schedule-season/{team}/now` - Team schedule
- `api-web.nhle.com/v1/player/{id}/landing` - Player details
- `api-web.nhle.com/v1/search/player` - Player search

The API is free to use and does not require authentication.

## Features in Detail

### Top Players
Displays the top 10 scoring leaders combining data from points, goals, and assists leaderboards. Shows player headshots, team affiliation, position, and key stats.

### Top Teams
Shows team standings sorted by a composite score based on:
- Win percentage (40%)
- Goal differential per game (30%)
- Last 10 games record (30%)

Click on any team to view their performance trend chart.

### Team Trend Chart
Interactive line chart showing:
- Goals for (green line)
- Goals against (red line)
- Cumulative goal differential (dashed blue line)

Hover over data points to see detailed game information.

### Player Search
Type at least 2 characters to search for players. Click on a result to open a modal with:
- Player photo and basic info
- Current season stats
- Career totals

## Customization

### Color Scheme
The color scheme is defined using CSS variables in `App.css`. Modify the `:root` section to customize colors:

```css
:root {
  --color-primary: #1e40af;
  --color-primary-dark: #1e3a8a;
  --color-success: #059669;
  --color-error: #dc2626;
  /* ... more variables */
}
```

### Cache Duration
To modify the cache duration, edit `CACHE_DURATION` in `src/api/nhlApi.js`:

```javascript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Data provided by the NHL API
- Icons by Lucide
- Charts by Recharts
