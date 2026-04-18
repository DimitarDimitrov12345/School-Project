import React, { useEffect, useRef } from 'react';

const LiveMatchesWidget: React.FC = () => {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the official API-Football widget script if not already present
    if (!document.querySelector('script[src="https://widgets.api-sports.io/2.0.3/widget.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://widgets.api-sports.io/2.0.3/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
    // The widget will auto-initialize if the script is loaded
  }, []);

  return (
    <div
      ref={widgetRef}
      id="wg-api-football-games"
      data-host="v3.football.api-sports.io"
      data-key="PUT_YOUR_API_KEY_HERE"
      data-date=""
      data-league=""
      data-season=""
      data-theme=""
      data-refresh="15"
      data-show-toolbar="true"
      data-show-errors="false"
      data-show-logos="false"
      data-modal-game="true"
      data-modal-standings="true"
      data-modal-show-logos="true"
      style={{ minHeight: 400, width: '100%' }}
    ></div>
  );
};

export default LiveMatchesWidget;
