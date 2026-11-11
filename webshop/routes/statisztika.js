import express from "express";
import db from "../data/db.js";

const route = express.Router();

route.get("/havi", async (req, res) => {
    let base = "SELECT DATE_FORMAT(rendelesek.datum, '%Y-%m') AS honap, COUNT(DISTINCT rendelesek.id) AS rendelesDb, SUM(tetelek.db * tetelek.egysegar) AS bevetel FROM rendelesek JOIN tetelek ON rendelesek.id = tetelek.rendeles_id GROUP BY honap ORDER BY honap";
    const [eredmeny] = await db.query(base)
    res.json(eredmeny);
})

route.get("/top-termekek/", async (req, res) => {
    const n = Number(req.query.n) || 3;
    let base = "SELECT termekek.nev AS termek, SUM(tetelek.db) AS eladottDb, SUM(tetelek.db * tetelek.egysegar) AS bevetel FROM termekek JOIN tetelek ON termekek.id = tetelek.termek_id GROUP BY termekek.id, termekek.nev ORDER BY eladottDb DESC LIMIT ?";

    let adat = [];

    if(n){
        adat.push(n);
    }

    const [eredmeny] = await db.query(base, adat);
    res.json(eredmeny);
});

route.get("/kategoriak", async (req,res) => {
    let base = "SELECT termekek.kategoria AS kategoria, SUM(tetelek.db) AS eladottDb, SUM(tetelek.db * tetelek.egysegar) AS bevetel FROM termekek JOIN tetelek ON termekek.id = tetelek.termek_id GROUP BY termekek.kategoria ORDER BY bevetel DESC";
    const [eredmeny] = await db.query(base)
    res.json(eredmeny);
})

export default route
