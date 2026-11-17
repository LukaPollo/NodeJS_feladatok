
import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/", async (req,res) => {
    try {
        let sql = "SELECT filmek.id, filmek.cim, filmek.hossz, filmek.korhatar, COUNT(DISTINCT vetitesek.id) AS vetitesDb, COUNT(foglalasok.vetites_id) AS eladottJegy FROM filmek LEFT JOIN vetitesek ON vetitesek.film_id = filmek.id LEFT JOIN foglalasok ON foglalasok.vetites_id = vetitesek.id GROUP BY filmek.id, filmek.cim, filmek.hossz, filmek.korhatar ORDER BY filmek.cim;";

        const [eredmeny] = await db.query(sql);
        res.json(eredmeny);
    }
    catch(error) {
        console.log(error);
        res.status(500).json({hiba: "Szerver hiba"});
    }
})

router.get("/:id", async (req,res) => {
    const {id} = req.params;

    if (isNaN(id)){
        return res.status(400).json({hiba: "az idnek szamnak kene lennie!"});
    }

    try{
        let sql = "SELECT * FROM filmek WHERE id = ?";
        const [film] = await db.query(sql, [id]);

        if(film.length === 0){
            return res.status(404).json({hiba: "Nincs ilyen film"});
        }

        let sql2 = "SELECT vetitesek.id, termek.nev AS terem, DATE_FORMAT(vetitesek.kezdes, '%Y-%m-%d %H:%i') AS kezdes, vetitesek.jegyar, (termek.sorok * termek.szekek) - (SELECT COUNT(*) FROM foglalasok WHERE foglalasok.vetites_id = vetitesek.id) AS szabadHely FROM vetitesek JOIN termek ON vetitesek.terem_id = termek.id WHERE vetitesek.film_id = ? ORDER BY vetitesek.kezdes ASC";

        const [eredmeny] = await db.query(sql2, [id]);

        res.json({
            id: film[0].id,
            cim: film[0].cim,
            hossz: film[0].hossz,
            korhatar: film[0].korhatar,
            vetitesek: eredmeny
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({hiba: "Szerver hiba"});
    }
});

export default router
