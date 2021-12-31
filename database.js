const Sequelize = require('sequelize')

const connection = new Sequelize('gamestore', 'root', '0101', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
  timezone: '-03:00'
})

module.exports = connection
