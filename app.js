const express = require("express");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const dbQuery = `SELECT * FROM cricket_team ORDER BY player_id`;
  const dbArray = await db.all(dbQuery);
  const newArr = dbArray.map((each) => {
    return {
      playerId: each.player_id,
      playerName: each.player_name,
      jerseyNumber: each.jersey_number,
      role: each.role,
    };
  });
  response.send(newArr);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const dbQuery = `INSERT INTO cricket_team(player_name,jersey_number,role) VALUES('${player_name}',${jersey_number},'${role}');`;
  const dbResponse = await db.run(dbQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const dbQuery = `SELECT * FROM cricket_team WHERE player_id= ${playerId};`;
  const player = await db.get(dbQuery);
  const newPlayer = () => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role,
    };
  };
  response.send(newPlayer());
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const dbQuery = `UPDATE cricket_team SET player_name='${player_name}',jersey_number=${jersey_number},role='${role}' where player_id=${playerId};`;
  const dbResponse = await db.run(dbQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const dbQuery = `DELETE FROM cricket_team where player_id=${playerId};`;
  const dbResponse = await db.run(dbQuery);
  response.send("Player Removed");
});

module.exports = app;
