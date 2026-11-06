import express from "express";
import db from "../data/db.js";

const app = express.Router();

app.get("/orszagok", async (req, res) => {
    let sql = "SELECT varosok.orszag, COUNT(DISTINCT varosok.id) varosDb, COUNT(szallasok.id) szallasDb, ROUND(AVG(szallasok.ertekeles), 2) atlagErtekeles FROM varosok LEFT JOIN szallasok ON varosok.id = szallasok.varos_id GROUP BY varosok.orszag ORDER BY varosok.orszag ASC";

    const eredmeny = await db.query(sql)

    let orszagok = eredmeny.map(orszag => ({
        orszag: orszag.orszag,
        varosDb: orszag.varosDb,
        szallasDb: orszag.szallasDb,
        atlagErtekeles: orszag.atlagErtekeles == null ? null : Number(orszag.atlagErtekeles)
    }));

    res.json(orszagok)
})

export default app;