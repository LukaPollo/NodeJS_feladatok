import express from "express";
import db from "../data/db.js";

const route = express.Router();

route.get("/sosem-rendelt", async (req,res) => {
    let base = "SELECT termekek.id, termekek.nev, termekek.kategoria, termekek.ar FROM termekek LEFT JOIN tetelek ON termekek.id = tetelek.termek_id WHERE tetelek.termek_id IS NULL";
    const [eredmeny] = await db.query(base);
    res.json(eredmeny);
});

export default route