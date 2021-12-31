const express = require('express')
const app = express()
const cors = require('cors')
const connection = require('./database')
const Game = require('./Game')
const User = require('./User')
const jwt = require('jsonwebtoken')

const secret = 'hdhsisdhfisadhfidhfcndvoad'

app.use(cors())

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

connection.sync()

function auth(req, res, next) {
  var authToken = req.headers['authorization']
  if (authToken !== undefined) {
    const bearer = authToken.split(' ')
    const token = bearer[1]
    jwt.verify(token, secret, (err, data) => {
      if (err) {
        res.status(401)
        res.json({ err: 'Token inválido' })
      } else {
        req.token = token
        req.loggedUser = { id: data.id, email: data.email }
        next()
      }
    })
  } else {
    res.status(401)
    res.json({ err: 'Token inválido' })
  }
}

/* CADASTRO DE GAMES */

app.get('/games', auth, (req, res) => {
  res.status(200)
  Game.findAll()
    .then(element => res.json(element))
    .catch(err => console.log(err))
})

app.get('/game/:id', (req, res) => {
  if (isNaN(req.params.id)) {
    res.sendStatus(400)
    res.send('Isto não é um número')
  } else {
    var id = parseInt(req.params.id)

    Game.findByPk(id)
      .then(element => {
        res.status(200)
        res.json(element)
      })
      .catch(erro => {
        console.log(erro)
      })
  }
})

app.post('/game', (req, res) => {
  var { title, year, price } = req.body

  if (title === undefined) {
    res.sendStatus(400)
    console.log('Digite um título válido')
  } else {
    if (isNaN(year)) {
      res.sendStatus(400)
      console.log('Digite um ano válido')
    } else {
      if (isNaN(price)) {
        res.sendStatus(400)
        console.log('Digite um preço válido')
      } else {
        Game.create({
          title: title,
          year: parseInt(year),
          price: parseFloat(price)
        })
        res.sendStatus(200)
      }
    }
  }
})

app.delete('/game/:id', (req, res) => {
  if (isNaN(req.params.id)) {
    res.sendStatus(400)
    res.send('Isto não é um número')
  } else {
    var id = parseInt(req.params.id)

    Game.destroy({
      where: { id: id }
    })
    res.sendStatus(200)
  }
})

app.put('/game/:id', (req, res) => {
  if (isNaN(req.params.id)) {
    res.sendStatus(400)
  } else {
    var id = parseInt(req.params.id)
    var { title, year, price } = req.body

    if (title === undefined) {
      res.sendStatus(400)
      console.log('Digite um título válido')
    } else {
      if (isNaN(year)) {
        res.sendStatus(400)
        console.log('Digite um ano válido')
      } else {
        if (isNaN(price)) {
          res.sendStatus(400)
          console.log('Digite um preço válido')
        } else {
          Game.update(
            {
              title: title,
              year: parseInt(year),
              price: parseFloat(price)
            },
            { where: { id: id } }
          )
          res.sendStatus(200)
        }
      }
    }
  }
})

/* CADASTRO DE USUARIOS */

app.get('/users', (req, res) => {
  res.sendStatus(200)
  User.findAll()
    .then(element => res.json(element))
    .catch(err => console.log(err))
})

app.get('/user/:id', (req, res) => {
  if (isNaN(req.params.id)) {
    res.sendStatus(400)
    res.send('Isto não é um número')
  } else {
    var id = parseInt(req.params.id)

    User.findByPk(id)
      .then(element => {
        res.status(200)
        res.json(element)
      })
      .catch(erro => {
        console.log(erro)
      })
  }
})

app.post('/user', (req, res) => {
  var { name, email, password } = req.body

  if (name === undefined) {
    res.sendStatus(400)
    console.log('Digite um nome válido')
  } else {
    if (email === undefined) {
      res.sendStatus(400)
      console.log('Digite um e-mail válido')
    } else {
      if (password === undefined) {
        res.sendStatus(400)
        console.log('Digite uma senha válida')
      } else {
        User.create({
          name: name,
          email: email,
          password: password
        })
        res.sendStatus(200)
      }
    }
  }
})

app.delete('/user/:id', (req, res) => {
  if (isNaN(req.params.id)) {
    res.sendStatus(400)
    res.send('Isto não é um número')
  } else {
    var id = parseInt(req.params.id)

    User.destroy({
      where: { id: id }
    })
    res.sendStatus(200)
  }
})

app.put('/user/:id', (req, res) => {
  if (isNaN(req.params.id)) {
    res.sendStatus(400)
  } else {
    var id = parseInt(req.params.id)
    var { name, email, password } = req.body

    if (name === undefined) {
      res.sendStatus(400)
      console.log('Digite um nome válido')
    } else {
      if (email === undefined) {
        res.sendStatus(400)
        console.log('Digite um e-mail válido')
      } else {
        if (password === undefined) {
          res.sendStatus(400)
          console.log('Digite uma senha válida')
        } else {
          User.update(
            {
              name: name,
              email: email,
              password: password
            },
            { where: { id: id } }
          )
          res.sendStatus(200)
        }
      }
    }
  }
})

/* AUTENTICACAO DE USUARIOS */

app.post('/auth', (req, res) => {
  var { email, password } = req.body

  if (email === undefined) {
    res.sendStatus(400)
    console.log('Digite um e-mail válido')
  } else {
    if (password === undefined) {
      res.sendStatus(400)
      console.log('Digite uma senha válida')
    } else {
      User.findOne({ where: { email: email, password: password } })
        .then(element => {
          if (element === null) {
            res.status(401)
            res.json({ err: 'Credenciais inválidas!' })
            console.log('Login ou senha não conferem')
          } else {
            jwt.sign(
              { id: element.id, email: element.email },
              secret,
              {
                expiresIn: '48h'
              },
              (err, token) => {
                if (err) {
                  res.status(400)
                  res.json({ err: 'Falha interna' })
                } else {
                  res.status(200)
                  res.json({ token: token })
                  console.log('Usuário Autenticado!')
                  console.log(element.name)
                  console.log(element.email)
                }
              }
            )
          }
        })
        .catch(err => {
          res.status(401)
          console.log(err)
        })
    }
  }
})

/* LISTEN */

app.listen(8080, () => {
  console.log('API RODANDO...')
})
