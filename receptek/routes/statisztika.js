import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/kategoriak", async (req,res)=>{
    try{
        let sql = "SELECT receptek.kategoria, COUNT(DISTINCT receptek.id) AS receptDb, ROUND(AVG(receptek.ido)) AS atlagIdo, ROUND(AVG(recept_hozzavalok.mennyiseg * hozzavalok.egysegar)) AS atlagKoltseg FROM receptek LEFT JOIN recept_hozzavalok ON receptek.id = recept_hozzavalok.recept_id LEFT JOIN hozzavalok ON recept_hozzavalok.hozzavalo_id = hozzavalok.id GROUP BY receptek.kategoria ORDER BY receptek.kategoria;";
        const [eredmeny] = await db.query(sql);
        res.json(eredmeny);
    }
    catch(error){
        res.status(500).json({ hiba: " szerver error 500 " });
    }

})

export default router;