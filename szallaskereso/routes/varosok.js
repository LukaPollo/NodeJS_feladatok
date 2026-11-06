import express from "express";
import db from "../data/db.js"
const app = express.Router()
app.get("/varosok", async (req, res) => {
    const minSzallas= req.query.minSzallas
    let sql = "SELECT varosok.id, varosok.nev, varosok.orszag, COUNT(szallasok.id) szallasDb, MIN(szallasok.ar) legolcsobb, ROUND(AVG(szallasok.ar)) atlagAr FROM varosok LEFT JOIN szallasok ON varosok.id = szallasok.varos_id GROUP BY varosok.id, varosok.nev, varosok.orszag";
    let adatok = []

    //A ?minSzallas= a csoportosítás utáni feltétel → HAVING szallasDb >= ?, nem WHERE. 
    if (minSzallas) {
        sql += " HAVING COUNT(szallasok.id) >= ?"
        adatok.push(minSzallas)
    }

    sql += " ORDER BY varosok.nev ASC"
    const eredmeny = await db.query(sql, adatok)
    res.json(eredmeny)
});

app.get("/varosok/:id/szallasok", async (req, res) => {
    let id = req.params.id;
    let sql = "SELECT szallasok.*, varosok.nev varos, varosok.orszag FROM szallasok JOIN varosok ON szallasok.varos_id = varosok.id WHERE varosok.id = ? ORDER BY szallasok.ar ASC";
    const eredmeny = await db.query(sql, [id]);

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

    res.json(szallasok);
});

export default app;