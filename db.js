const Pool = require("pg").Pool;

const pool = new Pool({
  user: "turing",
  host: "localhost",
  database: "api",
  password: "gotham",
  port: 5432,
});

const createQuiz = async (request, response) => {
  try {
    const title = request.body.title;
    const description = request.body.description;
    const questions = request.body.questions;

    // Here I used a dummy user_id because in the running application, the user id would be retrieved from the JWT token and not sent with the request, and since i did not work on the sign up logic for the test, i have just used a dummy user, also made in the sequel file for demonstration
    // replace user ID with a user ID in your own instance
    const quiz = await pool.query(
      `insert into quiz (u_id, title, description) values ('IUj7sDzCW7', '${title}', '${description}') returning q_id;`
    );
    const quizId = quiz.rows[0].q_id;

    questions.forEach(async (mcq) => {
      const { question, options, answer } = mcq;
      const optionValues = options.map((option) => `"${option}"`).join(", ");
      const insertMcqQuery = `insert into questions (question, options, answer, q_id) values ($1, '{${optionValues}}', $2, $3)`;
      await pool.query(insertMcqQuery, [question, answer, quizId]);
    });

    response.status(200).send({ success: true, error: null, data: null });
  } catch (error) {
    response.status(404).send({
      success: false,
      errors: { code: error?.code, error: error },
      data: null,
    });
  }
};

const editQuiz = async (request, response) => {
  try {
    const id = request.body?.id;
    const title = request.body.title;
    const description = request.body.description;
    const questions = request.body.questions;

    //Here once again, i assume a userId after jwt authentication

    if (!id) {
      const quiz = await pool.query(
        `insert into drafts (u_id, title, description) values ('IUj7sDzCW7', '${title}', '${description}') returning q_id;`
      );
      const quizId = quiz.rows[0].q_id;

      questions.forEach(async (mcq) => {
        const { question, options, answer } = mcq;
        const optionValues = options.map((option) => `"${option}"`).join(", ");
        const insertMcqQuery = `insert into draft_questions (question, options, answer, q_id) values ($1, '{${optionValues}}', $2, $3);`;
        await pool.query(insertMcqQuery, [question, answer, quizId]);
      });
      response.status(200).send({ success: true, errors: null, data: null });
      return;
    }

    await pool.query(
      `update drafts set title = '${title}', description = '${description}' where q_id = '${id}';`
    );
    await pool.query(`delete from draft_questions where q_id = '${id}';`);
    questions.forEach(async (mcq) => {
      const { question, options, answer } = mcq;
      const optionValues = options.map((option) => `"${option}"`).join(", ");
      const insertMcqQuery = `insert into draft_questions (question, options, answer, q_id) values ($1, '{${optionValues}}', $2, $3);`;
      await pool.query(insertMcqQuery, [question, answer, id]);
    });

    response.status(200).send({ success: true, error: null, data: null });
  } catch (error) {
    response.status(404).send({
      success: false,
      errors: { code: error?.code, error: error },
      data: null,
    });
  }
};

const giveQuiz = async (request, response) => {
  try {
    const data = request.body;
    const results = new Map();
    const dbQuery = await pool.query(
      `select * from questions where q_id = '${data.q_id}'`
    );

    if (!dbQuery.rows.length) throw new Error("Quiz not found");
    dbQuery.rows.forEach((question) => {
      results.set(question.question_id, question.answer);
    });

    if (data.answers.length !== results.size)
      throw new Error("Insufficient Answers");

    let score = 0;
    for (let i = 0; i < data.answers.length; i++) {
      let res = results.get(data.answers[i].id);
      if (res === data.answers[i].answer) score++;
    }

    response.send({
      success: true,
      errors: null,
      data: {
        userScore: score,
      },
    });
  } catch (error) {
    response.send({ success: false, error: error, data: null });
  }
};

module.exports = {
  createQuiz,
  giveQuiz,
  editQuiz,
};
