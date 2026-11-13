import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/fogyo", async (req, res) => {
    const {min } = req.query

    let minimum = 3;
    if (min !== undefined) {
        minimum = Number(min);
        if (isNaN(minimum)) {
            return res.status(400).json({ error: " szamnak kell lennie" });
        }
    }

    let sql = "SELECT * FROM alkatreszek WHERE keszlet < ? ORDER BY keszlet ASC";
    const [eredmeny] = await db.query(sql, [minimum]);
    res.json(eredmeny);
});


export default router;