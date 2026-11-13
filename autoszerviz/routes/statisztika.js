import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/statuszok", async (req,res)=> {
    let sql = "SELECT munkalapok.statusz, COUNT(munkalapok.statusz) FROM `munkalapok` GROUP BY munkalapok.statusz;";
    const [eredmeny] = await db.query(sql);
    res.json(eredmeny);
})

router.get("/alkatreszek", async (req,res) =>{
    let sql = "SELECT alkatreszek.nev AS alkatresz, COUNT(felhasznalasok.alkatresz_id) AS felhasznaltDb, (COUNT(felhasznalasok.alkatresz_id) * alkatreszek.ar) AS bevetel FROM `alkatreszek` LEFT JOIN felhasznalasok ON felhasznalasok.alkatresz_id = alkatreszek.id GROUP BY alkatreszek.id, alkatreszek.nev, alkatreszek.ar ORDER BY bevetel DESC;"
    const [eredmeny] = await db.query(sql);
    res.json(eredmeny);
})

export default router