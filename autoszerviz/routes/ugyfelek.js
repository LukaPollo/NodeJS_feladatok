import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/", async (req,res) => {
    let sql = "SELECT ugyfelek.id, ugyfelek.nev, ugyfelek.telefon, COUNT(DISTINCT munkalapok.id) AS munkalapDb, (SUM(munkalapok.munkaora*12000) + SUM(felhasznalasok.db * alkatreszek.ar)) AS osszKoltes FROM ugyfelek LEFT JOIN munkalapok ON munkalapok.ugyfel_id = ugyfelek.id LEFT JOIN felhasznalasok ON felhasznalasok.munkalap_id = munkalapok.id LEFT JOIN alkatreszek ON alkatreszek.id = felhasznalasok.alkatresz_id GROUP BY ugyfelek.id, ugyfelek.nev, ugyfelek.telefon ORDER BY osszKoltes DESC;"
    const [eredmeny] = await db.query(sql)
    res.json(eredmeny);
})

export default router