const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { DataSource } = require('typeorm');
const { authenticate } = require('./authenticate');
const User = require('./Entities/User');
const Note = require('./Entities/Note');
const config = require('./config/config');

const server = express();

server.use(express.json());
server.use(helmet());
server.use(cors());

// createConnection({
//   type: 'postgres',
//   url: config.connectionString,
//   entities: [User, Note],
//   synchronize: true,
//   logging: false,
// })
//   .then(() => console.log('API connected...PostgreSQL connected...'))
//   .catch(() => console.log('Connection to API failed'));

const AppDataSource = new DataSource({
  type: 'postgres',
  // url: config.connectionString,
  host: 'localhost',
  port: 3306,
  username: 'test',
  password: 'test',
  database: 'test',
  entities: [User, Note],
  synchronize: true,
  logging: false
});

AppDataSource.initialize()
  .then(() => {
    console.log('API connected...PostgreSQL connected...');
  })
  .catch((err) => {
    console.error('Connection to API failed', err);
  });

server.get('/', (req, res) => {
  res.send({ API: 'running' });
});

server.delete('/deletenote', authenticate, async (req, res) => {
  const id = req.get('id'); // what id is this? Maybe update.
  const noteRepository = AppDataSource.getRepository(Note);

  try {
    const targetNote = await noteRepository.findOne(id);
    if (!targetNote) {
      res.status(404).json({ errorMessage: 'Note not found' });
      return;
    }

    await noteRepository.remove(targetNote);
    res.status(200).json(targetNote);
  } catch (err) {
    res.status(500).json({
      errorMessage: 'There was an internal error while the note was deleting',
    });
  }
});

server.get('/getnotes', authenticate, async (req, res) => {
  const { email } = req.jwtObj; // change to user id when doing front end
  const noteRepository = AppDataSource.getRepository(Note);

  try {
    const notes = await noteRepository.find({ where: { email } }); // change
    res.status(200).json({ notes });
  } catch (err) {
    res.status(500).json({
      errorMessage: 'There was an internal error while retrieving notes',
      errorBody: err,
    });
  }
});

server.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ email });

    if (!user) {
      res.status(400).json({
        errorMessage: 'The email entered was not found in the system',
        errorBody: 'n/a',
      });
      return;
    }

    const matched = await user.checkPassword(password);

    if (!matched) {
      res.status(400).json({
        errorMessage: 'The email and password do not match',
        errorBody: 'n/a',
      });
    } else {
      const payload = {
        email: user.email // probably update with user id
      };
      const token = jwt.sign(payload, config.mySecret);
      res.status(201).json({ token });
    }
  } catch (err) {
    res.status(500).json({
      errorMessage: 'There was an internal error while processing the login',
      errorBody: err,
    });
  }
});

server.post('/newnote', authenticate, async (req, res) => {
  const noteInfo = req.body;
  const { email } = req.jwtObj; // change??
  const userRepository = AppDataSource.getRepository(User);

  try {
    const user = await userRepository.findOne({ email }); // better to use id?

    if (!user) {
      res.status(400).json({
        errorMessage: 'User not found',
      });
      return;
    }

    const noteRepository = AppDataSource.getRepository(Note);
    const note = noteRepository.create({
      ...noteInfo,
      user,
    });

    const newNote = await noteRepository.save(note);
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({
      errorMessage: 'There was an internal error while creating the note',
      errorBody: err,
    });
  }
});

server.post('/register', async (req, res) => {
  const userInfo = req.body;
  const { email, password } = req.body;

  const userRepository = AppDataSource.getRepository(User);

  try {
    const existingUser = await userRepository.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        errorMessage: 'The email already exists, try another email',
      });
      return;
    }

    const user = userRepository.create({
      email,
      password,
    });

    const newUser = await userRepository.save(user);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({
      errorMessage: 'There was an internal error while registering the user',
      errorBody: err,
    });
  }
});

server.put('/updatenote', authenticate, async (req, res) => {
  const changes = req.body; // no jwtObj needed?
  const { id, title, body } = changes;

  if (!title || !body || !id) {
    res.status(400).json({ errorMessage: 'Incomplete information provided for update' });
    return;
  }

  const noteRepository = AppDataSource.getRepository(Note);

  try {
    const noteToUpdate = await noteRepository.findOne(id);

    if (!noteToUpdate) {
      res.status(404).json({ errorMessage: 'The note with the specified ID was not found' });
      return;
    }

    noteToUpdate.title = title;
    noteToUpdate.body = body;

    const updatedNote = await noteRepository.save(noteToUpdate);
    res.status(200).json(updatedNote);
  } catch (err) {
    res.status(500).json({
      errorMessage: 'There was an internal error while updating the note',
      errorBody: err,
    });
  }
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
