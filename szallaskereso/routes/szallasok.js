import express from "express";
import db from "../data/db.js";

const app = express.Router();

app.get("/szallasok", async (req, res) => {
    const { varos, minCsillag, maxAr, medence } = req.query;

    let sql = "SELECT szallasok.*, varosok.nev varos, varosok.orszag FROM szallasok JOIN varosok ON szallasok.varos_id = varosok.id";
    let params = [];
    let adatok = [];

    if (varos) {
        params.push("varosok.nev = ?")
        adatok.push(varos)
    }
    if (minCsillag) {
        params.push("szallasok.csillag >= ?")
        adatok.push(minCsillag);
    }
    if (maxAr) {
        params.push("szallasok.ar <= ?")
        adatok.push(maxAr)
    }
    if (medence) {
        params.push("szallasok.medence = ?")
        adatok.push(medence == "true" ? 1 : 0)
    }
    if (params.length > 0) {
        sql += " WHERE " + params.join(" AND ")
    }

    sql += " ORDER BY szallasok.ar ASC";
    const [eredmeny] = await db.query(sql, adatok);

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

app.get("/szallasok/:id", async (req, res) => {
    let id = req.params.id;
    let sql = "SELECT szallasok.*, varosok.nev varos, varosok.orszag FROM szallasok JOIN varosok ON szallasok.varos_id = varosok.id WHERE szallasok.id = ?";
    const eredmeny = await db.query(sql, [id]);
    let szallas = eredmeny[0];

    res.json({
        id: szallas.id,
        nev: szallas.nev,
        varos: szallas.varos,
        orszag: szallas.orszag,
        csillag: szallas.csillag,
        ar: szallas.ar,
        medence: Boolean(szallas.medence),
        ertekeles: Number(szallas.ertekeles)
    });
});

export default app;