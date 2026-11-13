import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/havi", async (req,res) => {
    try{
        let sql = "SELECT autok.kategoria, COUNT(DISTINCT autok.id) AS autoDb, COUNT(berlesek.id) AS berlesDb, SUM(DATEDIFF(berlesek.veg, berlesek.kezdet)) AS napDb, SUM(DATEDIFF(berlesek.veg, berlesek.kezdet) * autok.napidij) AS bevetel FROM autok LEFT JOIN berlesek ON autok.id = berlesek.auto_id GROUP BY autok.kategoria ORDER BY bevetel DESC;";
        const [eredmeny] = await db.query(sql);
        res.json(eredmeny);
    }
    catch(error){
        res.status(500).json({ hiba: " szerver error 500 " });
    }


})

router.get("/kategoriak", async (req,res) => {
    try{
        let sql = "SELECT autok.kategoria, COUNT(DISTINCT autok.id) AS autoDb, COUNT(berlesek.id) AS berlesDb, COALESCE(SUM(DATEDIFF(berlesek.veg, berlesek.kezdet)), 0) AS napDb, COALESCE(SUM(DATEDIFF(berlesek.veg, berlesek.kezdet) * autok.napidij), 0) AS bevetel FROM autok LEFT JOIN berlesek ON autok.id = berlesek.auto_id GROUP BY autok.kategoria ORDER BY bevetel DESC;";
        const [eredmeny] = await db.query(sql);
        res.json(eredmeny); 
    }
    catch(error){
        res.status(500).json({ hiba: " szerver error 500 " });
    }


})

export default router