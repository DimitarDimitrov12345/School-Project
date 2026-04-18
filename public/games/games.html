<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Футболни мачове</title>
    <link rel="stylesheet" href="/games/widgets.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            padding: 12px;
            background: #0d1b2a;
            font-family: "Raleway", sans-serif;
            overflow-x: hidden;
        }
        #myP { display: none; }
        #wg-api-football-games {
            display: flex;
            flex-direction: column;
            width: 100%;
        }
        .wg_toolbar { 
            display: flex; 
            gap: 8px; 
            flex-wrap: wrap;
            margin-bottom: 12px; 
            justify-content: center;
            padding: 6px 0;
            border-bottom: 1px solid rgba(1, 208, 153, 0.2);
        }
        .wg-table { 
            width: 100%; 
            margin-top: 0;
            font-size: 13px;
        }
        td { padding: 6px 4px; }
    </style>
</head>
<body>
    <p id="myP"></p>
    <div id="wg-api-football-games"></div>

    <script type="module">
        import { football_games } from '/games/games.js';

        window.addEventListener("DOMContentLoaded", initWidget);
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initWidget);
        } else {
            initWidget();
        }

        function initWidget() {
            const container = document.getElementById("wg-api-football-games");
            
            // Get date from URL parameter, default to today
            const urlParams = new URLSearchParams(window.location.search);
            let selectedDate = urlParams.get('date');
            
            // If no date provided, calculate today's date
            if (!selectedDate) {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                selectedDate = `${year}-${month}-${day}`;
            }
            
            // Create structure with date header
            const html = `
                <div id="wg-football-toolbar" class="wg_toolbar">
                    <span class="wg_button_toggle wg_active" data-select="all">ВСИЧКИ</span>
                    <span class="wg_button_toggle" data-select="finished">ЗАВЪРШИЛИ</span>
                    <span class="wg_button_toggle" data-select="scheduled">ПРЕДСТОЯЩИ</span>
                </div>
                <div id="wg-football-data" class="wg_loader"></div>
            `;
            
            container.innerHTML = html;
            
            // Load games data with the selected date
            football_games(selectedDate, "", "", "", "v3.football.api-sports.io", "false", "true", "false", "true");
            
            // Setup button event listeners
            setTimeout(setupButtonListeners, 300);
        }

        function setupButtonListeners() {
            const buttons = document.querySelectorAll(".wg_button_toggle");
            const dataDiv = document.getElementById("wg-football-data");
            
            buttons.forEach(btn => {
                btn.addEventListener("click", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Update active state
                    buttons.forEach(b => b.classList.remove("wg_active"));
                    this.classList.add("wg_active");
                    
                    const filterType = this.getAttribute("data-select");
                    const allRows = dataDiv.querySelectorAll("tbody tr");
                    const allLeagueHeaders = dataDiv.querySelectorAll("tr[id^='football-league-']");
                    
                    // First, show/hide game rows based on filter
                    allRows.forEach(row => {
                        const status = row.getAttribute("data-status");
                        if (!status) return; // Skip header rows
                        
                        let show = true;
                        
                        if (filterType === "finished") {
                            show = ["FT", "AET", "PEN"].includes(status);
                        } else if (filterType === "scheduled") {
                            show = status === "NS";
                        }
                        // "all" shows everything
                        
                        row.style.display = show ? "" : "none";
                    });
                    
                    // Hide league headers that have no visible games
                    allLeagueHeaders.forEach(header => {
                        const leagueId = header.id.replace("football-league-", "");
                        const leagueGames = dataDiv.querySelectorAll(`tr[data-league="${leagueId}"]`);
                        let hasVisibleGames = false;
                        
                        leagueGames.forEach(game => {
                            if (game.style.display !== "none") {
                                hasVisibleGames = true;
                            }
                        });
                        
                        header.style.display = hasVisibleGames ? "" : "none";
                    });
                });
            });
        }
    </script>
</body>
</html>