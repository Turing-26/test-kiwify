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

module.exports = {
  getUsers,
  getUserById,
};
