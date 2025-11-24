const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDb } = require('./config/db');

dotenv.config();

const app = express();
connectDb();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health',(req,res)=>{
    res.json({ok:true, env: process.env.NODE_ENV || 'dev' })
});

//API Routing
import gamesRouter from "./routes/games.route.js";
app.use("/api/games", gamesRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
});