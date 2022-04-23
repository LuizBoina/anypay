const fastifyPlugin = require('fastify-plugin');
const { Client } = require('pg');

const dbConnector = async (fastify, options) => {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
    await client.connect();
    console.log("Database is connected!");
    fastify.decorate('db', { client })
  } catch (error) {
    console.error('connection error', error.stack);
  }
}

module.exports = fastifyPlugin(dbConnector);