import express from "express";
import db from "../data/db.js";

const route = express.Router();

route.post("/", async (req, res) => {
    const { diakId, szakkorId } = req.body;

    let base = "SELECT * FROM diakok WHERE id = ?";
    const [diak] = await db.query(base, [diakId]);


    if (diak.length === 0) {
        return res.status(404).json({ hiba: "Nincs ilyen diák" });
    }

    base = "SELECT * FROM szakkorok WHERE id = ?";
    const [szakkor] = await db.query(base, [szakkorId]);

    if (szakkor.length === 0) {
        return res.status(404).json({ hiba: "Nincs ilyen szakkör" });
    }

    base = "SELECT * FROM jelentkezesek WHERE diak_id = ? AND szakkor_id = ?";
    const [jelentkezes] = await db.query(base, [diakId, szakkorId]);

    // mar jelentkezett
    if (jelentkezes.length > 0) {
        return res.status(409).json({ hiba: "A diák már jelentkezett" });
    }

    base = "SELECT COUNT(*) AS jelentkezett FROM jelentkezesek WHERE szakkor_id = ?";
    const [letszam] = await db.query(base, [szakkorId]);

    // betelt
    if (letszam[0].jelentkezett >= szakkor[0].max_letszam) {
        return res.status(409).json({ hiba: "A szakkör betelt" });
    }

    base = "SELECT szakkorok.nev FROM jelentkezesek JOIN szakkorok ON jelentkezesek.szakkor_id = szakkorok.id WHERE jelentkezesek.diak_id = ? AND szakkorok.nap = ?";
    const [utkozes] = await db.query(base, [diakId, szakkor[0].nap]);


    // mar van vkinek szakkore az napon
    if (utkozes.length > 0) {
        return res.status(409).json({
            hiba: `${diak[0].nev} már rendelkezik szakkörrel ezen a napon: ${utkozes[0].nev}`
        });
    }

    base = "INSERT INTO jelentkezesek (diak_id, szakkor_id, datum) VALUES (?, ?, CURDATE())";
    await db.query(base, [diakId, szakkorId]);

    base = "SELECT diakok.id AS diakId, szakkorok.id AS szakkorId, jelentkezesek.datum, diakok.nev AS diak, szakkorok.nev AS szakkor, szakkorok.nap FROM jelentkezesek JOIN diakok ON diakok.id = jelentkezesek.diak_id JOIN szakkorok ON szakkorok.id = jelentkezesek.szakkor_id WHERE diakok.id = ? AND szakkorok.id = ?";
    const [eredmeny] = await db.query(base, [diakId, szakkorId]);

    res.status(201).json(eredmeny[0]);
});

route.delete("/:diakId/:szakkorId", async (req, res) => {
    const { diakId, szakkorId } = req.params;

    let base = "DELETE FROM jelentkezesek WHERE diak_id = ? AND szakkor_id = ?";
    const [eredmeny] = await db.query(base, [diakId, szakkorId]);

    if (eredmeny.affectedRows === 0) {
        return res.status(404).json({ hiba: "Nincs ilyen jelentkezés" });
    }

    res.status(204).send();
});

export default route;
