// SERVER
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// DATABASE
const connectDB = require('./config/db');
connectDB();

// MIDDLEWARE
app.use(express.json());


// ROUTING
app.get('/', (req, res) => res.send('TEST API Running'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profiles', require('./routes/api/profiles'));
app.use('/api/posts', require('./routes/api/posts'));


// CONNECTIONS
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));




