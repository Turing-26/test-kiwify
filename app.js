const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/submit", (req, res) => {});

app.post("/api/quiz", db.createQuiz);

app.post("/api/submit", db.giveQuiz);

app.get("/api/users/:id", db.getUserById);

app.get("/", db.getUsers);

// app.post();

app.listen(5000, () => {
  console.log("listening on port 5000");
});
