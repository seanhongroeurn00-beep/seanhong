const express = require('express');
const cors = require('cors');
const peopleRoutes = require('./routes/peopleRoutes');
const provinceRoutes = require('./routes/provinceRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Correct application router mounting configuration prefixes
app.use('/api/people', peopleRoutes);
app.use('/api/provinces', provinceRoutes);

app.get('/', (req, res) => {
  res.send('API Connection Node Running.');
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is open to the local network on port ${PORT}`);
});