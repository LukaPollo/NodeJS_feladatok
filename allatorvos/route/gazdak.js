import express from "express";
import db from "../data/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const { varos } = req.query;
    
    let base = "SELECT gazdak.id, gazdak.nev, gazdak.varos, COUNT(allatok.id) AS allatDb FROM gazdak JOIN allatok ON gazdak.id = allatok.gazda_id";
    let adat = [];

    if (varos) {
        base += " WHERE gazdak.varos = ?";
        adat.push(varos);
    }

    base += " GROUP BY gazdak.id, gazdak.nev, gazdak.varos ORDER BY gazdak.nev";

    const [eredmeny] = await db.query(base, adat);
    res.json(eredmeny);
})

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const base = "SELECT gazdak.id AS gazdaId, gazdak.nev AS gazdaNev, gazdak.telefon, gazdak.varos, allatok.id AS allatId, allatok.nev AS allatNev, allatok.faj, allatok.szuletes FROM gazdak JOIN allatok ON gazdak.id = allatok.gazda_id WHERE gazdak.id = ?;"
    
    const [eredmeny] = await db.query(base, [id]);

    res.json(eredmeny);
})

export default router