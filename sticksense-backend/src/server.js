import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDb } from './lib/mongo.js';

dotenv.config();

const app = express();
await getDb();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health',(req,res)=>{
    res.json({ok:true, env: process.env.NODE_ENV || 'dev' })
});

//API Routing
import gamesRouter from './routes/game.route.js';
app.use("/api/games", gamesRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
});