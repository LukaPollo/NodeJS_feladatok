import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/", async (req,res) =>{
    try{
        let sql = "SELECT hozzavalok.id, hozzavalok.nev, hozzavalok.mertekegyseg, hozzavalok.egysegar, COUNT(recept_hozzavalok.recept_id) AS receptDb FROM hozzavalok LEFT JOIN recept_hozzavalok ON hozzavalok.id = recept_hozzavalok.hozzavalo_id GROUP BY hozzavalok.id ORDER BY receptDb DESC, hozzavalok.nev";
        const [eredmeny] = await db.query(sql);
        res.json(eredmeny);
    }
    catch(error){
        res.status(500).json({ hiba: " szerver error 500 " });
    }
});

router.get("/nem-hasznalt", async (req,res)=> {
    try{
        let sql = "SELECT hozzavalok.id, hozzavalok.nev FROM hozzavalok LEFT JOIN recept_hozzavalok ON hozzavalok.id = recept_hozzavalok.hozzavalo_id WHERE recept_hozzavalok.recept_id IS NULL";
        const [eredmeny] = await db.query(sql);
        res.json(eredmeny);
    }
    catch(error){
        res.status(500).json({ hiba: " szerver error 500 " });
    }
});

export default router;
