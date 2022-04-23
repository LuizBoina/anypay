require('dotenv').config();
const fastify = require('fastify');
const fastifyAuth = require('fastify-auth');
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 3030;
const db = require("./config/db");
const User = require('./models/User');
const routes = require("./routes/routes");
const app = fastify({
  logger: true
});

app.register(require('fastify-cors'), {
  origin: (origin, cb) => {
    if (/localhost/.test(origin) || !origin) {
      cb(null, true)
      return
    }
    cb(new Error("Not allowed"), false)
  },
  methods: ['GET', 'PUT', 'POST', 'DELETE']
});

app.register(db);

app.decorate('verifyJWT', async (request, reply) => {
  try {
    if (!request.headers.authorization) {
      throw new Error('No token was sent');
    }
    const token = request.headers.authorization.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    // const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('Authentication failed!');
    }
    if (user.role !== decoded.role) {
      throw new Error('Authentication failed!');
    }

  } catch (error) {
    reply.code(401).send(error);
  }
})
  .register(fastifyAuth)
  .after(() => {
    const fastifyRoutes = async (fastify, opts) => {
      routes.forEach((route, index) => {
        if (route.protected) {
          const { protected, ..._route } = route;
          fastify.route({
            ..._route,
            preHandler: fastify.auth([fastify.verifyJWT]),
          });
        }
        else {
          fastify.route(route);
        }
      });
      fastify.get("/", async () => {
        return {
          Message: "Fastify is On Fire"
        }
      });
    }
    app.register(fastifyRoutes, { prefix: '/api/v1' })
  });


const start = async () => {
  try {
    await app.listen(PORT, '0.0.0.0')
    app.log.info(`server listening on ${app.server.address().port}`)

  } catch (err) {
    app.log.error(err)
    process.exit(1)

  }
}
start();