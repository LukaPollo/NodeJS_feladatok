import express from "express";
import db from "../data/db.js";

const app = express.Router();

app.get("/ajanlat", async (req, res) => {
    const { varos, ej, fo } = req.query;

    let sql = "SELECT szallasok.* FROM szallasok JOIN varosok ON szallasok.varos_id = varosok.id WHERE varosok.nev = ? ORDER BY szallasok.ar ASC";
    const eredmeny = await db.query(sql, [varos])

    let ajanlatok = []

    for (let szallas of eredmeny) {
        ajanlatok.push({
            szallas: szallas.nev,
            csillag: szallas.csillag,
            arFoEj: szallas.ar,
            osszesen: szallas.ar * ej * fo
        });
    }

    res.json({
        varos: varos,
        ej: Number(ej),
        fo: Number(fo),
        ajanlatok: ajanlatok
    })
})

export default app;