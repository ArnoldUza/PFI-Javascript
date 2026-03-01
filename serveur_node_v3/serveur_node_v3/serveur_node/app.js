const express = require('express');
const http = require("http");
const bodyParser = require('body-parser');
const config = require('./config');

const menu = require('./routes/menu');
const commandeRoutes = require('./routes/commande');

const app = express();
const { port, user_ora, password_ora, string_ora } = config;

app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`Accessing ${req.path}`);
    next();
});

app.get('/', (req, res) => {
    res.json({ message: 'Bonjour, Hi' });
});

app.use('/cafehomer/menu', menu.menuRoutes);
app.use('/cafehomer/commande', commandeRoutes);

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Écoute sur http://localhost:${port}`);
});

process.on('SIGINT', async () => {
    console.log("Arrêt du serveur");
    process.exit();
});