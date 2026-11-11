import express from "express";
import db from "../data/db.js"
const route = express.Router();

route.get("/", async (req, res) => {
    const { statusz, tol, ig } = req.query;

    let base = "SELECT rendelesek.id, rendelesek.datum, rendelesek.statusz, vasarlok.nev AS vasarlo, SUM(tetelek.db) AS darab, SUM(tetelek.db * tetelek.egysegar) AS vegosszeg FROM rendelesek JOIN vasarlok ON rendelesek.vasarlo_id = vasarlok.id JOIN tetelek ON rendelesek.id = tetelek.rendeles_id";

    let adat = [];

    if (req.query.statusz) {
        base += " WHERE rendelesek.statusz = ?";
        adat.push(req.query.statusz);
    }

    if (req.query.tol) {
        base += adat.length ? " AND rendelesek.datum >= ?" : " WHERE rendelesek.datum >= ?";
        adat.push(req.query.tol);
    }

    if (req.query.ig) {
        base += adat.length ? " AND rendelesek.datum <= ?" : " WHERE rendelesek.datum <= ?";
        adat.push(req.query.ig);
    }

    base += " GROUP BY rendelesek.id ORDER BY rendelesek.datum";

    const [eredmeny] = await db.query(base, adat);
    res.json(eredmeny);
});

route.get("/:id", async (req, res) => {
    const { id } = req.params;

    const base = "SELECT rendelesek.id, rendelesek.datum, rendelesek.statusz, vasarlok.id, vasarlok.nev, vasarlok.email, vasarlok.varos, termekek.nev, tetelek.db, tetelek.egysegar, tetelek.db * tetelek.egysegar AS osszeg FROM rendelesek JOIN vasarlok ON rendelesek.vasarlo_id = vasarlok.id JOIN tetelek ON rendelesek.id = tetelek.rendeles_id JOIN termekek ON tetelek.termek_id = termekek.id WHERE rendelesek.id = ?;";
    const [eredmeny] = await db.query(base, [id]);

    res.json(eredmeny);
});

export default route;
