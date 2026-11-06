import express from "express";
import db from "../data/db.js";

const app = express.Router();

app.get("/legitarsasagok", async (req, res) => {
    let sql = "SELECT legitarsasagok.kod, legitarsasagok.nev, COUNT(jaratok.id) jaratDb, COUNT(DISTINCT jaratok.hova_id) celallomasDb, MIN(jaratok.ar) legolcsobb, ROUND(AVG(jaratok.ar)) atlagAr FROM legitarsasagok LEFT JOIN jaratok ON legitarsasagok.id = jaratok.legitarsasag_id GROUP BY legitarsasagok.id ORDER BY jaratDb DESC, legitarsasagok.nev ASC";
    const eredmeny = await db.query(sql);
    res.json(eredmeny);
});

export default app;