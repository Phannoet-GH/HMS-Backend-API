import 'dotenv/config';
import app from './app.js';
import connectDatabase from './config/db.js';

const PORT = process.env.PORT || 3000;

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      const url = `http://localhost:${PORT}`;

      console.log(`Server running on port ${PORT}`);
      console.log(`Open in browser: ${url}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });