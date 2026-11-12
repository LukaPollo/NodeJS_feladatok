import express from "express";
import db from "../data/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const { tol, ig, faj } = req.query;

    let base = "SELECT kezelesek.id, kezelesek.datum, allatok.nev AS allat, allatok.faj, gazdak.nev AS gazda, kezelesek.leiras, kezelesek.dij FROM kezelesek JOIN allatok ON kezelesek.allat_id = allatok.id JOIN gazdak ON allatok.gazda_id = gazdak.id";

    let adat = [];
    let params = [];

    if (tol) {
        adat.push("kezelesek.datum >= ?");
        params.push(tol);
    }

    if (ig) {
        adat.push("kezelesek.datum <= ?");
        params.push(ig);
    }

    if (faj) {
        adat.push("allatok.faj = ?");
        params.push(faj);
    }

    base += " WHERE " + adat.join(" AND ");
    base += " ORDER BY kezelesek.datum";

    const [eredmeny] = await db.query(base, params);
    res.json(eredmeny);
});

router.post("/", async (req, res) => {
    const { allatId, leiras, dij, datum } = req.body;

    let kezelesDatum = datum;

    if (!datum) {
        let ma = new Date();
        kezelesDatum = ma.getFullYear() + "-" + String(ma.getMonth() + 1).padStart(2, "0") + "-" + String(ma.getDate()).padStart(2, "0");
    }

    try {
        let sql = "SELECT * FROM allatok WHERE id = ?";
        const [allat] = await db.query(sql, [allatId]);

        if (allat.length === 0) {
            return res.status(404).json({ hiba: "Az allat nem talalhato!" });
        }

        let sql2 = "INSERT INTO kezelesek (allat_id, datum, leiras, dij) VALUES (?, ?, ?, ?)";
        const [eredmeny] = await db.query(sql2, [allatId, kezelesDatum, leiras.trim(), dij]);

        let sql3 = "SELECT kezelesek.id, DATE_FORMAT(kezelesek.datum, '%Y-%m-%d') AS datum, allatok.nev AS allat, allatok.faj, gazdak.nev AS gazda, kezelesek.leiras, kezelesek.dij FROM kezelesek JOIN allatok ON kezelesek.allat_id = allatok.id JOIN gazdak ON allatok.gazda_id = gazdak.id WHERE kezelesek.id = ?";
        const [ujKezeles] = await db.query(sql3, [eredmeny.insertId]);

        res.status(201).json(ujKezeles[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ hiba: "Hiba tortent a kezeles rogzitesekor." });
    }
});
export default router