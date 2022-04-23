const fastifyPlugin = require('fastify-plugin');
const { Client } = require('pg');

const dbConnector = async (fastify, options) => {
  try {
    const client = await (new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })).connect();
    console.log("Database is connected!");
  } catch (error) {
    console.error('connection error', error.stack);
  }
}

module.exports = fastifyPlugin(dbConnector);