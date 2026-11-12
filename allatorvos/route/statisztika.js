import express from "express";
import db from "../data/db.js";

const router = express.Router();

router.get("/fajok", async (req,res) => {
    let base = "SELECT allatok.faj, COUNT(DISTINCT allatok.id) AS allatDb, COUNT(kezelesek.id) AS kezelesDb, SUM(kezelesek.dij) AS bevetel FROM allatok LEFT JOIN kezelesek ON allatok.id = kezelesek.allat_id GROUP BY allatok.faj;";
    const [eredmeny] = await db.query(base)
    res.json(eredmeny);
})
router.get("/havi", async (req,res) => {
    let base = "SELECT DATE_FORMAT(datum, '%Y-%m') AS honap, COUNT(*) AS kezelesDb, SUM(dij) AS bevetel FROM kezelesek GROUP BY DATE_FORMAT(datum, '%Y-%m') ORDER BY honap;";
    const [eredmeny] = await db.query(base)
    res.json(eredmeny);
})
router.get("/gazdak", async (req,res) => {
    let base = "SELECT gazdak.nev AS gazda, COUNT(DISTINCT allatok.id) AS allatDb, SUM(kezelesek.dij) AS osszKoltes FROM gazdak LEFT JOIN allatok ON gazdak.id = allatok.gazda_id LEFT JOIN kezelesek ON allatok.id = kezelesek.allat_id GROUP BY gazdak.id, gazdak.nev ORDER BY osszKoltes DESC;";
    const [eredmeny] = await db.query(base)
    res.json(eredmeny);
})

export default router;