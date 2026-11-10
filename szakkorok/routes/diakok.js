import express from "express";
import db from "../data/db.js";

const route = express.Router();

route.get("/", async (req, res) => {
    const {osztaly} = req.query;

    let base = "SELECT diakok.id, diakok.nev, diakok.osztaly, COUNT(jelentkezesek.szakkor_id) AS szakkorDb FROM diakok LEFT JOIN jelentkezesek ON diakok.id = jelentkezesek.diak_id";

    let adat = [];

    if (osztaly) {
        base += " WHERE diakok.osztaly = ?";
        adat.push(osztaly);
    }

    base += " GROUP BY diakok.id ORDER BY diakok.nev";

    const [eredmeny] = await db.query(base, adat);
    res.json(eredmeny);
});

route.get("/szakkornelkul", async (req, res) => {
    let base = "SELECT diakok.id, diakok.nev, diakok.osztaly FROM diakok LEFT JOIN jelentkezesek ON diakok.id = jelentkezesek.diak_id WHERE jelentkezesek.diak_id IS NULL ORDER BY diakok.nev";

    const [eredmeny] = await db.query(base);
    res.json(eredmeny);
});

route.get("/:id", async (req, res) => {
    const { id } = req.params;

    let base = "SELECT diakok.id, diakok.nev, diakok.osztaly, szakkorok.id AS szakkorId, szakkorok.nev AS szakkorNev, szakkorok.tanar, szakkorok.nap FROM diakok LEFT JOIN jelentkezesek ON diakok.id = jelentkezesek.diak_id LEFT JOIN szakkorok ON szakkorok.id = jelentkezesek.szakkor_id WHERE diakok.id = ? ORDER BY szakkorok.nev";

    const [eredmeny] = await db.query(base, [id]);

    let diak = {
        id: eredmeny[0].id,
        nev: eredmeny[0].nev,
        osztaly: eredmeny[0].osztaly,
        szakkorok: []
    };

    eredmeny.forEach(adat => {
        if (adat.szakkorId) {
            diak.szakkorok.push({
                id: adat.szakkorId,
                nev: adat.szakkorNev,
                tanar: adat.tanar,
                nap: adat.nap
            });
        }
    });

    res.json(diak);
});

export default route;