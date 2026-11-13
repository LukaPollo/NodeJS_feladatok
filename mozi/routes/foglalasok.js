
import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.post("/", async (req,res) => {
    const {vetitesId, nev, sor, szek} = req.body;

    try {
        let sql = "SELECT vetitesek.id, filmek.cim AS film, termek.nev AS terem, DATE_FORMAT(vetitesek.kezdes, '%Y-%m-%d %H:%i') AS kezdes, vetitesek.jegyar, termek.sorok, termek.szekek FROM vetitesek JOIN filmek ON vetitesek.film_id = filmek.id JOIN termek ON vetitesek.terem_id = termek.id WHERE vetitesek.id = ?";
        const [vetites] = await db.query(sql, [vetitesId]);

        if (vetites.length === 0) {
            return res.status(404).json({hiba: "Nincs ilyen vetites"});
        }

        if (Number(sor) > vetites[0].sorok || Number(szek) > vetites[0].szekek || Number(sor) < 1 || Number(szek) < 1) {
            return res.status(400).json({hiba: "Nincs ilyen hely a teremben"});
        }

        let sql2 = "SELECT * FROM foglalasok WHERE vetites_id = ?";
        const [foglalt] = await db.query(sql2, [vetitesId]);

        if (foglalt.length >= vetites[0].sorok * vetites[0].szekek) {
            return res.status(409).json({hiba: "409 (telt ház: a Klubterem mind a 8 helye foglalt)"});
        }

        let sql3 = "INSERT INTO foglalasok (vetites_id, nev, sor, szek) VALUES (?, ?, ?, ?)";
        const [eredmeny] = await db.query(sql3, [vetitesId, nev, sor, szek]);

        res.status(201).json({
            id: eredmeny.insertId,
            film: vetites[0].film,
            terem: vetites[0].terem,
            kezdes: vetites[0].kezdes,
            nev: nev,
            sor: Number(sor),
            szek: Number(szek),
            jegyar: vetites[0].jegyar
        });
    }

    catch(error){
        if(error.code === "ER_DUP_ENTRY"){
            return res.status(409).json({hiba: "409 (a hely már foglalt)"});
        }

        console.error(error);
        res.status(500).json({ hiba: "Hiba tortent a foglalas rogzitese soran." });
    }
});

router.delete("/:id", async (req,res) => {
    try{
        const id = Number(req.params.id);

        if(isNaN(id)){
            return res.status(400).json({ hiba: "szamokat kell irni pls" });
        }

        let sql = "DELETE FROM foglalasok WHERE id = ?";
        const [eredmeny] = await db.query(sql, [id]);

        if(eredmeny.affectedRows === 0){
            return res.status(404).json({hiba: " nincs ilyen foglalas 404"});
        }

        res.status(204).send();
    }
    catch (error){
        console.log(error);
        res.status(500).json({hiba: "szerver hiba 500"});
    }
});

export default router;
