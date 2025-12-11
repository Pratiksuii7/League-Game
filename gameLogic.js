// Global Game State
let teams = [];
let fixtures = [];
let currentMatchIndex = 0;
let matchHistory = [];
let knockoutMatches = [];
let knockoutResults = [];
let knockoutHistory = [];
let knockoutStage = 0;

const maxTeams = 64;

// Load history
const storedHistory = localStorage.getItem("matchHistory");
if (storedHistory) matchHistory = JSON.parse(storedHistory);

// --- UTILS ---
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// --- TEAM GENERATION ---
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

  // Create a pool of players to distribute
  // We want to ensure we have enough players. If count * 17 > playerDatabase.length, we might need to reuse or generate randoms.
  // Let's just pick random players from the DB for each team, ensuring uniqueness within the team, but maybe not across the league if the league is huge.
  // Or better: Shuffle the database and distribute.
  
  let availablePlayers = [...playerDatabase];
  shuffleArray(availablePlayers);
  
  for (let i = 0; i < count; i++) {
    let teamPlayers = [];
    
    // Try to get unique players from the DB first
    for(let j=0; j<17; j++) {
        if(availablePlayers.length > 0) {
            const pData = availablePlayers.pop();
            teamPlayers.push(createPlayerObject(pData.name, pData.rating));
        } else {
            // Run out of unique DB players, generate random ones
            const randomName = `Player ${randomInt(1, 1000)}`;
            teamPlayers.push(createPlayerObject(randomName, getPlayerRating(randomName)));
        }
    }

    teams.push({
      id: i,
      name: customNames[i] || `Team ${i + 1}`,
      color: getColor(),
      players: teamPlayers,
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
  teams[index].players = [];
  
  // Refill with random players from DB
  for(let i=0; i<17; i++) {
      const pData = getRandomPlayerFromDB();
      // Ensure uniqueness in this team
      if(teams[index].players.some(p => p.name === pData.name)) {
          i--; // try again
          continue;
      }
      teams[index].players.push(createPlayerObject(pData.name, pData.rating));
  }
}

// --- FIXTURES ---
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
  shuffleArray(fixtures);
  currentMatchIndex = 0;
}

// --- MATCH LOGIC ---
function calculateMatchScore(home, away) {
  const getTeamRating = (team) => {
    if (!team.players || team.players.length === 0) return 70;
    return (
      team.players.reduce((sum, p) => sum + (p.rating || 70), 0) /
      team.players.length
    );
  };

  const homeRating = getTeamRating(home);
  const awayRating = getTeamRating(away);

  // Base randomness
  let homeScore = randomInt(0, 4);
  let awayScore = randomInt(0, 4);

  // Rating influence
  const diff = homeRating - awayRating;
  
  if (diff > 0) {
    // Home is stronger
    if (randomInt(0, 100) < diff) homeScore += randomInt(1, 3);
  } else {
    // Away is stronger
    if (randomInt(0, 100) < Math.abs(diff)) awayScore += randomInt(1, 3);
  }

  // Home advantage
  if (randomInt(0, 4) === 0) homeScore++;

  return { homeScore, awayScore };
}

function getWeightedRandomPlayer(players) {
  if (!players || players.length === 0) return null;
  // Weight = rating^5 to strongly favor better players
  const weights = players.map((p) => Math.pow(p.rating || 70, 5));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;

  for (let i = 0; i < players.length; i++) {
    r -= weights[i];
    if (r <= 0) return players[i];
  }
  return players[players.length - 1];
}

function distributePlayerStats(match, homeScore, awayScore) {
  // Goals & Assists
  for (let i = 0; i < homeScore; i++) {
    let scorer = getWeightedRandomPlayer(match.home.players);
    if (scorer) scorer.goals++;
    let assister = getWeightedRandomPlayer(match.home.players);
    if (assister && assister !== scorer) assister.assists++;
  }
  for (let i = 0; i < awayScore; i++) {
    let scorer = getWeightedRandomPlayer(match.away.players);
    if (scorer) scorer.goals++;
    let assister = getWeightedRandomPlayer(match.away.players);
    if (assister && assister !== scorer) assister.assists++;
  }

  // Cards, Penalties, Freekicks, Passing
  [match.home.players, match.away.players].forEach(teamPlayers => {
      teamPlayers.forEach(p => {
          // Cards
          if (randomInt(1, 20) === 1) p.yellowCards++;
          if (randomInt(1, 50) === 1) p.redCards++;

          // Penalties (rare event)
          if (randomInt(1, 100) === 1) {
              // Higher rating = better chance to score
              if(randomInt(0, 100) < p.rating) p.penalties++;
          }

          // Freekicks (Very rare event, strict)
          // Only players with high freekick rating should score often
          if (randomInt(1, 300) === 1) { // Increased rarity from 150 to 300
              const fkRating = p.freekickRating || (p.rating - 10);
              // Threshold: Random 0-100 must be less than (fkRating - 30). 
              // So if fkRating is 90, need < 60 (60% chance if event occurs).
              // If fkRating is 50, need < 20 (20% chance).
              if(randomInt(0, 100) < (fkRating - 30)) p.freekicks++;
          }

          // Passing Stats (simulated per match)
          // Base attempts: 20-60 per match depending on rating
          const attempts = randomInt(20, 60);
          p.passesAttempted += attempts;
          
          // Completion rate depends on passingRating
          const passRating = p.passingRating || p.rating;
          // Rating 60 -> 70%, Rating 99 -> 95%
          const accuracy = 70 + ((passRating - 60) / (99 - 60)) * 25;
          const completed = Math.round(attempts * (accuracy / 100));
          p.passesCompleted += completed;
      });
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

// --- KNOCKOUT LOGIC ---
function getKnockoutTeamCount(total) {
    if (total < 4) return 4;
    const powers = [64, 32, 16, 8, 4];
    for (let p of powers) {
      if (total >= p) return p;
    }
    return 4;
}

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

    // Distribute player stats (goals, assists, cards)
    distributePlayerStats(m, homeScore, awayScore);

    // Save result
    knockoutResults.push({ match: m, homeScore, awayScore, winner });
    knockoutStage++;
}
