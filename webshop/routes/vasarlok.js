import express from "express";
import db from "../data/db.js";

const route = express.Router();

route.get("/", async (req, res) => {
    let base = "SELECT * FROM vasarlok";
    const [eredmeny] = await db.query(base);
    res.json(eredmeny);
})

route.get("/:id/rendelesek", async (req,res) => {
    const {id} = req.params;
    let base = "SELECT COUNT(rendelesek.vasarlo_id) AS rendelesekDB FROM vasarlok JOIN rendelesek ON vasarlok.id = rendelesek.vasarlo_id WHERE rendelesek.vasarlo_id = ?;";
    const [eredmeny] = await db.query(base, [id]);
    res.json(eredmeny)
})

export default route