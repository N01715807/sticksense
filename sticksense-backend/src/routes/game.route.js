import express from "express"
const router = express.Router();

import { getTodayGamesWithHighlights } from "../controllers/games.controller.js";

router.get("/games-today", getTodayGamesWithHighlights);

export default router;