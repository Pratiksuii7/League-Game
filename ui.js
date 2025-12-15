const app = document.getElementById("app");

// --- SETUP UI ---
function renderSetup() {
  app.innerHTML = `
    <h2>Step 1: Setup</h2>
    <label>Number of Teams (max ${maxTeams}):</label>
    <input type="number" id="teamCount" min="2" max="${maxTeams}" value="8" oninput="renderTeamNameInputs()">
    <div id="teamNamesContainer"></div>
    <button onclick="startLeague()">Generate Teams & Players</button>
  `;
  renderTeamNameInputs();
}

function renderTeamNameInputs() {
  const count = parseInt(document.getElementById("teamCount").value);
  const container = document.getElementById("teamNamesContainer");
  if (isNaN(count) || count < 2 || count > maxTeams) {
    container.innerHTML = `<p style="color:red;">Please choose between 2 and ${maxTeams} teams.</p>`;
    return;
  }

  let html = `<h3>Enter Team Names</h3>`;
  for (let i = 0; i < count; i++) {
    html += `
      <label>Team ${i + 1} Name:</label>
      <input type="text" id="teamNameInput${i}" value="Team ${i + 1}">
    `;
  }
  container.innerHTML = html;
}

function startLeague() {
  const count = parseInt(document.getElementById("teamCount").value);
  if (isNaN(count) || count < 2 || count > maxTeams) {
    alert(`Please enter between 2 and ${maxTeams}`);
    return;
  }

  // Collect custom names
  let customNames = [];
  for (let i = 0; i < count; i++) {
    const val = document.getElementById(`teamNameInput${i}`).value.trim();
    customNames.push(val || `Team ${i + 1}`);
  }

  generateTeams(count, customNames);
  generateFixtures();
  renderLeagueUI();
}

// --- LEAGUE UI ---
function renderLeagueUI() {
  app.innerHTML = `
    <h2>League Matches & Table</h2>
    <div class="match-simulation">
      <button onclick="simulateNextMatch()">Simulate Next Match</button>
      <button onclick="simulateAllMatches()">Simulate All Remaining</button>
      <button onclick="startKnockouts()">Start Knockouts</button>
      <button onclick="showLeagueStats()">View League Stats/Awards</button>
      <button onclick="renderPlayerListUI()">Manage Player Database</button>
      <button onclick="regenerateAllPlayers()">Generate Random Players for All Teams</button>
      <button onclick="restartLeague()">Restart Tournament</button>
      <button onclick="viewMatchHistory()">View Match History</button>
      <button onclick="viewTrophyRoom()">🏆 Trophy Room & Records</button>
    </div>

    <div class="team-management">
      <h3>Team Management</h3>
      <label>Choose Team:</label>
      <select id="teamSelect">
        ${teams.map((t) => `<option value="${t.id}">${t.name}</option>`).join("")}
      </select>

      <button onclick="generateRandomPlayersForSelectedTeam()">Generate Random Players for Selected Team</button>

      <h4>Add New Player to Selected Team</h4>
      <input type="text" id="newPlayerName" placeholder="Player Name">
      <button onclick="addPlayerToSelectedTeam()">Add Player</button>
    </div>

    <div id="currentMatch"></div>
    <div id="leagueTable"></div>
  `;

  renderCurrentMatch();
  renderLeagueTable();
}

function renderCurrentMatch() {
  const c = document.getElementById("currentMatch");
  if (currentMatchIndex >= fixtures.length) {
    c.innerHTML = `<h3>All matches completed!</h3>`;
    return;
  }
  const m = fixtures[currentMatchIndex];
  c.innerHTML = `
    <h3>Match ${currentMatchIndex + 1}/${fixtures.length}</h3>
    <strong>${m.home.name}</strong> vs <strong>${m.away.name}</strong>
    <label>Home Score:</label>
    <input id="homeScoreInput" placeholder="Leave empty for random">
    <label>Away Score:</label>
    <input id="awayScoreInput" placeholder="Leave empty for random">
    <button onclick="saveMatchResult()">Save Result & Next</button>
  `;
}

function renderLeagueTable() {
  const c = document.getElementById("leagueTable");
  const sorted = [...teams].sort(
    (a, b) =>
      b.stats.points - a.stats.points ||
      b.stats.goalsFor - b.stats.goalsAgainst - (a.stats.goalsFor - a.stats.goalsAgainst) ||
      b.stats.goalsFor - a.stats.goalsFor
  );
  
  let html = `<h2>League Table</h2><table>
    <thead><tr>
      <th>#</th><th>Team</th><th>OVR</th><th>P</th><th>W</th><th>D</th><th>L</th>
      <th>GF</th><th>GA</th><th>GD</th><th>Points</th>
    </tr></thead><tbody>`;
    
  sorted.forEach((t, i) => {
    const gd = t.stats.goalsFor - t.stats.goalsAgainst;
    const avgRating = t.players.length > 0
        ? (t.players.reduce((sum, p) => sum + (p.rating || 70), 0) / t.players.length).toFixed(0)
        : "-";

    html += `<tr class="team-row" style="background-color:${t.color}; color:white;" onclick="showTeamStats(${t.id})">
      <td>${i + 1}</td><td>${t.name}</td><td>${avgRating}</td>
      <td>${t.stats.played}</td><td>${t.stats.wins}</td><td>${t.stats.draws}</td><td>${t.stats.losses}</td>
      <td>${t.stats.goalsFor}</td><td>${t.stats.goalsAgainst}</td><td>${gd}</td><td>${t.stats.points}</td>
    </tr>`;
  });
  html += `</tbody></table>`;
  c.innerHTML = html;
}

// --- ACTIONS ---
function simulateNextMatch() {
  if (currentMatchIndex >= fixtures.length) return;
  const match = fixtures[currentMatchIndex];
  
  const result = calculateMatchScore(match.home, match.away);
  match.homeScore = result.homeScore;
  match.awayScore = result.awayScore;
  
  match.played = true;
  updateTeamStats(match);
  distributePlayerStats(match, match.homeScore, match.awayScore);
  currentMatchIndex++;
  renderCurrentMatch();
  renderLeagueTable();
  matchHistory.push({
    homeTeam: match.home.name,
    awayTeam: match.away.name,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
  });
  localStorage.setItem("matchHistory", JSON.stringify(matchHistory));
  checkSeasonEnd();
}

function simulateAllMatches() {
  while (currentMatchIndex < fixtures.length) simulateNextMatch();
}

function saveMatchResult() {
  const hVal = document.getElementById("homeScoreInput").value;
  const aVal = document.getElementById("awayScoreInput").value;
  const homeScore = hVal === "" ? randomInt(0, 15) : parseInt(hVal);
  const awayScore = aVal === "" ? randomInt(0, 15) : parseInt(aVal);
  if (isNaN(homeScore) || isNaN(awayScore)) return alert("Invalid score!");
  
  const m = fixtures[currentMatchIndex];
  m.homeScore = homeScore;
  m.awayScore = awayScore;
  matchHistory.push({
    homeTeam: m.home.name,
    awayTeam: m.away.name,
    homeScore,
    awayScore,
  });
  localStorage.setItem("matchHistory", JSON.stringify(matchHistory));

  if (homeScore < 0 || awayScore < 0) return alert("Scores must be non-negative!");

  updateTeamStats(m);
  distributePlayerStats(m, homeScore, awayScore);

  currentMatchIndex++;
  renderCurrentMatch();
  renderLeagueTable();
  checkSeasonEnd();
}

function regenerateAllPlayers() {
  const customNames = teams.map((t) => t.name);
  generateTeams(teams.length, customNames);
  generateFixtures();
  renderLeagueUI();
}

function restartLeague() {
  if (confirm("Are you sure you want to restart the tournament? All data will be lost!")) {
    teams = [];
    fixtures = [];
    currentMatchIndex = 0;
    renderSetup();
  }
}

function generateRandomPlayersForSelectedTeam() {
  const teamId = parseInt(document.getElementById("teamSelect").value);
  const team = teams.find((t) => t.id === teamId);
  if (!team) return alert("Team not found!");
  
  // Use the logic from gameLogic.js but we need to expose it or replicate it.
  // Since we are in global scope, we can call generateRandomPlayersForTeam(index)
  // But we need the index in the teams array, not just ID.
  const index = teams.findIndex(t => t.id === teamId);
  generateRandomPlayersForTeam(index);
  
  alert(`Generated 17 random players for ${team.name}!`);
  renderLeagueTable(); // Update OVR
}

function addPlayerToSelectedTeam() {
  const teamId = parseInt(document.getElementById("teamSelect").value);
  const team = teams.find((t) => t.id === teamId);
  if (!team) return alert("Team not found!");

  const name = document.getElementById("newPlayerName").value.trim();
  if (!name) return alert("Enter player name!");

  const playerData = getPlayerData(name);
  team.players.push(createPlayerObject(playerData.name, playerData.rating, playerData.position));

  document.getElementById("newPlayerName").value = "";
  alert(`Added ${name} to ${team.name}!`);
  renderLeagueTable(); // Update OVR
}

// --- POPUPS & STATS ---
function closePopup() {
  document.querySelectorAll(".popup-overlay").forEach((d) => d.remove());
  document.getElementById("popup").style.display = "none";
}

function showPopup(content) {
  // Remove existing overlays
  document.querySelectorAll(".popup-overlay").forEach((d) => d.remove());
  
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";
  const box = document.createElement("div");
  box.className = "popup-content";
  box.innerHTML = content;
  overlay.appendChild(box);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePopup();
  });
  document.body.appendChild(overlay);
}

function closePopup() {
  document.querySelectorAll(".popup-overlay").forEach((d) => d.remove());
}

function showTeamStats(id) {
  const t = teams.find((x) => x.id === id);
  if (!t) return;

  const avgRating = t.players.length > 0
    ? (t.players.reduce((sum, p) => sum + (p.rating || 70), 0) / t.players.length).toFixed(1)
    : "N/A";

  let html = `<h2>${t.name} Team Stats</h2>`;
  html += `<div style="text-align:center; margin-bottom:20px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px;">
    <div style="font-size: 1.4em; margin-bottom: 10px; color: gold;">Overall Rating: <strong>${avgRating}</strong></div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div>Played: <strong>${t.stats.played}</strong></div>
        <div>Wins: <strong>${t.stats.wins}</strong></div>
        <div>Draws: <strong>${t.stats.draws}</strong></div>
        <div>Losses: <strong>${t.stats.losses}</strong></div>
        <div>GF: <strong>${t.stats.goalsFor}</strong></div>
        <div>GA: <strong>${t.stats.goalsAgainst}</strong></div>
        <div>Points: <strong>${t.stats.points}</strong></div>
    </div>
  </div>`;

  html += `<h3>Players & Stats</h3><div class="player-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">`;
  t.players.forEach((p) => {
    let nameColor = `hsl(${randomInt(0, 360)}, 80%, 60%)`;
    let cardBg = 'rgba(255,255,255,0.05)';
    let border = 'none';
    
    // Position badge color
    let posColor = '';
    if (p.position === 'GK') posColor = '#fbc531';
    else if (p.position === 'DEF') posColor = '#4cd137';
    else if (p.position === 'MID') posColor = '#00d2d3';
    else posColor = '#e84118'; // FWD
    
    // VIP Colors for 95+
    if (p.rating >= 99) {
        nameColor = '#ff0000'; // Red for 99
        cardBg = 'linear-gradient(135deg, rgba(255,0,0,0.2), rgba(0,0,0,0.5))';
        border = '1px solid #ff0000';
    } else if (p.rating >= 97) {
        nameColor = '#00ffea'; // Cyan for 97-98
        cardBg = 'linear-gradient(135deg, rgba(0,255,234,0.15), rgba(0,0,0,0.5))';
        border = '1px solid #00ffea';
    } else if (p.rating >= 95) {
        nameColor = '#ff00ea'; // Magenta for 95-96
        cardBg = 'linear-gradient(135deg, rgba(255,0,234,0.15), rgba(0,0,0,0.5))';
        border = '1px solid #ff00ea';
    }

    html += `<div style="background: ${cardBg}; border: ${border}; padding: 10px; border-radius: 5px; cursor: pointer; transition: transform 0.2s;" 
             onclick="closePopup(); renderPlayerListUI();"
             onmouseover="this.style.transform='scale(1.05)'" 
             onmouseout="this.style.transform='scale(1)'">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
        <span style="color:${nameColor}; font-weight:bold; font-size: 1.1em; text-shadow: 0 0 5px rgba(0,0,0,0.5);">${p.name}</span>
        <span style="background:${posColor}; color:#000; padding:2px 6px; border-radius:3px; font-size:0.7em; font-weight:bold;">${p.position}</span>
      </div>
      <div style="font-size:0.9em; color:#aaa; margin-bottom: 5px;">Rating: <span style="color: ${p.rating >= 95 ? nameColor : 'gold'}; font-weight:bold;">${p.rating}</span></div>
      <div style="font-size: 0.85em; line-height: 1.4;">
        ⚽ ${p.goals} | 🅰️ ${p.assists}
      </div>
    </div>`;
  });
  html += `</div><button onclick="closePopup()" style="margin-top: 20px; width: 100%;">Close</button>`;
  showPopup(html);
}

function showLeagueStats() {
  if (fixtures.every((f) => !f.played)) {
    showPopup("<h2>League Awards</h2><p style='text-align:center;'>No matches have been played yet!</p><button onclick='closePopup()'>Close</button>");
    return;
  }

  let awards = `<h2>🏆 League Awards</h2>`;
  awards += `
    <div class="tab-buttons" style="display:flex; flex-wrap:wrap; gap:5px; justify-content:center; margin-bottom:15px;">
      <button class="active" onclick="showStatsTab('scorers')">Top Scorers</button>
      <button onclick="showStatsTab('assisters')">Top Assisters</button>
      <button onclick="showStatsTab('yellow')">Yellow Cards</button>
      <button onclick="showStatsTab('red')">Red Cards</button>
      <button onclick="showStatsTab('penalties')">Penalties</button>
      <button onclick="showStatsTab('freekicks')">Freekicks</button>
      <button onclick="showStatsTab('passing')">Passing Accuracy</button>
    </div>
    <div class="tab-content" id="statsTabContent"></div>
    <button onclick="closePopup()" style="margin-top:15px; width:100%;">Close</button>
  `;

  showPopup(awards);
  generateStatsPopup();
}

function generateStatsPopup() {
  showStatsTab("scorers");
}

function showStatsTab(tab) {
  let players = teams.flatMap((t) => t.players);
  let sorted;
  let title;
  let valueFormatter = (p) => "";

  switch (tab) {
    case "scorers":
      sorted = players.sort((a, b) => b.goals - a.goals);
      title = "Top 20 Scorers";
      valueFormatter = (p) => `${p.goals} Goals`;
      break;
    case "assisters":
      sorted = players.sort((a, b) => b.assists - a.assists);
      title = "Top 20 Assisters";
      valueFormatter = (p) => `${p.assists} Assists`;
      break;
    case "yellow":
      sorted = players.sort((a, b) => b.yellowCards - a.yellowCards);
      title = "Most Yellow Cards";
      valueFormatter = (p) => `${p.yellowCards}`;
      break;
    case "red":
      sorted = players.sort((a, b) => b.redCards - a.redCards);
      title = "Most Red Cards";
      valueFormatter = (p) => `${p.redCards}`;
      break;
    case "penalties":
      sorted = players.sort((a, b) => b.penalties - a.penalties);
      title = "Top Penalty Scorers";
      valueFormatter = (p) => `${p.penalties}`;
      break;
    case "freekicks":
      sorted = players.sort((a, b) => b.freekicks - a.freekicks);
      title = "Top Freekick Scorers";
      valueFormatter = (p) => `${p.freekicks}`;
      break;
    case "passing":
      // Filter players with at least 10 attempts to avoid 1/1 = 100%
      sorted = players.filter(p => p.passesAttempted > 10).sort((a, b) => {
          const accA = (a.passesCompleted / a.passesAttempted) || 0;
          const accB = (b.passesCompleted / b.passesAttempted) || 0;
          return accB - accA;
      });
      title = "Best Passing Accuracy (Min 10 attempts)";
      valueFormatter = (p) => {
          const acc = ((p.passesCompleted / p.passesAttempted) * 100).toFixed(1);
          return `${acc}% (${p.passesCompleted}/${p.passesAttempted})`;
      };
      break;
  }

  let html = `<h3>${title}</h3>`;
  html += `<table class="player-stats-table" style="width:100%; border-collapse:collapse;">
    <tr style="background:rgba(255,255,255,0.1);"><th style="padding:8px;">#</th><th style="padding:8px;">Name</th><th style="padding:8px;">Stat</th></tr>`;
  
  sorted.slice(0, 20).forEach((p, i) => {
    if (tab !== 'passing' && valueFormatter(p).startsWith('0')) return; // Skip 0 stats for non-passing
    
    const color = `hsl(${randomInt(0, 360)}, 80%, 60%)`;
    let nameStyle = `color:${color}; font-weight:bold; padding:8px;`;
    
    // Apply special styles for Icons and VIPs in stats view
    if (p.type === "Icon") {
        if (p.rating >= 95) {
             // VIP Icon (Diamond/Platinum)
             nameStyle = 'color: #E0FFFF; text-shadow: 0 0 8px rgba(224, 255, 255, 0.8); font-family: "Orbitron", sans-serif; font-weight:bold; padding:8px;';
        } else {
             // Normal Icon (Gold)
             nameStyle = 'color: #F6E3BA; text-shadow: 0 0 5px rgba(246, 227, 186, 0.6); font-family: "Orbitron", sans-serif; font-weight:bold; padding:8px;';
        }
    } else if (p.rating >= 99) {
        nameStyle = 'color: #ff4d4d; text-shadow: 0 0 5px rgba(255,0,0,0.4); font-weight:bold; padding:8px;';
    } else if (p.rating >= 97) {
        nameStyle = 'color: #00ffea; text-shadow: 0 0 5px rgba(0,255,234,0.4); font-weight:bold; padding:8px;';
    } else if (p.rating >= 95) {
        nameStyle = 'color: #ff00ea; text-shadow: 0 0 5px rgba(255,0,234,0.4); font-weight:bold; padding:8px;';
    }

    html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:8px;">${i + 1}</td>
        <td style="${nameStyle}">${p.name}</td>
        <td style="padding:8px;">${valueFormatter(p)}</td>
    </tr>`;
  });
  html += `</table>`;

  const content = document.getElementById("statsTabContent");
  if(content) content.innerHTML = html;

  document.querySelectorAll(".tab-buttons button").forEach((btn) => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`.tab-buttons button[onclick*="${tab}"]`);
  if(activeBtn) activeBtn.classList.add("active");
}

function viewMatchHistory() {
  if (matchHistory.length === 0) {
    showPopup("<h2>Match History</h2><p>No matches yet.</p><button onclick='closePopup()'>Close</button>");
    return;
  }

  let html = "<h2>Match History</h2>";
  matchHistory.forEach((m, i) => {
    html += `<p>${i + 1}. ${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}</p>`;
  });
  html += `<button onclick='clearMatchHistory()'>Clear History</button><button onclick='closePopup()'>Close</button>`;
  showPopup(html);
}

function clearMatchHistory() {
  if (confirm("Clear all match history?")) {
    matchHistory = [];
    localStorage.removeItem("matchHistory");
    viewMatchHistory();
  }
}

// --- KNOCKOUT UI ---
function startKnockouts() {
  const sortedTeams = getSortedTeams();
  const knockoutSize = getKnockoutTeamCount(sortedTeams.length);

  if (sortedTeams.length < knockoutSize) {
    alert(`Not enough teams to run a ${knockoutSize}-team knockout!`);
    return;
  }

  const selectedTeams = sortedTeams.slice(0, knockoutSize);
  shuffleArray(selectedTeams);

  knockoutResults = [];
  knockoutMatches = [];
  if(typeof knockoutHistory !== 'undefined') knockoutHistory = [];
  knockoutStage = 0;

  for (let i = 0; i < selectedTeams.length; i += 2) {
    knockoutMatches.push({
      name: `Round of ${selectedTeams.length}`,
      home: selectedTeams[i],
      away: selectedTeams[i + 1],
    });
  }

  renderNextKnockoutMatch();
}

function renderNextKnockoutMatch() {
  if (knockoutStage < knockoutMatches.length) {
    const m = knockoutMatches[knockoutStage];
    app.innerHTML = `
      <h2>${m.name}</h2>
      <p><strong>${m.home.name}</strong> vs <strong>${m.away.name}</strong></p>
      <label>${m.home.name} Score:</label>
      <input id="homeScoreInput" type="number" min="0">
      <label>${m.away.name} Score:</label>
      <input id="awayScoreInput" type="number" min="0">
      <button onclick="playKnockoutMatch()">Save Result & Next</button>
      <button onclick="simulateCurrentKnockoutMatch()">Simulate This Match</button>
      <button onclick="simulateAllKnockoutMatches()">Simulate All Matches</button>
      <button onclick="renderPlayerListUI()">Player Database</button>
      <button onclick="showLeagueStats()">View League Stats</button>
      <button onclick="viewAwards()">View Team Stats</button>
      <button onclick="restartLeague()">Restart Tournament</button>
      <div id="knockoutBracket"></div>
    `;
  } else {
    if (knockoutResults.length === 1) {
      app.innerHTML = `
        <h2>Champion: ${knockoutResults[0].winner.name}</h2>
        <button onclick="restartLeague()">Restart Tournament</button>
        <button onclick="renderPlayerListUI()">Player Database</button>
        <button onclick="showLeagueStats()">View League Stats</button>
        <button onclick="viewAwards()">View Team Stats</button>
        <div id="knockoutBracket"></div>
      `;
    } else {
      // Advance to next round
      const nextRoundTeams = knockoutResults.map((r) => r.winner);
      
      if(typeof knockoutHistory !== 'undefined') knockoutHistory.push(...knockoutResults);

      knockoutMatches = [];
      knockoutResults = [];
      knockoutStage = 0;

      for (let i = 0; i < nextRoundTeams.length; i += 2) {
        knockoutMatches.push({
          name: `Round of ${nextRoundTeams.length}`,
          home: nextRoundTeams[i],
          away: nextRoundTeams[i + 1],
        });
      }
      renderNextKnockoutMatch();
    }
  }
  renderKnockoutBracket();
}

function playKnockoutMatch() {
  const m = knockoutMatches[knockoutStage];
  const homeScore = parseInt(document.getElementById("homeScoreInput").value) || randomInt(0, 5);
  const awayScore = parseInt(document.getElementById("awayScoreInput").value) || randomInt(0, 5);
  saveKnockoutResult(m, homeScore, awayScore);
  renderNextKnockoutMatch();
}

function simulateCurrentKnockoutMatch() {
  const m = knockoutMatches[knockoutStage];
  const result = calculateMatchScore(m.home, m.away);
  saveKnockoutResult(m, result.homeScore, result.awayScore);
  renderNextKnockoutMatch();
}

function simulateAllKnockoutMatches() {
  while (knockoutStage < knockoutMatches.length || knockoutResults.length > 1) {
    if (knockoutStage < knockoutMatches.length) {
      const m = knockoutMatches[knockoutStage];
      const result = calculateMatchScore(m.home, m.away);
      saveKnockoutResult(m, result.homeScore, result.awayScore);
    } else if (knockoutResults.length > 1) {
      // Advance round logic inside loop
      const nextRoundTeams = knockoutResults.map((r) => r.winner);
      
      if(typeof knockoutHistory !== 'undefined') knockoutHistory.push(...knockoutResults);

      knockoutMatches = [];
      knockoutResults = [];
      knockoutStage = 0;
      for (let i = 0; i < nextRoundTeams.length; i += 2) {
        knockoutMatches.push({
          name: `Round of ${nextRoundTeams.length}`,
          home: nextRoundTeams[i],
          away: nextRoundTeams[i + 1],
        });
      }
    }
  }
  renderNextKnockoutMatch();
}

function renderKnockoutBracket() {
  const bracketDiv = document.getElementById("knockoutBracket");
  if (!bracketDiv) return;

  const roundsMap = new Map();
  
  // Helper to add match to map
  const addMatch = (roundName, home, away, status, winner, homeScore, awayScore) => {
      if(!roundsMap.has(roundName)) roundsMap.set(roundName, []);
      roundsMap.get(roundName).push({
          home, away, status, winner, homeScore, awayScore
      });
  };

  // Process history
  if(typeof knockoutHistory !== 'undefined') {
      knockoutHistory.forEach(res => {
          addMatch(res.match.name, res.match.home, res.match.away, 'played', res.winner, res.homeScore, res.awayScore);
      });
  }
  
  // Process current results
  const playedMatches = new Set();
  knockoutResults.forEach(res => {
      addMatch(res.match.name, res.match.home, res.match.away, 'played', res.winner, res.homeScore, res.awayScore);
      playedMatches.add(res.match);
  });
  
  // Process pending
  knockoutMatches.forEach(m => {
      if(!playedMatches.has(m)) {
          addMatch(m.name, m.home, m.away, 'pending', null, '-', '-');
      }
  });
  
  const sortedRounds = Array.from(roundsMap.keys()).sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numB - numA;
  });
  
  let html = `
    <style>
        .bracket-container {
            display: flex;
            flex-direction: row;
            overflow: auto;
            padding: 20px;
            gap: 40px;
            justify-content: flex-start;
            align-items: flex-start;
            min-height: 600px;
        }
        .bracket-round {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 20px;
            min-width: 200px;
            flex-shrink: 0;
        }
        .bracket-match-card {
            background: rgba(0, 43, 92, 0.8);
            border: 1px solid #4a678f;
            border-radius: 8px;
            padding: 10px;
            position: relative;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
        .team-entry {
            display: flex;
            justify-content: space-between;
            padding: 5px;
            border-radius: 4px;
        }
        .team-winner {
            color: #FFD700;
            font-weight: bold;
            text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
        }
        .team-loser {
            color: #888;
            opacity: 0.5;
        }
        .team-pending {
            color: #fff;
        }
    </style>
    <h3>Tournament Bracket</h3>
    <div class="bracket-container">
  `;
  
  sortedRounds.forEach(roundName => {
      const matches = roundsMap.get(roundName);
      html += `<div class="bracket-round">
        <h4 style="text-align:center; margin-bottom:10px; color:#aaa; font-size: 0.9em;">${roundName}</h4>`;
      
      matches.forEach(m => {
          const homeClass = m.status === 'played' ? (m.winner === m.home ? 'team-winner' : 'team-loser') : 'team-pending';
          const awayClass = m.status === 'played' ? (m.winner === m.away ? 'team-winner' : 'team-loser') : 'team-pending';
          
          html += `
            <div class="bracket-match-card">
                <div class="team-entry ${homeClass}">
                    <span>${m.home.name}</span>
                    <span>${m.homeScore}</span>
                </div>
                <div class="team-entry ${awayClass}">
                    <span>${m.away.name}</span>
                    <span>${m.awayScore}</span>
                </div>
            </div>
          `;
      });
      
      html += `</div>`;
  });
  
  html += `</div>`;
  bracketDiv.innerHTML = html;
}

function viewAwards() {
  let html = `
    <h2>Team Stats (including Knockouts)</h2>
    <table border="1" cellpadding="5">
      <tr>
        <th>Team</th>
        <th>Played</th>
        <th>Wins</th>
        <th>Goals For</th>
        <th>Goals Against</th>
        <th>Points (League Only)</th>
      </tr>
  `;

  teams.forEach((team) => {
    html += `
      <tr>
        <td>${team.name}</td>
        <td>${team.stats.played}</td>
        <td>${team.stats.wins}</td>
        <td>${team.stats.goalsFor}</td>
        <td>${team.stats.goalsAgainst}</td>
        <td>${team.stats.points}</td>
      </tr>
    `;
  });

  html += `</table>
    <button onclick="renderNextKnockoutMatch()">Back to Knockouts</button>
    <button onclick="restartLeague()">Restart Tournament</button>
  `;

  app.innerHTML = html;
}

// --- PLAYER DATABASE UI ---
function renderPlayerListUI() {
  if (teams.length === 0) {
    app.innerHTML = `
      <h2>Player Database</h2>
      <p>Please start the league to view team rosters.</p>
      <button onclick="renderSetup()">Back to Setup</button>
    `;
    return;
  }

  app.innerHTML = `
    <style>
      .roster-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        padding: 1rem;
      }
      @media (max-width: 768px) {
        .roster-grid {
          grid-template-columns: 1fr;
        }
      }
      .team-card {
        background: var(--card-bg);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        border-top: 5px solid var(--primary-color);
      }
      .roster-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
        margin-top: 1rem;
      }
      .roster-table th {
        text-align: center;
        padding: 8px;
        background: rgba(255,255,255,0.05);
        color: #aaa;
        font-weight: 600;
        border-bottom: 2px solid rgba(255,255,255,0.1);
      }
      .roster-table th.name-col {
        text-align: left;
      }
      .roster-table td {
        padding: 8px;
        text-align: center;
        border-bottom: 1px solid rgba(255,255,255,0.05);
      }
      .roster-table td.name-col {
        text-align: left;
        font-weight: bold;
        color: var(--text-color);
      }
      .stat-val {
        color: #fff;
      }
      .rating-val {
        color: var(--primary-color);
        font-weight: bold;
      }
    </style>
    <h2>Player Database</h2>
    <div class="match-simulation" style="margin-bottom: 20px;">
        <button onclick="renderLeagueUI()">Back to League</button>
    </div>
    <div id="rosterContainer" class="roster-grid"></div>
  `;
  
  const container = document.getElementById("rosterContainer");
  let html = "";
  
  teams.forEach(t => {
      html += `<div class="team-card" style="border-top-color: ${t.color};">
        <h3 style="color: ${t.color}; margin: 0; font-size: 1.4rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">${t.name}</h3>
        <table class="roster-table">
            <thead>
                <tr>
                    <th class="name-col">Player</th>
                    <th title="Position">Pos</th>
                    <th title="Overall Rating">OVR</th>
                    <th title="Goals">G</th>
                    <th title="Assists">A</th>
                    <th title="Passing Accuracy">Pass%</th>
                    <th title="Penalties">Pen</th>
                    <th title="Freekicks">FK</th>
                    <th title="Yellow Cards">YC</th>
                    <th title="Red Cards">RC</th>
                </tr>
            </thead>
            <tbody>
                ${t.players.map(p => {
                    const passAcc = p.passesAttempted > 0 ? Math.round((p.passesCompleted / p.passesAttempted) * 100) : 0;
                    
                    let rowStyle = '';
                    let nameStyle = '';
                    let ratingStyle = 'color: var(--primary-color); font-weight: bold;';
                    
                    // Position colors
                    let posColor = '';
                    if (p.position === 'GK') posColor = '#fbc531';
                    else if (p.position === 'DEF') posColor = '#4cd137';
                    else if (p.position === 'MID') posColor = '#00d2d3';
                    else posColor = '#e84118'; // FWD

                    if (p.type === "Icon") {
                        if (p.rating >= 95) {
                            // VIP Icon (Diamond/Platinum)
                            rowStyle = 'background: linear-gradient(90deg, rgba(224, 255, 255, 0.2), transparent); border-left: 3px solid #E0FFFF;';
                            nameStyle = 'color: #E0FFFF; text-shadow: 0 0 10px rgba(224, 255, 255, 0.8); font-family: "Orbitron", sans-serif; letter-spacing: 1px;';
                            ratingStyle = 'color: #E0FFFF; font-weight: 800; text-shadow: 0 0 8px rgba(224, 255, 255, 0.6);';
                        } else {
                            // Normal Icon (Gold)
                            rowStyle = 'background: linear-gradient(90deg, rgba(246, 227, 186, 0.15), transparent); border-left: 3px solid #F6E3BA;';
                            nameStyle = 'color: #F6E3BA; text-shadow: 0 0 8px rgba(246, 227, 186, 0.6); font-family: "Orbitron", sans-serif; letter-spacing: 1px;';
                            ratingStyle = 'color: #F6E3BA; font-weight: 800; text-shadow: 0 0 5px rgba(246, 227, 186, 0.5);';
                        }
                    } else if (p.rating >= 99) {
                        rowStyle = 'background: linear-gradient(90deg, rgba(255,0,0,0.1), transparent);';
                        nameStyle = 'color: #ff4d4d; text-shadow: 0 0 8px rgba(255,0,0,0.4);';
                        ratingStyle = 'color: #ff4d4d; font-weight: 800;';
                    } else if (p.rating >= 97) {
                        rowStyle = 'background: linear-gradient(90deg, rgba(0,255,234,0.1), transparent);';
                        nameStyle = 'color: #00ffea; text-shadow: 0 0 8px rgba(0,255,234,0.4);';
                        ratingStyle = 'color: #00ffea; font-weight: 800;';
                    } else if (p.rating >= 95) {
                        rowStyle = 'background: linear-gradient(90deg, rgba(255,0,234,0.1), transparent);';
                        nameStyle = 'color: #ff00ea; text-shadow: 0 0 8px rgba(255,0,234,0.4);';
                        ratingStyle = 'color: #ff00ea; font-weight: 800;';
                    }

                    return `
                    <tr style="${rowStyle}">
                        <td class="name-col" style="${nameStyle}">${p.name}</td>
                        <td class="stat-val" style="color: ${posColor}; font-weight: bold;">${p.position}</td>
                        <td class="rating-val" style="${ratingStyle}">${p.rating}</td>
                        <td class="stat-val">${p.goals}</td>
                        <td class="stat-val">${p.assists}</td>
                        <td class="stat-val" style="color: ${passAcc > 85 ? '#4cd137' : passAcc > 70 ? '#fbc531' : '#e84118'}">${passAcc}%</td>
                        <td class="stat-val">${p.penalties}</td>
                        <td class="stat-val">${p.freekicks}</td>
                        <td class="stat-val" style="${p.yellowCards > 0 ? 'color:#fbc531' : ''}">${p.yellowCards}</td>
                        <td class="stat-val" style="${p.redCards > 0 ? 'color:#e84118; font-weight:bold;' : ''}">${p.redCards}</td>
                    </tr>
                `}).join('')}
            </tbody>
        </table>
      </div>`;
  });
  container.innerHTML = html;
}

function addPlayerToDBFromUI() {
    const name = document.getElementById("dbNewName").value.trim();
    const rating = parseInt(document.getElementById("dbNewRating").value);
    
    if(!name || isNaN(rating)) {
        alert("Please enter valid name and rating.");
        return;
    }
    
    addNewPlayerToDB(name, rating);
    alert(`Added ${name} to database!`);
    renderPlayerListUI();
}

function deletePlayerFromDB(name) {
    if(confirm(`Delete ${name} from database?`)) {
        const idx = playerDatabase.findIndex(p => p.name === name);
        if(idx !== -1) {
            playerDatabase.splice(idx, 1);
            renderPlayerListUI();
        }
    }
}

function resetPlayerDatabase() {
    if(confirm("Reset database to original defaults? This cannot be undone.")) {
        // Reload page or re-initialize playerDatabase if we had a backup. 
        // Since we don't have a backup in memory, reloading is safest to get original state if it was hardcoded.
        // But wait, player.js initializes it. If we modified it in memory, we can't easily reset without reloading.
        location.reload();
    }
}

function checkSeasonEnd() {
    if (currentMatchIndex >= fixtures.length) {
        // Season finished
        const sortedTeams = [...teams].sort(
            (a, b) =>
            b.stats.points - a.stats.points ||
            b.stats.goalsFor - b.stats.goalsAgainst - (a.stats.goalsFor - a.stats.goalsAgainst) ||
            b.stats.goalsFor - a.stats.goalsFor
        );
        
        // Find top scorer
        let topScorer = { name: "N/A", goals: 0 };
        teams.forEach(t => {
            t.players.forEach(p => {
                if (p.goals > topScorer.goals) {
                    topScorer = { name: p.name, goals: p.goals };
                }
            });
        });
        
        const seasonRecord = {
            champion: sortedTeams[0].name,
            runnerUp: sortedTeams[1] ? sortedTeams[1].name : "N/A",
            thirdPlace: sortedTeams[2] ? sortedTeams[2].name : "N/A",
            topScorer: topScorer.name,
            topScorerGoals: topScorer.goals
        };
        
        // Check if this season is already recorded (simple check by length or ID if we had one)
        // Since we only call this when match index increments, it might be called multiple times if we are not careful.
        // But currentMatchIndex >= fixtures.length is the condition.
        // To avoid duplicates, we can check if the last season in history matches this one?
        // Or just rely on the user restarting.
        // Better: Only add if we haven't added it yet.
        // But we don't have a "seasonId".
        // Let's just add it. The user is expected to restart after season ends.
        
        // Wait, if I click "Simulate All", it runs this loop.
        // If I click "Simulate Next" on the last match, it runs this.
        // We should probably have a flag "seasonEnded".
        
        if (seasonHistory.length > 0) {
             // Prevent duplicate addition if we just finished
             // This is a bit hacky but works for now.
        }

        seasonHistory.push(seasonRecord);
        localStorage.setItem("seasonHistory", JSON.stringify(seasonHistory));
        
        updateGlobalRecords(seasonHistory.length - 1);
        
        alert(`Season Ended! Champion: ${seasonRecord.champion}`);
    }
}

function viewTrophyRoom() {
    // Safety check for globalRecords
    if (typeof globalRecords === 'undefined') {
        alert("Error: Global records not initialized. Please restart the game.");
        return;
    }

    let html = `<h2 style="text-align:center; font-size:2.5rem; margin-bottom:20px; color:gold; text-shadow:0 0 10px rgba(255,215,0,0.5);">🏆 Trophy Room & Hall of Fame</h2>`;
    
    html += `<div style="display:grid; grid-template-columns: 1fr 2fr; gap:30px; align-items:start;">`;
    
    // --- LEFT COLUMN: Season History ---
    html += `<div style="background:rgba(0,0,0,0.3); padding:20px; border-radius:15px; border:1px solid #444; max-height:600px; overflow-y:auto;">
        <h3 style="border-bottom:2px solid gold; padding-bottom:10px; margin-top:0;">📜 Season History</h3>`;
    
    if (!seasonHistory || seasonHistory.length === 0) {
        html += `<p style="text-align:center; color:#aaa; font-style:italic;">No seasons completed yet.</p>`;
    } else {
        html += `<div style="display:flex; flex-direction:column; gap:15px;">`;
        seasonHistory.forEach((s, i) => {
            html += `
            <div style="background:linear-gradient(135deg, #222, #333); padding:15px; border-radius:10px; border-left:5px solid gold; box-shadow:0 4px 8px rgba(0,0,0,0.3);">
                <div style="font-size:1.2rem; font-weight:bold; color:gold; margin-bottom:5px;">Season ${i + 1}</div>
                <div style="font-size:1.1rem;">🏆 <span style="color:white;">${s.champion}</span></div>
                <div style="font-size:0.9rem; color:#ccc; margin-top:5px;">🥈 ${s.runnerUp}</div>
                <div style="font-size:0.9rem; color:#ccc;">🥉 ${s.thirdPlace}</div>
                <div style="margin-top:8px; padding-top:8px; border-top:1px solid #555; font-size:0.85rem; color:#aaa;">
                    ⚽ Top Scorer: <span style="color:white;">${s.topScorer}</span> (${s.topScorerGoals})
                </div>
            </div>`;
        });
        html += `</div>`;
    }
    html += `</div>`;

    // --- RIGHT COLUMN: Global Records ---
    html += `<div style="display:flex; flex-direction:column; gap:20px;">
        <h3 style="border-bottom:2px solid gold; padding-bottom:10px; margin-top:0;">🌟 All-Time Records (Top 10)</h3>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            
            <!-- Most Goals -->
            <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:10px; border:1px solid #444;">
                <h4 style="color:#ff6b6b; margin-top:0;">⚽ Most Goals (Season)</h4>
                <table style="width:100%; font-size:0.85rem; border-collapse:collapse;">
                    <tr style="background:rgba(255,255,255,0.1);"><th style="padding:5px;">Player</th><th>Team</th><th>G</th><th>S</th></tr>
                    ${(globalRecords.topScorers || []).map((p, idx) => `
                        <tr style="border-bottom:1px solid #333; background:${idx===0?'rgba(255,215,0,0.1)':''};">
                            <td style="padding:5px;">${p.name}</td><td>${p.team}</td><td style="font-weight:bold; color:#ff6b6b;">${p.goals}</td><td>${p.season}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>

            <!-- Most Assists -->
            <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:10px; border:1px solid #444;">
                <h4 style="color:#4ecdc4; margin-top:0;">👟 Most Assists (Season)</h4>
                <table style="width:100%; font-size:0.85rem; border-collapse:collapse;">
                    <tr style="background:rgba(255,255,255,0.1);"><th style="padding:5px;">Player</th><th>Team</th><th>A</th><th>S</th></tr>
                    ${(globalRecords.topAssisters || []).map((p, idx) => `
                        <tr style="border-bottom:1px solid #333; background:${idx===0?'rgba(255,215,0,0.1)':''};">
                            <td style="padding:5px;">${p.name}</td><td>${p.team}</td><td style="font-weight:bold; color:#4ecdc4;">${p.assists}</td><td>${p.season}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>

            <!-- Most Points -->
            <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:10px; border:1px solid #444;">
                <h4 style="color:#ffe66d; margin-top:0;">🛡️ Most Points (Team)</h4>
                <table style="width:100%; font-size:0.85rem; border-collapse:collapse;">
                    <tr style="background:rgba(255,255,255,0.1);"><th style="padding:5px;">Team</th><th>Pts</th><th>S</th></tr>
                    ${(globalRecords.topTeamPoints || []).map((t, idx) => `
                        <tr style="border-bottom:1px solid #333; background:${idx===0?'rgba(255,215,0,0.1)':''};">
                            <td style="padding:5px;">${t.team}</td><td style="font-weight:bold; color:#ffe66d;">${t.points}</td><td>${t.season}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
            
            <!-- Most Team Goals -->
            <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:10px; border:1px solid #444;">
                <h4 style="color:#ff9f43; margin-top:0;">🔥 Most Goals (Team)</h4>
                <table style="width:100%; font-size:0.85rem; border-collapse:collapse;">
                    <tr style="background:rgba(255,255,255,0.1);"><th style="padding:5px;">Team</th><th>GF</th><th>S</th></tr>
                    ${(globalRecords.topTeamGoals || []).map((t, idx) => `
                        <tr style="border-bottom:1px solid #333; background:${idx===0?'rgba(255,215,0,0.1)':''};">
                            <td style="padding:5px;">${t.team}</td><td style="font-weight:bold; color:#ff9f43;">${t.goals}</td><td>${t.season}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>

        </div>
    </div>`;
    
    html += `</div>`; // End Grid
    html += `<button onclick="closePopup()" style="margin-top:20px; width:100%; padding:15px; font-size:1.2rem;">Close Trophy Room</button>`;
    
    showPopup(html);
}
