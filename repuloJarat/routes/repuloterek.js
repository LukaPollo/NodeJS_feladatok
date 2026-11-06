import express from "express";
import db from "../data/db.js";
const app = express.Router();
app.get("/repuloterek", async (req,res) => {
    let sql = "SELECT * FROM repuloterek ORDER BY repuloterek.kod ASC";
    let eredmeny = await db.query(sql);
    res.json(eredmeny)
});

app.get("/repuloterek/:code/indulasok", async (req, res) => {
    let airportcode = req.params.code;
    let sql = "SELECT id FROM repuloterek WHERE kod = ?";
    const [eredmeny] = await db.query(sql, [airportcode]);

    sql = "SELECT * FROM jaratok WHERE honnan_id = ? ORDER BY indulas ASC";
    const [jaratok] = await db.query(sql, [eredmeny[0].id]);

    let adatok = [];

    for (let jarat of jaratok) {
        sql = "SELECT * FROM legitarsasagok WHERE id = ?";
        const [legitarsasag] = await db.query(sql, [jarat.legitarsasag_id]);

        sql = "SELECT * FROM repuloterek WHERE id = ?";
        const [repuloter] = await db.query(sql, [jarat.hova_id]);

        let [ora, perc] = jarat.indulas.split(":").map(Number);
        let osszPerc = ora * 60 + perc + jarat.idotartam;
        let erkezesOra = Math.floor(osszPerc / 60);
        let erkezesPerc = osszPerc % 60;
        
        if (erkezesOra < 10) {
            erkezesOra = "0" + erkezesOra;
        }

        if (erkezesPerc < 10) {
            erkezesPerc = "0" + erkezesPerc;
        }

        let erkezes = erkezesOra + ":" + erkezesPerc;
        adatok.push({
            indulas: jarat.indulas.slice(0, 5),
            jaratszam: jarat.jaratszam,
            legitarsasag: legitarsasag[0].nev,
            celallomas: repuloter[0].varos + " (" + repuloter[0].kod + ")",
            erkezes: erkezes
        });
    }

    res.json(adatok);
});

export default app;