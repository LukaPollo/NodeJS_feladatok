import express from "express";
import db from "../data/db.js";

const route = express.Router();

route.get("/", async (req, res) => {
    let base = "SELECT vasarlok.id, vasarlok.nev, vasarlok.varos, COUNT(rendelesek.id) AS rendelesDb, SUM(tetelek.db * tetelek.egysegar) AS osszKoltes FROM vasarlok JOIN rendelesek ON vasarlok.id = rendelesek.vasarlo_id JOIN tetelek ON rendelesek.id = tetelek.rendeles_id GROUP BY vasarlok.id ORDER BY osszKoltes DESC;";

    const [eredmeny] = await db.query(base);
    res.json(eredmeny);
});

route.get("/:id/rendelesek", async (req, res) => {
    const id = req.params.id
    let base = "SELECT rendelesek.id, rendelesek.datum, rendelesek.statusz, SUM(tetelek.db) AS darab, SUM(tetelek.db * tetelek.egysegar) AS vegosszeg FROM rendelesek JOIN tetelek ON rendelesek.id = tetelek.rendeles_id WHERE rendelesek.vasarlo_id = ? GROUP BY rendelesek.id;";

    const [eredmeny] = await db.query(base, [id]);

    res.json(eredmeny);
});

export default route;
