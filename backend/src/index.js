require('dotenv').config();
const fastify = require('fastify');
const fastifyAuth = require('fastify-auth');
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 3030;
const db = require("./config/db");
const { getUserById } = require('./controllers/userController');
const routes = require("./routes/routes");
const app = fastify({
  logger: true
});

// handle CORS
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

// add db connection
app.register(db);

// authentication middleware
app.decorate('verifyJWT', async (request, reply) => {
  try {
    // check if token was sent
    if (!request.headers.authorization) {
      throw new Error('No token was sent');
    }
    const token = request.headers.authorization.replace('Bearer ', '');
    // decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // search for the user using the id in the token
    const { rows } = await getUserById(decoded.userId, client);
    const user = rows[0];
    if (!user) {
      throw new Error('Authentication failed!');
    }
    // if everything is ok, so add user to requisition
    // to facilitated the proccess
    req.user = user;
  } catch (error) {
    reply.code(401).send(error);
  }
})
  // add plugin to allow authentication middleware
  .register(fastifyAuth)
  .after(() => {
    const fastifyRoutes = async (fastify, opts) => {
      // add db client to request
      app.addHook('preHandler', async (req, reply) => {
        req.dbClient = fastify.db.client;
      });

      routes.forEach((route, index) => {
        // if the route is protect, eg. user need to be authenticated to access,
        // so add the middleware to check the jwt token that was sent
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
      // a route to test
      fastify.get("/", async () => {
        return {
          Message: "Fastify is On Fire"
        }
      });
    }
    // add prefix to routes
    app.register(fastifyRoutes, { prefix: '/api/v1' })
  });


// start the server
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