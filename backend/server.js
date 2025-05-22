const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

// Wczytanie zmiennych środowiskowych
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Połączenie z MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Połączono z MongoDB Atlas'))
  .catch(err => console.error('Błąd połączenia z MongoDB:', err));

// Schematy i modele
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, unique: true },
  available: { type: Boolean, default: true }
});
const Book = mongoose.model('Book', bookSchema);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
});
const User = mongoose.model('User', userSchema);

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  loanDate: { type: Date, default: Date.now },
  returnDate: { type: Date }
});
const Loan = mongoose.model('Loan', loanSchema);

const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  reservationDate: { type: Date, default: Date.now }
});
const Reservation = mongoose.model('Reservation', reservationSchema);

const suggestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'pending' }
});
const Suggestion = mongoose.model('Suggestion', suggestionSchema);

// Endpointy API
app.get('/api/books', async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

app.post('/api/books', async (req, res) => {
  const book = new Book(req.body);
  await book.save();
  res.json(book);
});

app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

app.post('/api/loans', async (req, res) => {
  const loan = new Loan(req.body);
  await loan.save();
  await Book.findByIdAndUpdate(req.body.bookId, { available: false });
  res.json(loan);
});

app.post('/api/reservations', async (req, res) => {
  const reservation = new Reservation(req.body);
  await reservation.save();
  res.json(reservation);
});

app.post('/api/suggestions', async (req, res) => {
  const suggestion = new Suggestion(req.body);
  await suggestion.save();
  res.json(suggestion);
});

app.listen(3000, () => console.log('Serwer działa na porcie 3000'));