const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
require('./cron');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`CinéList Backend listening on port ${PORT}`);
});
