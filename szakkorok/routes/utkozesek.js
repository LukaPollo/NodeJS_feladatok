import express from "express";
import db from "../data/db.js";

const route = express.Router();

route.get("/", async (req, res) => {
    let base = "SELECT diakok.nev AS diak, szakkorok.nap, GROUP_CONCAT(szakkorok.nev ORDER BY szakkorok.nev) AS szakkorok FROM jelentkezesek JOIN diakok ON diakok.id = jelentkezesek.diak_id JOIN szakkorok ON szakkorok.id = jelentkezesek.szakkor_id GROUP BY diakok.id, szakkorok.nap HAVING COUNT(*) > 1 ORDER BY diakok.nev";

    const [eredmeny] = await db.query(base);
    
    eredmeny.forEach(adat => {
        adat.szakkorok = adat.szakkorok.split(",");
    });

    res.json(eredmeny);
});

export default route;