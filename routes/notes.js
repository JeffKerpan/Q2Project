const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../knex');

router.use((req, res, next) => {
  if (req.user) {
    return next();
  }
  res.sendStatus(401);
});

router.get('/notes', (req, res, next) => {
  const userId = req.user.id;

  knex('notes')
    .select('*')
    .where('user_id', userId)
    .then((notes) => res.send(notes))
    .catch((error) => console.error(error));
});

router.get('/notes/:id', (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;

  knex('notes')

  // do we want to join with videos to get all info needed? for note taking page?

  .select(
    'id',
    'title',
    'note_file',
    'user_id',
    'video_id'
  )
  .where('id', id)
  .where('user_id', userId)
  .then((note) => {
    if (!note.length) {
      return res.status(404)
        .set({ 'Content-Type': 'plain/text' })
        .send('Not Found');
    }
    res.send(note[0]);
  }).catch((error) => console.error(error));
});

router.post('/notes', (req, res, next) => {
  const body = req.body;
  const userId = req.user.id;

  //where are we going to pull the video id from so that it is automatic
  const videoId = 3;

  if (!body.title) {
    return res.status(400)
      .set({ 'Content-Type': 'plain/text' })
      .send('Note title must not be blank');
  } else if (!body.note_file) {
    return res.status(400)
      .set({ 'Content-Type': 'plain/text' })
      .send('Note must not be empty');
  }

  knex('notes')
    .insert({
      title: body.title,
      note_file: body.note_file,
      user_id: userId,
      video_id: videoId
    })
    .then((newNote) => {
      // res.sendStatus(200) or res.redirect()
      res.send(newNote);
    })
    .catch((error) => console.error(error));
});

router.patch('/notes/:id', (req, res, next) => {
  const body = req.body;
  const userId = req.user.id;

  knex('notes')
    .update(body)
    .where('user_id', userId)
    .then((updatedNote) => {
      // res.sendStatus(200) or res.redirect()
      res.send(updatedNote);
    })
    .catch((error) => console.error(error));
});

router.delete('/notes/:id', (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;

  knex('notes')
    .del()
    .where('id', id)
    .where('user_id', userId)
    .then((deletedNote) => {
      if (!deletedNote) {
        return res.status(404)
          .set({ 'Content-Type': 'plain/text' })
          .send('Not Found');
      }
      res.send(deletedNote);
      res.redirect('../public/index.html');
    }).catch((error) => console.error(error));
});

module.exports = router;
