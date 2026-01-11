import { useState } from "react";
import "./MatchSimulator.css";

const MAX_PLAYERS = 12;

type Player = {
  name: string;
  originalTeam: "Red" | "Blue";
  finalTeam: "Red" | "Blue";
  stats: {
    kills: number;
    flags: number;
    level: number;
    minutes: number;
    seconds: number;
    xp: number;
  };
  switched: boolean;
  dynamic: {
    kills: number;
    flags: number;
    minutes: number;
    seconds: number;
  };
  rating: number;
};

type Results = Record<string, Player & { ratingDelta: string }>;

export default function MatchSimulator() {
  //const [gameNumber, setGameNumber] = useState("");
  const [redSize, setRedSize] = useState(0);
  const [blueSize, setBlueSize] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [results, setResults] = useState<Results | null>(null);
  const [matchResult, setMatchResult] = useState("");

  const generatePlayers = () => {
    const total = redSize + blueSize;

 //   if (!gameNumber) return alert("Enter game number");
    if (total < 1 || total > MAX_PLAYERS)
      return alert("Players must be between 1 and 12");

    const list: Player[] = [];

    for (let i = 1; i <= redSize; i++) {
      list.push(createPlayer(`Red Player ${i}`, "Red"));
    }
    for (let i = 1; i <= blueSize; i++) {
      list.push(createPlayer(`Blue Player ${i}`, "Blue"));
    }

    setPlayers(list);
    setResults(null);
    setMatchResult("");
  };

  const updatePlayer = (index: number, updated: Player) => {
    setPlayers(p =>
      p.map((pl, i) => (i === index ? updated : pl))
    );
    setResults(null);
  };

  return (
    <div className="sim-container">
      <h1>🏆 Match Rating Simulator</h1>
      <h2>UNDER DEVELOPMENT</h2>

      <div className="setup">
        <input
          type="number"
          placeholder="Red Team"
          onChange={e => setRedSize(+e.target.value)}
        />
        <input
          type="number"
          placeholder="Blue Team"
          onChange={e => setBlueSize(+e.target.value)}
        />
        <button onClick={generatePlayers}>Generate Players</button>
      </div>

      {players.map((p, i) => (
        <PlayerCard
          key={i}
          player={p}
          onChange={updated => updatePlayer(i, updated)}
        />
      ))}

      {players.length > 0 && (
        <button
          className="calc-btn"
          onClick={() => calculate(players, setResults, setMatchResult)}
        >
          Calculate Ratings
        </button>
      )}

      {results && <ResultsTable results={results} />}
      {matchResult && <div className="match-result">{matchResult}</div>}
    </div>
  );
}

/* ---------------- HELPERS ---------------- */

function createPlayer(name: string, team: "Red" | "Blue"): Player {
  return {
    name,
    originalTeam: team,
    finalTeam: team,
    stats: {
      kills: 0,
      flags: 0,
      level: 0,
      minutes: 8,
      seconds: 0,
      xp: 0,
    },
    switched: false,
    dynamic: { kills: 0, flags: 0, minutes: 0, seconds: 0 },
    rating: 1000,
  };
}

function PlayerCard({
    player,
    onChange,
  }: {
    player: Player;
    onChange: (p: Player) => void;
  }) {
    const updateStat = (key: keyof Player["stats"], value: number) => {
      onChange({
        ...player,
        stats: { ...player.stats, [key]: value },
      });
    };
  
    const updateName = (value: string) => {
      onChange({ ...player, name: value });
    };
  
    const toggleSwitch = () => {
      const switched = !player.switched;
      onChange({
        ...player,
        switched,
        finalTeam: switched
          ? player.originalTeam === "Red"
            ? "Blue"
            : "Red"
          : player.originalTeam,
      });
    };
  
    return (
      <div className={`player-card ${player.originalTeam.toLowerCase()}`}>
        {/* Editable Player Name */}
        <input
          type="text"
          name="playerName"
          placeholder="Player Name"
          value={player.name}
          onChange={e => updateName(e.target.value)}
          style={{ fontWeight: "bold", marginBottom: 8 }}
        />
  
        {/* Main Stats */}
        {(
          ["kills", "flags", "level", "minutes", "seconds", "xp"] as const
        ).map(key => {
          const placeholder =
            key === "minutes" ? "min" : key === "seconds" ? "00" : key;
  
          const value =
            key === "seconds" ? player.stats.seconds || 0 : player.stats[key] || "";
  
          return (
            <input
              key={key}
              type="text"
              inputMode="numeric"
              name={key}
              placeholder={placeholder}
              value={value}
              onChange={e => {
                const num = Number(e.target.value);
                if (!isNaN(num) && num >= 0) updateStat(key, num);
              }}
            />
          );
        })}
  
        {/* Switch Button */}
        <button onClick={toggleSwitch}>
          {player.switched ? "Remove Switch" : "Add Switch"}
        </button>
  
        {/* Dynamic Switch Stats */}
        {player.switched && (
          <div className="dynamic">
            <input
              type="text"
              inputMode="numeric"
              name="kills"
              placeholder="kills"
              value={player.dynamic.kills || ""}
              onChange={e =>
                onChange({
                  ...player,
                  dynamic: { ...player.dynamic, kills: +e.target.value },
                })
              }
            />
            <input
              type="text"
              inputMode="numeric"
              name="flags"
              placeholder="flags"
              value={player.dynamic.flags || ""}
              onChange={e =>
                onChange({
                  ...player,
                  dynamic: { ...player.dynamic, flags: +e.target.value },
                })
              }
            />
            <input
              type="text"
              inputMode="numeric"
              name="minutes"
              placeholder="min"
              value={player.dynamic.minutes || ""}
              onChange={e =>
                onChange({
                  ...player,
                  dynamic: { ...player.dynamic, minutes: +e.target.value },
                })
              }
            />
            <input
              type="text"
              inputMode="numeric"
              name="seconds"
              placeholder="00"
              value={player.dynamic.seconds || "00"}
              onChange={e => {
                const num = Number(e.target.value);
                if (!isNaN(num) && num >= 0)
                  onChange({
                    ...player,
                    dynamic: { ...player.dynamic, seconds: num },
                  });
              }}
            />
          </div>
        )}
      </div>
    );
  }
  
  

/* ---------------- CALCULATION ---------------- */

function calculateSkill(
  player: Player,
  outcome: "win" | "lose" | "draw",
  switched: boolean
): number {
  const maxLevel = 239;
  const level = Math.min(player.stats.level, maxLevel);

  const time =
    player.stats.minutes + player.stats.seconds / 60;

  if (time <= 0) return -5;

  let score =
    (0.7 * player.stats.flags +
      0.3 * player.stats.kills +
      (0.2 * player.stats.xp) / 10000) *
    Math.min(8 / time, 2);

  let bonus = 0;
  if (outcome === "win") bonus = switched ? 0.9 : 0.7;
  if (outcome === "lose") bonus = switched ? -0.2 : -0.5;

  let delta = score + bonus;
  delta -= (level / maxLevel) * 0.5;

  return Math.max(Math.min(delta, 15), -15);
}

function calculate(
  players: Player[],
  setResults: (r: Results) => void,
  setMatchResult: (t: string) => void
) {
  const teamStats = {
    Red: { kills: 0, flags: 0 },
    Blue: { kills: 0, flags: 0 },
  };

  players.forEach(p => {
    teamStats[p.finalTeam].kills += p.stats.kills;
    teamStats[p.finalTeam].flags += p.stats.flags;
  });

  let winner: "Red" | "Blue" | "Draw" = "Draw";

  if (teamStats.Red.flags !== teamStats.Blue.flags)
    winner = teamStats.Red.flags > teamStats.Blue.flags ? "Red" : "Blue";
  else if (teamStats.Red.kills !== teamStats.Blue.kills)
    winner = teamStats.Red.kills > teamStats.Blue.kills ? "Red" : "Blue";

  const result: Results = {};

  players.forEach(p => {
    const outcome =
      winner === "Draw" ? "draw" : p.finalTeam === winner ? "win" : "lose";

    result[p.name] = {
      ...p,
      ratingDelta: calculateSkill(p, outcome, p.switched).toFixed(2),
    };
  });

  setResults(result);
  setMatchResult(winner === "Draw" ? "It's a Draw!" : `${winner} Team Wins!`);
}

function ResultsTable({ results }: { results: Results }) {
  return (
    <div className="results-table">
      <h2>Rating Changes</h2>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Team</th>
            <th>Δ Rating</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(results).map(([name, p]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{p.finalTeam}</td>
              <td>{p.ratingDelta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
