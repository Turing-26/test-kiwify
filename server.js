const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/quiz", db.createQuiz);

app.put("/api/quiz", db.editQuiz);

app.post("/api/submit", db.giveQuiz);

app.listen(5000, () => {
  console.log("listening on port 5000");
});
