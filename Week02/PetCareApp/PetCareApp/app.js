const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const petRoutes = require('./routes/petRoutes');
const journalRoutes = require('./routes/journalRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(flash());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'secret123',
  resave: false,
  saveUninitialized: true
}));

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/pets', petRoutes);
app.use('/journals', journalRoutes);

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));
