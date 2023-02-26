const Pool = require("pg").Pool;

const pool = new Pool({
  user: "turing",
  host: "localhost",
  database: "api",
  password: "gotham",
  port: 5432,
});

const getUsers = async (req, res) => {
  try {
    const users = await pool.query("select * from users");
    res.status(200).json(users.rows);
  } catch (error) {
    console.log(error);
  }
};

const getUserById = async (request, response) => {
  const id = request.params.id;

  try {
    const user = await pool.query(`select * from users where u_id = '${id}'`);
    if (!user[0]) throw new Error("User not found");
    response.status(200).json(user.rows);
  } catch (error) {
    console.log(error);
  }
};

const createQuiz = async (request, response) => {
  try {
    const title = request.body.title;
    const description = request.body.description;
    const questions = request.body.questions;

    const quiz = await pool.query(
      `insert into quiz (u_id, title, description) values ('IUj7sDzCW7', '${title}', '${description}') returning q_id;`
    );
    const quizId = quiz.rows[0].q_id;

    questions.forEach(async (mcq) => {
      const { question, options, answer } = mcq;
      const optionValues = options.map((option) => `"${option}"`).join(", ");
      const insertMcqQuery = `INSERT INTO questions (question, options, answer, q_id) VALUES ($1, '{${optionValues}}', $2, $3)`;
      await pool.query(insertMcqQuery, [question, answer, quizId]);
    });

    response.status(200).send({ q_id: quizId, success: true });
  } catch (error) {
    console.log(error);
  }
};

const giveQuiz = async (req, res) => {
  const data = req.body;
  const results = new Map();
  const dbQuery = await pool.query(
    `select * from questions where q_id = '${data.q_id}'`
  );
  console.log(
    "--------------------------------------------------------------------------"
  );
  if (!dbQuery.rows.length) throw new Error("Quiz not found");
  dbQuery.rows.forEach((question) => {
    results.set(question.question_id, question.answer);
  });
  if (data.answers.length !== results.size)
    throw new Error("Insufficient Answers");

  console.log(
    "--------------------------------------------------------------------------"
  );
  let score = 0;
  for (let i = 0; i < data.answers.length; i++) {
    let res = results.get(data.answers[i].id);
    if (res === data.answers[i].answer) score++;
  }
  res.send({
    success: true,
    errors: null,
    data: {
      "User score": score,
    },
  });
};

module.exports = {
  getUsers,
  getUserById,
  createQuiz,
  giveQuiz,
};
