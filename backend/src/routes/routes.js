const userController = require('../controllers/userController');
const { runMigrations } = require('../config/migrations');
module.exports = [
  // USER ROUTES
  {
    method: 'POST',
    url: '/create-user',
    handler: userController.createUser
  },


  {
    method: 'GET',
    url: '/migration',
    handler: runMigrations
  }
]