import express from "express";
import db from "../data/db.js"
const route = express.Router();


route.get("/", async (req, res) => {
    const { statusz, tol, ig } = req.query;

    let base = "SELECT rendelesek.id, rendelesek.datum, rendelesek.statusz, vasarlok.nev FROM rendelesek JOIN vasarlok ON rendelesek.vasarlo_id = vasarlok.id";

    let adat = [];
    let params = [];

    if (statusz) {
        params.push("rendelesek.statusz = ?");
        adat.push(statusz);
    }

    if (tol) {
        params.push("rendelesek.datum >= ?");
        adat.push(tol);
    }

    if (ig) {
        params.push("rendelesek.datum <= ?");
        adat.push(ig);
    }

    if (params.length > 0) {
        base += " WHERE " + params.join(" AND ");
    }

    const [eredmeny] = await db.query(base, adat);
    res.json(eredmeny);
});



route.get("/:id", async (req, res) => {
    const { id } = req.params;

    const base = "SELECT * FROM rendelesek WHERE id = ?";
    const [eredmeny] = await db.query(base, [id]);

    res.json(eredmeny);
});


export default route;