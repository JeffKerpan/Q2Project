const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require ('jsonwebtoken');
const knex = require('../knex');
const secret = process.env.SECRET;

router.get('/token', (req, res, next)=>{
  const token = req.cookies.token;

  jwt.verify(token, secret, (err) => {
    if (err) {
      return res.set({ 'Content-Type': 'application/json' }).send('false');
    }
    res.set({ 'Content-Type': 'application/json' }).send('true');
  });
});

router.post('/token', (req, res, next) => {
  // email or username for login?
  // if username, we should change migration so that username is also a unique value
  // const username = req.body.username;

  const email = req.body.email;
  const password = req.body.password;

  if (!email) {
    return res.status(400)
      .set({ 'Content-Type': 'plain/text' })
      .send('Email must not be blank');
  }
  else if (!password) {
    return res.status(400)
      .set({ 'Content-Type': 'plain/text' })
      .send('Password must not be blank');
  }

  knex('users')
    .where('email', email)
    // .where('username', username)
    .then((user) => {
      const hashPassword = user[0].hashed_password;

      if (bcrypt.compareSync(password, hashPassword)) {
        const userInfo = {
          id: user[0].id,
          firstName: user[0].first_name,
          lastName: user[0].last_name,
          email: user[0].email,
          username: user[0].username
        };
        const token = jwt.sign(userInfo, secret);

        res.cookie('token', token, { httpOnly: true }).send(userInfo);
      } else {
        res.status(400)
            .set({ 'Content-Type': 'plain/text' })
            .send('Bad email or password');
      }
    }).catch(() => {
      res.status(400)
          .set({ 'Content-Type': 'plain/text' })
          .send('Bad email or password');
    });
});

router.delete('/token/:id', (req, res, next)=>{
  res.cookie('token', '').send();
});
