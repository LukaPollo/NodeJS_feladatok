import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/", async (req,res) => {
    let sql = "SELECT filmek.id, filmek.cim, filmek.hossz, filmek.korhatar, COUNT(DISTINCT vetitesek.id) AS vetitesekDb, COUNT(foglalasok.vetites_id) AS eladottJegyDb FROM filmek LEFT JOIN vetitesek ON vetitesek.film_id = filmek.id LEFT JOIN foglalasok ON foglalasok.vetites_id = vetitesek.id GROUP BY filmek.id, filmek.cim, filmek.hossz, filmek.korhatar ORDER BY filmek.cim;"
    const [eredmeny] = await db.query(sql);
    res.json(eredmeny);
})

router.get("/:id", async (req,res) => {
    const {id} = req.params;
    if (isNaN(id)){
        return res.status(400).json({hiba: "az idnek szamnak kene lennie!"});
    }
    try{
        let sql = "SELECT vetitesek.id, termek.nev AS terem, DATE_FORMAT(vetitesek.kezdes, '%Y-%m-%d %H:%i') AS kezdes, vetitesek.jegyar, (termek.sorok * termek.szekek) - COUNT(foglalasok.id) AS szabadHely FROM vetitesek JOIN termek ON vetitesek.terem_id = termek.id LEFT JOIN foglalasok ON vetitesek.id = foglalasok.vetites_id WHERE vetitesek.film_id = ? GROUP BY vetitesek.id, termek.nev, vetitesek.kezdes, vetitesek.jegyar, termek.sorok, termek.szekek ORDER BY vetitesek.kezdes ASC;";

        const [eredmeny] = await db.query(sql, [id]);
        if(eredmeny.length === 0){
            res.status(404).json({vetitesek: []}) 
        }
        res.json(eredmeny);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ hiba: 'Hiba történt az adatok lekérdezésekor.' });
    }
});

export default router