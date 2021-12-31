const Sequelize = require('sequelize')
const connection = require('./database')

const Game = connection.define('games', {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  year: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  price: {
    type: Sequelize.FLOAT,
    allowNull: false
  }
})

//Game.sync({ force: true })

module.exports = Game
