const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { getCurrencyByCode } = require('./currencyController');

// check if exist at least one user with the same
// email, phonumber and document
const doesUserExist = async (user, dbClient) => {
  try {
    const text = `
      SELECT COUNT(id) FROM users
        WHERE email = $1 OR phonenumber = $2
          OR document = $3
      LIMIT 1;
    `;
    const values = [user.email, user.phonenumber, user.document];
    const { rows } = await dbClient.query({ text, values });
    return rows[0].count != '0';
  } catch (error) {
    console.log("error: ", error.stack)
    throw Error("Server Error");
  }
}

// search user by id
exports.getUserById = async (id, client) => {
  try {
    const text = `
      SELECT * FROM users
        WHERE id = $1
      LIMIT 1;
    `;
    const values = [id];
    const result = await client.query({ text, values });
    console.log(result)
  } catch (error) {
    console.log("error: ", error)
  }
}

exports.createUser = async (req, res) => {
  try {
    // get body and client db instance
    const { body, dbClient } = req;
    const isExistentUser = await doesUserExist(body, dbClient);
    if (!isExistentUser) {
      // if user don't exist, create a uuid, hash the password and same the user on db
      const id = uuidv4();
      const password = await bcrypt.hash(body.password, 9);
      const currencyId = await getCurrencyByCode(body.principalCurrency, dbClient);
      const text = `
        INSERT INTO users (id, username, password, email, birthday, document, phonenumber, "principalCurrency")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `;
      const values = [id, body.username, password, body.email,
        body.birthday, body.document, body.phonenumber, currencyId];
      await dbClient.query({ text, values });
      // response with jwt token, userId and username
      const token = jwt.sign(
        {
          userId: id,
        },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );
      return res
        .code(200)
        .send({
          userId: id,
          username: body.username,
          token: token
        });
    }
    else {
      return res
        .code(409)
        .send({
          message: "User Already Exist"
        })
    }
  } catch (error) {
    console.log(error)
    return res
      .code(500)
      .send({
        message: error
      });
  }
}