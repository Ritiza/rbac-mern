require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { requestLogger } = require('./utils/logger');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use(requestLogger);
app.use(cors({
  origin: true,
  credentials: true
}));

app.use('/api', routes);

const PORT = process.env.PORT || 4000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/rbac_db';

mongoose.connect(MONGO).then(()=> {
  console.log('Mongo connected');
  app.listen(PORT, ()=> console.log('API running on', PORT));
}).catch(err=>{
  console.error('Mongo connection failed', err);
});
