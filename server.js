// Import
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const data = {
  pages: {
    1: {
      id: 1,
      blocs: [
        {
          id: 5,
          type: 'title',
          content: 'Comment coder un CMS avec React',
        },
        {
          id: 12,
          type: 'text',
          content: '<em>C\'est plus facile qu\'il n\'y paraît !</em><br />Voyons ensemble comment React peut nous aider à <b>rapidement créer un site éditable</b>.',
        },
        {
          id: 2,
          type: 'text',
          content: 'La première étape consiste à…',
        }
      ]
    }
  }
};

// Server
const app = express();
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:1234');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});
app.use(session({
  secret: 'r4Nd0mStR1nG',
  resave: true,
  saveUninitialized: false,
  unset: 'destroy',
}));

// Authentication middleware. Protects *some* of the server/API endpoints.
const loggedInAsAdmin = function(req, res, next) {
  const loggedIn = req.session && req.session.admin;
  console.log('[auth] authorized?', loggedIn);
  if (loggedIn) {
    return next();
  }
  else {
    return res.status(401).end();
  }
};

// Homepage
app.get('/', (req, res) => {
  console.log('GET /');
  res.send(`
    <div style="margin: 5em auto; width: 400px; line-height: 1.5">
      <h1 style="text-align: center">Hello!</h1>
      <p>Bravo, ton serveur est bien lancé !</p>
      <div>Désormais, tu dois utiliser AJAX depuis ton challenge CMS (React) pour agir sur les URLs suivantes :</div>
      <ul style="display: inline-block; margin-top: .2em">
        <li>POST http://localhost:3000/login</li>
        <li>DELETE http://localhost:3000/logout</li>
        <li>GET http://localhost:3000/pages/1</li>
        <li>PUT http://localhost:3000/pages/1</li>
      </ul>
    </div>
  `);
})

// Session check.
app.get('/session', (req, res) => {
  res.send({
    username: req.session.username || null,
    admin: !!req.session.admin,
  });
});

// Login (creates an admin session).
app.post('/login', (req, res) => {
  console.log('POST /login');
  const { email, password } = req.body;
  if (email === 'admin@site.com' && password === 'test') {
    console.log('OK credentials', email, password);
    req.session.username = 'Admin';
    req.session.admin = true;
    const { username, admin } = req.session;
    res.status(201).send({ username, admin });
  }
  else {
    console.log('BAD credentials', email, password);
    res.status(400).end();
  }
});

// Logout (destroys an admin session).
app.delete('/logout', (req, res) => {
  console.log('DELETE /logout');
  req.session.destroy();
  res.status(200).end();
});

// Static page with id 1. Public endpoint.
app.get('/pages/1', (req, res) => {
  console.log('GET /pages/1');
  res.send(data.pages["1"]);
});

// Edit static page with id 1. Private endpoint.
app.put('/pages/1', loggedInAsAdmin, (req, res) => {
  console.log('PUT /pages/1');
  data.pages["1"] = req.body;
  res.status(200).send(data.pages["1"]);
});

// Start local server on :3000.
app.listen(3000);
console.log('Server/API running at http://localhost:3000/');
