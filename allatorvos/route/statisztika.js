import express from "express";
import db from "../data/db.js";

const router = express.Router();

router.get("/fajok", async (req,res) => {
    let base = "";
    const [eredmeny] = await db.query(base)
    res.json(eredmeny);
})
router.get("/havi", async (req,res) => {
    let base = "";
    const [eredmeny] = await db.query(base)
    res.json(eredmeny);
})
router.get("/gazdak", async (req,res) => {
    let base = "";
    const [eredmeny] = await db.query(base)
    res.json(eredmeny);
})

export default router;