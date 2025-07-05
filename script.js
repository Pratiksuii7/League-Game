
      // ----------------- SETUP & VARIABLES -----------------
      const app = document.getElementById("app");

      // Load existing history on page load
      let matchHistory = [];
      const storedHistory = localStorage.getItem("matchHistory");
      if (storedHistory) matchHistory = JSON.parse(storedHistory);
      const maxTeams = 64;
      let teams = [],
        fixtures = [],
        currentMatchIndex = 0;

      // ----------------- RANDOM UTIL -----------------
      function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      // ----------------- PLAYER NAMES -----------------
      const samplePlayers = [
        "Lionel Messi",
        "Cristiano Ronaldo",
        "Neymar Jr",
        "Kylian Mbappé",
        "Kevin De Bruyne",
        "Robert Lewandowski",
        "Virgil van Dijk",
        "Sergio Ramos",
        "Mohamed Salah",
        "Harry Kane",
        "Luka Modrić",
        "Toni Kroos",
        "Erling Haaland",
        "Sadio Mané",
        "Karim Benzema",
        "Paul Pogba",
        "Raheem Sterling",
        "Jan Oblak",
        "Manuel Neuer",
        "Alisson Becker",
        "Trent Alexander-Arnold",
        "Jadon Sancho",
        "Bruno Fernandes",
        "Thibaut Courtois",
        "Zlatan Ibrahimović",
        "Pierre-Emerick Aubameyang",
        "Son Heung-min",
        "Joshua Kimmich",
        "Gareth Bale",
        "Ederson Moraes",
        "Ciro Immobile",
        "Angel Di Maria",
        "Sergio Agüero",
        "David De Gea",
        "Kalidou Koulibaly",
        "Marquinhos",
        "Thomas Müller",
        "Marco Reus",
        "Paulo Dybala",
        "N'Golo Kanté",
        "Mason Mount",
        "Frenkie de Jong",
        "Christian Eriksen",
        "Hakim Ziyech",
        "Romelu Lukaku",
        "Antoine Griezmann",
        "Philippe Coutinho",
        "Alvaro Morata",
        "Gerard Piqué",
        "Gianluigi Donnarumma",
        "Achraf Hakimi",
        "Riyad Mahrez",
        "João Félix",
        "Marcus Rashford",
        "Jack Grealish",
        "Bukayo Saka",
        "Alisson Becker",
        "Thibaut Courtois",
        "Mike Maignan",
        "Marc-André ter Stegen",
        "Ederson",
        "Jan Oblak",
        "Gianluigi Donnarumma",
        "Diogo Costa",
        "David Raya",
        "Keylor Navas",
        "Emiliano Martínez",
        "Wojciech Szczęsny",
        "André Onana",
        "Yassine Bounou",
        "Robert Sánchez",
        "Aaron Ramsdale",
        "Virgil van Dijk",
        "Rúben Dias",
        "William Saliba",
        "Matthijs de Ligt",
        "Eder Militão",
        "Antonio Rüdiger",
        "Dayot Upamecano",
        "Kalidou Koulibaly",
        "Aymeric Laporte",
        "Ibrahima Konaté",
        "Lisandro Martínez",
        "Josko Gvardiol",
        "Alessandro Bastoni",
        "Ronald Araújo",
        "Pau Torres",
        "Gvardiol",
        "Ben White",
        "John Stones",
        "Fikayo Tomori",
        "Milan Škriniar",
        "Nathan Aké",
        "Theo Hernández",
        "Alphonso Davies",
        "Andrew Robertson",
        "Jordi Alba",
        "Luke Shaw",
        "Joao Cancelo",
        "Achraf Hakimi",
        "Trent Alexander-Arnold",
        "Reece James",
        "Kieran Trippier",
        "João Cancelo",
        "Aaron Wan-Bissaka",
        "Kyle Walker",
        "Nuno Mendes",
        "Alex Grimaldo",
        "Ferland Mendy",
        "Ricardo Pereira",
        "Noussair Mazraoui",
        "Raphael Guerreiro",
        "Takehiro Tomiyasu",
        "Leonardo Spinazzola",
        "Alejandro Balde",
        "Benjamin Pavard",
        "Denzel Dumfries",
        "Dani Carvajal",
        "Marcos Acuña",
        "Ivan Perišić",
        "Kevin De Bruyne",
        "Luka Modrić",
        "Toni Kroos",
        "Jude Bellingham",
        "Rodri",
        "Declan Rice",
        "Enzo Fernández",
        "Frenkie de Jong",
        "Bruno Fernandes",
        "Martin Ødegaard",
        "Pedri",
        "Gavi",
        "Ilkay Gündoğan",
        "Joshua Kimmich",
        "Federico Valverde",
        "Sofyan Amrabat",
        "Thiago Alcântara",
        "Eduardo Camavinga",
        "Adrien Rabiot",
        "Mason Mount",
        "James Maddison",
        "Nicolo Barella",
        "Manuel Locatelli",
        "Marcel Sabitzer",
        "Ismaël Bennacer",
        "Dominik Szoboszlai",
        "Alexis Mac Allister",
        "Youri Tielemans",
        "Weston McKennie",
        "Dani Olmo",
        "Ryan Gravenberch",
        "Yunus Musah",
        "Boubacar Kamara",
        "Hakan Çalhanoğlu",
        "Wataru Endo",
        "Moisés Caicedo",
        "Ruben Neves",
        "Tanguy Ndombele",
        "Sandro Tonali",
        "Florian Wirtz",
        "Xavi Simons",
        "Matheus Nunes",
        "Giovani Lo Celso",
        "Conor Gallagher",
        "Musiala",
        "Pablo Fornals",
        "Leandro Paredes",
        "Zubimendi",
        "Lovro Majer",
        "Ivan Ilić",
        "Angelo Stiller",
        "Nicolò Fagioli",
        "Youssoufa Moukoko",
        "Erling Haaland",
        "Kylian Mbappé",
        "Lionel Messi",
        "Cristiano Ronaldo",
        "Harry Kane",
        "Victor Osimhen",
        "Lautaro Martínez",
        "Karim Benzema",
        "Robert Lewandowski",
        "Darwin Núñez",
        "João Félix",
        "Romelu Lukaku",
        "Ollie Watkins",
        "Ivan Toney",
        "Rasmus Højlund",
        "Cody Gakpo",
        "Alexander Isak",
        "Dusan Vlahović",
        "Richarlison",
        "Tammy Abraham",
        "Álvaro Morata",
        "Gabriel Jesus",
        "Marcus Rashford",
        "Bukayo Saka",
        "Jadon Sancho",
        "Jack Grealish",
        "Ansu Fati",
        "Vinícius Jr.",
        "Rodrygo",
        "Ousmane Dembélé",
        "Ferran Torres",
        "Riyad Mahrez",
        "Angel Di María",
        "Christian Pulisic",
        "Mohammed Kudus",
        "Dejan Kulusevski",
        "Nico Williams",
        "Kingsley Coman",
        "Leroy Sané",
        "Antoine Griezmann",
        "Heung-min Son",
      ];

      // ----------------- TEAM GENERATION -----------------
      //   function generateTeams(count) {
      //     teams = [];
      //     const usedColors = new Set();
      //     function getColor() {
      //       let color;
      //       do {
      //         color = `hsl(${randomInt(0, 360)}, 60%, 45%)`;
      //       } while (usedColors.has(color));
      //       usedColors.add(color);
      //       return color;
      //     }
      //     for (let i = 0; i < count; i++) {
      //       let players = [];
      //       while (players.length < 17) {
      //         let p = samplePlayers[randomInt(0, samplePlayers.length - 1)];
      //         if (!players.includes(p)) players.push(p);
      //       }
      //       teams.push({
      //         id: i,
      //         name: `Team ${i + 1}`,
      //         color: getColor(),
      //         players: players.map((name) => ({
      //           name,
      //           goals: 0,
      //           assists: 0,
      //           yellowCards: 0,
      //           redCards: 0,
      //         })),
      //         stats: {
      //           played: 0,
      //           wins: 0,
      //           draws: 0,
      //           losses: 0,
      //           goalsFor: 0,
      //           goalsAgainst: 0,
      //           points: 0,
      //         },
      //       });
      //     }
      //   }
      function generateTeams(count, customNames = []) {
        teams = [];
        const usedColors = new Set();
        function getColor() {
          let color;
          do {
            color = `hsl(${randomInt(0, 360)}, 60%, 45%)`;
          } while (usedColors.has(color));
          usedColors.add(color);
          return color;
        }
        for (let i = 0; i < count; i++) {
          let players = [];
          while (players.length < 17) {
            let p = samplePlayers[randomInt(0, samplePlayers.length - 1)];
            if (!players.includes(p)) players.push(p);
          }
          teams.push({
            id: i,
            name: customNames[i] || `Team ${i + 1}`,
            color: getColor(),
            players: players.map((name) => ({
              name,
              goals: 0,
              assists: 0,
              yellowCards: 0,
              redCards: 0,
            })),
            stats: {
              played: 0,
              wins: 0,
              draws: 0,
              losses: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              points: 0,
            },
          });
        }
      }

      function generateRandomPlayersForTeam(index) {
        if (!teams[index]) return;
        const usedNames = new Set();
        teams[index].players = [];
        while (teams[index].players.length < 17) {
          const name = samplePlayers[randomInt(0, samplePlayers.length - 1)];
          if (!usedNames.has(name)) {
            usedNames.add(name);
            teams[index].players.push({
              name,
              goals: 0,
              assists: 0,
              yellowCards: 0,
              redCards: 0,
            });
          }
        }
        renderLeagueTable(); // refresh table if you want
      }

      // ----------------- FIXTURE GENERATION -----------------
      function generateFixtures() {
        fixtures = [];
        for (let i = 0; i < teams.length; i++) {
          for (let j = 0; j < teams.length; j++) {
            if (i !== j)
              fixtures.push({
                home: teams[i],
                away: teams[j],
                homeScore: null,
                awayScore: null,
                played: false,
              });
          }
        }
        for (let i = fixtures.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [fixtures[i], fixtures[j]] = [fixtures[j], fixtures[i]];
        }
        currentMatchIndex = 0;
      }

      // ----------------- UI RENDERING -----------------
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
      function showPopup(html) {
        document.getElementById("popup").style.display = "block";
        document.getElementById("popup").innerHTML = html;
      }

      function closePopup() {
        document.getElementById("popup").style.display = "none";
      }

      function renderLeagueUI() {
        app.innerHTML = `
    <h2>League Matches & Table</h2>
    <div class="match-simulation">
      <button onclick="simulateNextMatch()">Simulate Next Match</button>
      <button onclick="simulateAllMatches()">Simulate All Remaining</button>
      <button onclick="startKnockouts()">Start Knockouts</button>
      <button onclick="showLeagueStats()">View League Stats/Awards</button>
      <button onclick="regenerateAllPlayers()">Generate Random Players for All Teams</button>
      <button onclick="restartLeague()">Restart Tournament</button>
      <button onclick="viewMatchHistory()">View Match History</button>


    </div>

    <div class="team-management">
      <h3>Team Management</h3>
      <label>Choose Team:</label>
      <select id="teamSelect">
        ${teams
          .map((t) => `<option value="${t.id}">${t.name}</option>`)
          .join("")}
      </select>

      <button onclick="generateRandomPlayersForSelectedTeam()">Generate Random Players for Selected Team</button>

      <h4>Add New Player to Selected Team</h4>
      <input type="text" id="newPlayerName" placeholder="Player Name">
      <button onclick="addPlayerToSelectedTeam()">Add Player</button>
    </div>

    <div id="currentMatch"></div>
    <div id="leagueTable"></div>
  `;

        // Add these calls to actually render the contents
        renderCurrentMatch();
        renderLeagueTable();
      }

      function regenerateAllPlayers() {
        const customNames = teams.map((t) => t.name); // keep same team names
        generateTeams(teams.length, customNames); // regenerate teams & players
        generateFixtures(); // regenerate fixtures for new teams
        currentMatchIndex = 0; // reset match index
        renderLeagueUI(); // re-render whole UI including buttons, table, matches
      }
      function restartLeague() {
        if (
          confirm(
            "Are you sure you want to restart the tournament? All data will be lost!"
          )
        ) {
          teams = [];
          fixtures = [];
          currentMatchIndex = 0;
          renderSetup(); // Go back to the setup screen
        }
      }

      // === UTILITIES ===
      function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
      }

      // Power of 2 bracket sizing
      function getKnockoutTeamCount(total) {
        if (total < 4) return 4;
        const powers = [64, 32, 16, 8, 4];
        for (let p of powers) {
          if (total >= p) return p;
        }
        return 4;
      }

      // Sort league table
      function getSortedTeams() {
        return [...teams].sort(
          (a, b) =>
            b.stats.points - a.stats.points ||
            b.stats.goalsFor -
              b.stats.goalsAgainst -
              (a.stats.goalsFor - a.stats.goalsAgainst) ||
            b.stats.goalsFor - a.stats.goalsFor
        );
      }

      // === KNOCKOUT STATE ===
      let knockoutMatches = [];
      let knockoutResults = [];
      let knockoutStage = 0;

      // === MAIN ENTRY POINT ===
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

      // === PLAY A SINGLE MATCH (manual or random) ===
      function playKnockoutMatch() {
        const m = knockoutMatches[knockoutStage];
        const homeScore =
          parseInt(document.getElementById("homeScoreInput").value) ||
          randomInt(0, 5);
        const awayScore =
          parseInt(document.getElementById("awayScoreInput").value) ||
          randomInt(0, 5);

        saveKnockoutResult(m, homeScore, awayScore);
      }

      // === SIMULATE A SINGLE MATCH (button) ===
      function simulateCurrentMatch() {
        const m = knockoutMatches[knockoutStage];
        const homeScore = randomInt(0, 15);
        const awayScore = randomInt(0, 15);

        saveKnockoutResult(m, homeScore, awayScore);
      }

      // === SIMULATE ALL MATCHES ===
      function simulateAllMatches() {
        while (
          knockoutStage < knockoutMatches.length ||
          knockoutResults.length > 1
        ) {
          if (knockoutStage < knockoutMatches.length) {
            simulateCurrentMatch();
          } else if (knockoutResults.length > 1) {
            const nextRoundTeams = knockoutResults.map((r) => r.winner);
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
      }

      // === SAVE RESULT + STATS UPDATE ===
      function saveKnockoutResult(m, homeScore, awayScore) {
        const winner = homeScore > awayScore ? m.home : m.away;

        // Increment stats
        m.home.stats.played++;
        m.away.stats.played++;
        m.home.stats.goalsFor += homeScore;
        m.home.stats.goalsAgainst += awayScore;
        m.away.stats.goalsFor += awayScore;
        m.away.stats.goalsAgainst += homeScore;

        winner.stats.wins++;

        // Save result
        knockoutResults.push({ match: m, homeScore, awayScore, winner });
        knockoutStage++;

        renderNextKnockoutMatch();
      }

      // === RENDER NEXT KNOCKOUT SCREEN ===
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
      <button onclick="simulateCurrentMatch()">Simulate This Match</button>
      <button onclick="simulateAllMatches()">Simulate All Matches</button>
      <button onclick="viewAwards()">View Awards / Stats</button>
      <button onclick="restartLeague()">Restart Tournament</button>
      <div id="knockoutBracket"></div>
    `;
        } else {
          if (knockoutResults.length === 1) {
            app.innerHTML = `
        <h2>Champion: ${knockoutResults[0].winner.name}</h2>
        <button onclick="restartLeague()">Restart Tournament</button>
        <button onclick="viewAwards()">View Awards / Stats</button>
        <div id="knockoutBracket"></div>
      `;
          } else {
            // Advance to next round
            const nextRoundTeams = knockoutResults.map((r) => r.winner);
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

      // === BRACKET DISPLAY ===
      function renderKnockoutBracket() {
        const bracketDiv = document.getElementById("knockoutBracket");
        if (!bracketDiv) return;

        let html = `<h3>Knockout Bracket / History</h3>`;
        knockoutResults.forEach((res) => {
          html += `
      <div class="bracket-match">
        <strong>${res.match.name}</strong><br>
        ${res.match.home.name} <strong>${res.homeScore}</strong> - <strong>${res.awayScore}</strong> ${res.match.away.name}<br>
        Winner: <strong style="color:green;">${res.winner.name}</strong>
      </div>
    `;
        });
        bracketDiv.innerHTML = html;
      }

      // === VIEW AWARDS / STATS ===
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

      // ----------------- Match Simulation -----------------

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

      function saveMatchResult() {
        const hVal = document.getElementById("homeScoreInput").value;
        const aVal = document.getElementById("awayScoreInput").value;
        const homeScore = hVal === "" ? randomInt(0, 15) : parseInt(hVal);
        const awayScore = aVal === "" ? randomInt(0, 15) : parseInt(aVal);
        if (isNaN(homeScore) || isNaN(awayScore))
          return alert("Invalid score!");
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

        if (homeScore < 0 || awayScore < 0)
          return alert("Scores must be non-negative!");

        updateTeamStats(m);
        distributePlayerStats(m, homeScore, awayScore);
        currentMatchIndex++;
        renderCurrentMatch();
        renderLeagueTable();
      }

      function viewMatchHistory() {
        if (matchHistory.length === 0) {
          showPopup(
            "<h2>Match History</h2><p>No matches yet.</p><button onclick='closePopup()'>Close</button>"
          );
          return;
        }

        let html = "<h2>Match History</h2>";
        matchHistory.forEach((m, i) => {
          html += `<p>${i + 1}. ${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${
            m.awayTeam
          }</p>`;
        });
        html += `
    <button onclick='clearMatchHistory()'>Clear History</button>
    <button onclick='closePopup()'>Close</button>
  `;
        showPopup(html);
      }

      function clearMatchHistory() {
        if (confirm("Clear all match history?")) {
          matchHistory = [];
          localStorage.removeItem("matchHistory");
          viewMatchHistory();
        }
      }

      function distributePlayerStats(match, homeScore, awayScore) {
        for (let i = 0; i < homeScore; i++) {
          let scorer = match.home.players[randomInt(0, 16)];
          scorer.goals++;
          let assister = match.home.players[randomInt(0, 16)];
          if (assister !== scorer) assister.assists++;
        }
        for (let i = 0; i < awayScore; i++) {
          let scorer = match.away.players[randomInt(0, 16)];
          scorer.goals++;
          let assister = match.away.players[randomInt(0, 16)];
          if (assister !== scorer) assister.assists++;
        }
        match.home.players.forEach((p) => {
          if (randomInt(1, 20) === 1) p.yellowCards++;
          if (randomInt(1, 50) === 1) p.redCards++;
        });
        match.away.players.forEach((p) => {
          if (randomInt(1, 20) === 1) p.yellowCards++;
          if (randomInt(1, 50) === 1) p.redCards++;
        });
      }

      function updateTeamStats(m) {
        const h = m.home,
          a = m.away;
        h.stats.played++;
        a.stats.played++;
        h.stats.goalsFor += m.homeScore;
        h.stats.goalsAgainst += m.awayScore;
        a.stats.goalsFor += m.awayScore;
        a.stats.goalsAgainst += m.homeScore;
        if (m.homeScore > m.awayScore) {
          h.stats.wins++;
          a.stats.losses++;
          h.stats.points += 3;
        } else if (m.homeScore < m.awayScore) {
          a.stats.wins++;
          h.stats.losses++;
          a.stats.points += 3;
        } else {
          h.stats.draws++;
          a.stats.draws++;
          h.stats.points += 1;
          a.stats.points += 1;
        }
      }

      function renderLeagueTable() {
        const c = document.getElementById("leagueTable");
        const sorted = [...teams].sort(
          (a, b) =>
            b.stats.points - a.stats.points ||
            b.stats.goalsFor -
              b.stats.goalsAgainst -
              (a.stats.goalsFor - a.stats.goalsAgainst) ||
            b.stats.goalsFor - a.stats.goalsFor
        );
        let html = `<h2>League Table</h2><table>
    <thead><tr>
      <th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th>
      <th>GF</th><th>GA</th><th>GD</th><th>Points</th>
    </tr></thead><tbody>`;
        sorted.forEach((t, i) => {
          const gd = t.stats.goalsFor - t.stats.goalsAgainst;
          html += `<tr class="team-row" style="background-color:${
            t.color
          }; color:white;" onclick="showTeamStats(${t.id})">
      <td>${i + 1}</td><td>${t.name}</td>
      <td>${t.stats.played}</td><td>${t.stats.wins}</td><td>${
            t.stats.draws
          }</td><td>${t.stats.losses}</td>
      <td>${t.stats.goalsFor}</td><td>${
            t.stats.goalsAgainst
          }</td><td>${gd}</td><td>${t.stats.points}</td>
    </tr>`;
        });
        html += `</tbody></table>`;
        c.innerHTML = html;
      }
      function generateRandomPlayersForSelectedTeam() {
        const teamId = parseInt(document.getElementById("teamSelect").value);
        const team = teams.find((t) => t.id === teamId);
        if (!team) return alert("Team not found!");

        team.players = [];
        while (team.players.length < 17) {
          let p = samplePlayers[randomInt(0, samplePlayers.length - 1)];
          if (!team.players.some((x) => x.name === p)) {
            team.players.push({
              name: p,
              goals: 0,
              assists: 0,
              yellowCards: 0,
              redCards: 0,
            });
          }
        }
        alert(`Generated 17 random players for ${team.name}!`);
      }

      function addPlayerToSelectedTeam() {
        const teamId = parseInt(document.getElementById("teamSelect").value);
        const team = teams.find((t) => t.id === teamId);
        if (!team) return alert("Team not found!");

        const name = document.getElementById("newPlayerName").value.trim();
        if (!name) return alert("Enter player name!");

        team.players.push({
          name,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
        });

        document.getElementById("newPlayerName").value = "";
        alert(`Added ${name} to ${team.name}!`);
      }

      function simulateNextMatch() {
        if (currentMatchIndex >= fixtures.length) return;
        const match = fixtures[currentMatchIndex];
        match.homeScore = randomInt(0, 15);
        match.awayScore = randomInt(0, 15);
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
      }

      function simulateAllMatches() {
        while (currentMatchIndex < fixtures.length) simulateNextMatch();
      }

      // ----------------- Popup & Stats -----------------

      function showTeamStats(id) {
        const t = teams.find((x) => x.id === id);
        if (!t) return;

        let html = `<h2>${t.name} Team Stats</h2>`;
        html += `<p style="text-align:center; margin-bottom:15px;">
    <strong>Played:</strong> ${t.stats.played} &nbsp; 
    <strong>Wins:</strong> ${t.stats.wins} &nbsp;
    <strong>Draws:</strong> ${t.stats.draws} &nbsp;
    <strong>Losses:</strong> ${t.stats.losses}<br>
    <strong>GF:</strong> ${t.stats.goalsFor} &nbsp; 
    <strong>GA:</strong> ${t.stats.goalsAgainst} &nbsp;
    <strong>Points:</strong> ${t.stats.points}
  </p>`;

        html += `<h3>Players & Stats</h3><div class="player-list">`;
        t.players.forEach((p) => {
          const randomColor = `hsl(${randomInt(0, 360)}, 80%, 40%)`;
          html += `<div>
      <span style="color:${randomColor}; font-weight:bold;">${p.name}</span>
      <span>Goals: ${p.goals}, Assists: ${p.assists}, YC: ${p.yellowCards}, RC: ${p.redCards}</span>

      <button onclick="generateRandomPlayersForTeam(${t.id}); closePopup();">Generate Random Players for This Team</button>

    </div>`;
        });
        html += `</div><button onclick="closePopup()">Close</button>`;
        showPopup(html);
      }

      function showLeagueStats() {
        if (fixtures.every((f) => !f.played)) {
          showPopup(
            "<h2>League Awards</h2><p style='text-align:center;'>No matches have been played yet!</p><button onclick='closePopup()'>Close</button>"
          );
          return;
        }

        let players = teams.flatMap((t) => t.players);

        let awards = `<h2>🏆 League Awards</h2>`;
        awards += `
    <div class="tab-buttons">
      <button class="active" onclick="showStatsTab('scorers')">Top Scorers</button>
      <button onclick="showStatsTab('assisters')">Top Assisters</button>
      <button onclick="showStatsTab('yellow')">Most Yellow Cards</button>
      <button onclick="showStatsTab('red')">Most Red Cards</button>
    </div>
    <div class="tab-content" id="statsTabContent"></div>
    <button onclick="closePopup()">Close</button>
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

        switch (tab) {
          case "scorers":
            sorted = players.sort((a, b) => b.goals - a.goals);
            title = "Top 20 Scorers";
            break;
          case "assisters":
            sorted = players.sort((a, b) => b.assists - a.assists);
            title = "Top 20 Assisters";
            break;
          case "yellow":
            sorted = players.sort((a, b) => b.yellowCards - a.yellowCards);
            title = "Top 20 Yellow Cards";
            break;
          case "red":
            sorted = players.sort((a, b) => b.redCards - a.redCards);
            title = "Top 20 Red Cards";
            break;
        }

        let html = `<h3>${title}</h3>`;
        html += `<table class="player-stats-table">
    <tr><th>#</th><th>Name</th><th>Stat</th></tr>`;
        sorted.slice(0, 20).forEach((p, i) => {
          const color = `hsl(${randomInt(0, 360)}, 80%, 40%)`;
          let statVal =
            tab === "scorers"
              ? p.goals
              : tab === "assisters"
              ? p.assists
              : tab === "yellow"
              ? p.yellowCards
              : p.redCards;
          html += `<tr>
      <td>${i + 1}</td>
      <td style="color:${color}; font-weight:bold;">${p.name}</td>
      <td>${statVal}</td>
    </tr>`;
        });
        html += `</table>`;

        document.getElementById("statsTabContent").innerHTML = html;

        // Highlight active button
        document
          .querySelectorAll(".tab-buttons button")
          .forEach((btn) => btn.classList.remove("active"));
        document
          .querySelector(`.tab-buttons button[onclick*="${tab}"]`)
          .classList.add("active");
      }

      function showPopup(content) {
        closePopup();
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

      // Removed duplicate declaration of storedHistory to prevent redeclaration error

      // ----------------- INITIAL RENDER -----------------
      renderSetup();
  