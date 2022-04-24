const userController = require('../controllers/userController');
const { runMigrations } = require('../config/migrations');
module.exports = [
  // USER ROUTES
  {
    method: 'POST',
    url: '/create-user',
    handler: userController.createUser
  },

  // route to run de migrations
  {
    method: 'GET',
    url: '/migration',
    handler: runMigrations
  }
]