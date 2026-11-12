import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/", async (req,res) => {
    const {datum} = req.query;
    let base = "SELECT filmek.id, filmek.cim, termek.nev, vetitesek.kezdes, DATE_FORMAT(vetitesek.kezdes + INTERVAL filmek.hossz MINUTE, '%H:%i') AS veg, vetitesek.jegyar, termek.sorok * termek.szekek - (SELECT COUNT(*) FROM foglalasok WHERE foglalasok.vetites_id = vetitesek.id) AS szabadHely FROM vetitesek JOIN termek ON termek.id = vetitesek.terem_id JOIN filmek ON filmek.id = vetitesek.film_id";
    let params =[];
    if(datum){
        base += " WHERE DATE(vetitesek.kezdes) = ?"
        params.push(datum);
    }

    base += " ORDER BY vetitesek.kezdes ASC";

    const [eredmeny] = await db.query(base, params);
    res.json(eredmeny);
})

router.get("/:id", async (req,res) => {
    const {id} = req.params;

    if (isNaN(id)){
        return res.status(400).json({hiba: "az idnek szamnak kene lennie!"});
    }

    try{
        let sql = "SELECT vetitesek.id, filmek.cim AS film, termek.nev AS terem, DATE_FORMAT(vetitesek.kezdes, '%Y-%m-%d %H:%i') AS kezdes, vetitesek.jegyar, termek.sorok, termek.szekek FROM vetitesek JOIN filmek ON vetitesek.film_id = filmek.id JOIN termek ON vetitesek.terem_id = termek.id WHERE vetitesek.id = ?";
        const [eredmeny] = await db.query(sql, [id]);

        if (eredmeny.length === 0) {
            return res.status(404).json({ hiba: 'A vetítés nem található.' });
        }

        let sql2 = "SELECT sor, szek FROM foglalasok WHERE vetites_id = ? ORDER BY sor ASC, szek ASC";
        const [foglalt] = await db.query(sql2, [id]);

        res.json({
            id: eredmeny[0].id,
            film: eredmeny[0].film,
            terem: eredmeny[0].terem,
            kezdes: eredmeny[0].kezdes,
            jegyar: eredmeny[0].jegyar,
            sorok: eredmeny[0].sorok,
            szekek: eredmeny[0].szekek,
            foglaltDb: foglalt.length,
            szabadHely: (eredmeny[0].sorok * eredmeny[0].szekek),
            foglalt: foglalt
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ hiba: 'Hiba történt az adatok lekérdezésekor.' });
    }
})

export default router