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

router.post("/", async (req,res) => {
    
})

export default router