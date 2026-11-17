import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const {autoId, ugyfelId, kezdet, veg} = req.body || {};

    let hibak = [];

    if (isNaN(autoId) || autoId <= 0) 
    {
        hibak.push("hibas autoId");
    }

    if (isNaN(ugyfelId) || ugyfelId <= 0) 
    {
        hibak.push("hibas vagy hianyzo ugyfelId");
    }

    if (typeof kezdet !== "string") 
    {
        hibak.push("hibas kezdet datum");
    } 
    else 
    {
        const datum = new Date(kezdet + "T00:00:00Z");

        if (isNaN(datum.getTime()) || datum.toISOString().slice(0, 10) !== kezdet) 
        {
            hibak.push("hibas kezdet datum");
        }
    }

    if (typeof veg !== "string") {
        hibak.push("Hibas veg datum");
    } 
    else 
    {
        const datum = new Date(veg + "T00:00:00Z");

        if (isNaN(datum.getTime()) || datum.toISOString().slice(0, 10) !== veg) 
        {
            hibak.push(" hibas veg datum");
        }
    }

    if (typeof kezdet === "string" && typeof veg === "string" && veg < kezdet) 
    {
        hibak.push("A veg datum nem lehet a kezdet elott");
    }

    if (hibak.length > 0) 
    {
        return res.status(400).json({hibak});
    }

    try {
        let sql = "SELECT * FROM autok WHERE id = ?";
        const [auto] = await db.query(sql, [autoId]);

        let sql2 = "SELECT * FROM ugyfelek WHERE id = ?";
        const [ugyfel] = await db.query(sql2, [ugyfelId]);

        if (auto.length === 0 || ugyfel.length === 0) {
            return res.status(404).json({hiba: "Nincs ilyen auto vagy ugyfel"});
        }

        let sql3 = "SELECT * FROM berlesek WHERE auto_id = ? AND kezdet <= ? AND veg >= ?";
        const [vanMar] = await db.query(sql3, [autoId, veg, kezdet]);

        if (vanMar.length > 0) {
            return res.status(409).json({
                hiba: auto[0].rendszam + " mar ki van adva " + vanMar[0].kezdet + " es " + vanMar[0].veg + " kozott"
            });
        }

        if (ugyfel[0].jogositvany_ervenyes < veg) {
            return res.status(409).json({
                hiba: ugyfel[0].nev + " jogositvanya " + ugyfel[0].jogositvany_ervenyes + " en lejar"
            });
        }

        let sql4 = "INSERT INTO berlesek (auto_id, ugyfel_id, kezdet, veg) VALUES (?, ?, ?, ?)";
        const [ujBerles] = await db.query(sql4, [autoId, ugyfelId, kezdet, veg]);

        let sql5 = "SELECT berlesek.id, autok.rendszam, ugyfelek.nev AS ugyfel, berlesek.kezdet, berlesek.veg, DATEDIFF(berlesek.veg, berlesek.kezdet) + 1 AS napok, (DATEDIFF(berlesek.veg, berlesek.kezdet) + 1) * autok.napidij AS dij FROM berlesek JOIN autok ON berlesek.auto_id = autok.id JOIN ugyfelek ON berlesek.ugyfel_id = ugyfelek.id WHERE berlesek.id = ?";
        const [eredmeny] = await db.query(sql5, [ujBerles.insertId]);

        res.status(201).json({
            id: eredmeny[0].id,
            rendszam: eredmeny[0].rendszam,
            ugyfel: eredmeny[0].ugyfel,
            kezdet: eredmeny[0].kezdet,
            veg: eredmeny[0].veg,
            napok: Number(eredmeny[0].napok),
            dij: Number(eredmeny[0].dij)
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({hiba: "Szerver hiba"});
    }
});

export default router