import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/filmek", async (req, res)=> {
    try {
        let sql = "SELECT filmek.cim AS film, SUM(foglalt.eladottJegy) AS eladottJegy, SUM(foglalt.eladottJegy * vetitesek.jegyar) AS bevetel, ROUND(SUM(foglalt.eladottJegy) * 100 / SUM(termek.sorok * termek.szekek), 1) AS telitettseg FROM filmek LEFT JOIN vetitesek ON filmek.id = vetitesek.film_id LEFT JOIN termek ON vetitesek.terem_id = termek.id LEFT JOIN (SELECT vetites_id, COUNT(*) AS eladottJegy FROM foglalasok GROUP BY vetites_id) foglalt ON vetitesek.id = foglalt.vetites_id GROUP BY filmek.id, filmek.cim ORDER BY bevetel DESC, filmek.cim ASC";

        const [eredmeny] = await db.query(sql);
        return res.json(eredmeny);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ hiba: 'Hiba történt a statisztika lekérdezésekor.' });
    }
})

export default router