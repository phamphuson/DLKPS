require('dotenv').config();
const app = require('./src/app');
const { seedAdmin } = require('./src/services/seedService');

const PORT = process.env.PORT || 3000;

// Seed Admin on startup
seedAdmin();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
