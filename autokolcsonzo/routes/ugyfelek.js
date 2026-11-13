import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/", async (req,res) => {
    try{
        let sql = "SELECT ugyfelek.id, ugyfelek.nev, COUNT(berlesek.id) AS berlesDb, SUM(DATEDIFF(berlesek.veg, berlesek.kezdet)) AS osszNap, SUM(autok.napidij * DATEDIFF(berlesek.veg, berlesek.kezdet)) AS osszKoltes FROM ugyfelek LEFT JOIN berlesek ON berlesek.ugyfel_id = ugyfelek.id LEFT JOIN autok ON autok.id = berlesek.auto_id GROUP BY ugyfelek.id, ugyfelek.nev ORDER BY osszKoltes DESC;"; 
        const [eredmeny] = await db.query(sql);
        res.json(eredmeny);  
    }
    catch(error){
        res.status(500).json({ hiba: " szerver error 500 " });
    }
})

export default router