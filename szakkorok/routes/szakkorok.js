
import express from "express";
import db from "../data/db.js";

const route = express.Router();

route.get("/", async (req, res) => {
    const { nap, vanHely } = req.query;

    let base = "SELECT szakkorok.id, szakkorok.nev, szakkorok.tanar, szakkorok.nap, szakkorok.max_letszam AS maxLetszam, COUNT(jelentkezesek.diak_id) AS jelentkezett, szakkorok.max_letszam - COUNT(jelentkezesek.diak_id) AS szabadHely FROM szakkorok LEFT JOIN jelentkezesek ON szakkorok.id = jelentkezesek.szakkor_id";

    let params = [];
    let adat = [];

    if (nap) {
        params.push("szakkorok.nap = ?");
        adat.push(nap);
    }

    if (params.length > 0) {
        base += " WHERE " + params.join(" AND ");
    }

    base += " GROUP BY szakkorok.id";

    if (vanHely === "true") {
        base += " HAVING szabadHely > 0";
    }

    base += " ORDER BY FIELD(szakkorok.nap,'hétfő','kedd','szerda','csütörtök','péntek'), szakkorok.nev";

    const [eredmeny] = await db.query(base, adat);
    res.json(eredmeny);
});

route.get("/:id", async (req, res) => {
    const { id } = req.params;

    let base = "SELECT szakkorok.id, szakkorok.nev, szakkorok.tanar, szakkorok.nap, szakkorok.max_letszam, diakok.id, diakok.nev, diakok.osztaly, jelentkezesek.datum FROM szakkorok JOIN jelentkezesek ON szakkorok.id = jelentkezesek.szakkor_id JOIN diakok ON diakok.id = jelentkezesek.diak_id WHERE szakkorok.id = ? ORDER BY diakok.nev";

    const [eredmeny] = await db.query(base, [id]);

    if (eredmeny.length === 0) {
        return res.status(404).json({ hiba: "404" });
    }

    let szakkor = {
        id: eredmeny[0].id,
        nev: eredmeny[0].nev,
        tanar: eredmeny[0].tanar,
        nap: eredmeny[0].nap,
        maxLetszam: eredmeny[0].maxLetszam,
        diakok: []
    };

    eredmeny.forEach(adat => {
        if (adat.diakId) {
            szakkor.diakok.push({
                id: adat.diakId,
                nev: adat.diakNev,
                osztaly: adat.osztaly,
                jelentkezett: adat.datum
            });
        }
    });

    res.json(szakkor);
});

export default route;
