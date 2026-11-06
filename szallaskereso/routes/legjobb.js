import express from "express";
import db from "../data/db.js"

const app = express.Router()

app.get("/legjobb/:db", async (req, res) => {
    let dbszam = Number(req.params.db); //LIMIT ? paramétere szám legyen (Number(req.params.n)), szövegre hibát kapsz. 

    let sql = "SELECT szallasok.*, varosok.nev varos, varosok.orszag FROM szallasok JOIN varosok ON szallasok.varos_id = varosok.id ORDER BY szallasok.ertekeles DESC LIMIT ?";
    const eredmeny = await db.query(sql, [dbszam]);

    let szallasok = eredmeny.map(szallas => ({
        id: szallas.id,
        nev: szallas.nev,
        varos: szallas.varos,
        orszag: szallas.orszag,
        csillag: szallas.csillag,
        ar: szallas.ar,
        medence: Boolean(szallas.medence),
        ertekeles: Number(szallas.ertekeles)
    }));

    res.json(szallasok)
});

export default app;