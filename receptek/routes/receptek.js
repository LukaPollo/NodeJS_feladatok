import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/", async (req,res) => {
    const {kategoria, maxIdo} = req.query
    try {
        let sql = "SELECT receptek.id, receptek.nev, receptek.kategoria, receptek.adag, receptek.ido, COUNT(recept_hozzavalok.hozzavalo_id) AS hozzavaloDb, ROUND(SUM(recept_hozzavalok.mennyiseg * hozzavalok.egysegar)) AS koltseg FROM receptek LEFT JOIN recept_hozzavalok ON receptek.id = recept_hozzavalok.recept_id LEFT JOIN hozzavalok ON recept_hozzavalok.hozzavalo_id = hozzavalok.id WHERE (receptek.kategoria = ? OR ? IS NULL) AND (receptek.ido <= ? OR ? IS NULL) GROUP BY receptek.id ORDER BY receptek.nev";

        const [eredmeny] = await db.query(sql, [kategoria,kategoria,maxIdo, maxIdo]);
        res.json(eredmeny);
    }
    catch(error) {
        res.status(500).json({ hiba: "szerver error 500" });
    }
});

router.get("/kereses", async (req,res) => {
    const { van } = req.query;
    try {
        if (!van) {
            return res.status(400).json({ hiba: " nincs hozzavalo adva 400" });
        }

        let hozzavalok = req.query.van.split(",");
        let sql = "SELECT receptek.id, receptek.nev, receptek.kategoria FROM receptek JOIN recept_hozzavalok ON receptek.id = recept_hozzavalok.recept_id JOIN hozzavalok ON recept_hozzavalok.hozzavalo_id = hozzavalok.id WHERE hozzavalok.nev IN (?) GROUP BY receptek.id HAVING COUNT(DISTINCT hozzavalok.id) = ?";
        const [eredmeny] = await db.query(sql, [hozzavalok, hozzavalok.length]);
        res.json(eredmeny);
    }
    catch(error) {
        res.status(500).json({ hiba: "szerver error 500" });
    }
});

router.get("/:id", async (req,res) => {
    const id = Number(req.params.id)
    try {
        if (isNaN(id)) {
            return res.status(400).json({ hiba: " szamot kell adni 400" });
        }

        let sql = "SELECT * FROM receptek WHERE id = ?";
        const [eredmeny] = await db.query(sql, [id]);

        if (eredmeny.length == 0) {
            return res.status(404).json({ hiba: " nincs ilyen recept" });
        }

        let recept = eredmeny[0];
        let adag = req.query.adag ? Number(req.query.adag) : recept.adag;

        if (isNaN(adag) || adag <= 0) {
            return res.status(400).json({ hiba: " nincs ilyen mennyisegu adag " });
        }


        let szorzo = adag / recept.adag; // 1.5

        let sql2 = "SELECT hozzavalok.id, hozzavalok.nev, recept_hozzavalok.mennyiseg * ? AS mennyiseg, hozzavalok.mertekegyseg, ROUND(recept_hozzavalok.mennyiseg * ? * hozzavalok.egysegar) AS koltseg FROM recept_hozzavalok JOIN hozzavalok ON recept_hozzavalok.hozzavalo_id = hozzavalok.id WHERE recept_hozzavalok.recept_id = ? ORDER BY hozzavalok.nev";
        let sql3 = "SELECT ROUND(SUM(recept_hozzavalok.mennyiseg * ? * hozzavalok.egysegar)) AS koltseg FROM recept_hozzavalok JOIN hozzavalok ON recept_hozzavalok.hozzavalo_id = hozzavalok.id WHERE recept_hozzavalok.recept_id = ?";

        const [hozzavalok] = await db.query(sql2, [szorzo, szorzo, id]);
        const [osszeg] = await db.query(sql3, [szorzo, id]);

        recept.adag = adag;
        recept.hozzavalok = hozzavalok;
        recept.koltseg = Number(osszeg[0].koltseg);
        recept.adagonkent = Math.round(recept.koltseg / adag);

        res.json(recept);

    }
    catch(error) {
        res.status(500).json({ hiba: "szerver error 500" });
    }
});


router.post("/:id/hozzavalok", async (req,res) => {
    try {
        const id = Number(req.params.id);
        const hozzavaloId = Number(req.body.hozzavaloId);
        const mennyiseg = Number(req.body.mennyiseg);

        if (isNaN(id) || isNaN(hozzavaloId) || isNaN(mennyiseg) || mennyiseg <= 0) {
            return res.status(400).json({ hiba: "szamokat kell irni pls" });
        }

        // 404
        let sql = "SELECT * FROM receptek WHERE id = ?";
        let [eredmeny] = await db.query(sql, [id]);

        if (eredmeny.length === 0) {
            return res.status(404).json({ hiba: "nem letezik ilyen recept" });
        }

        sql = "SELECT * FROM hozzavalok WHERE id = ?";
        let [eredmeny2] = await db.query(sql, [hozzavaloId]);

        if (eredmeny2.length === 0) {
            return res.status(404).json({ hiba: "nem letezik ilyen hozzavalo" });
        }

        sql = "INSERT INTO recept_hozzavalok (recept_id, hozzavalo_id, mennyiseg) VALUES (?, ?, ?)";
        await db.query(sql, [id, hozzavaloId, mennyiseg]);
        // 404
        
        res.status(201).json({ uzenet: " ez az, sikerult" });
    }
    catch(error) {
        console.log(error);

        if (error.code == "ER_DUP_ENTRY") {
            return res.status(409).json({ hiba: " mar van ilyen" });
        }

        res.status(500).json({ hiba: error.message });
    }
});


router.delete("/:id/hozzavalok/:hozzavaloId", async (req,res) => {
    try {
        const id = Number(req.params.id);
        const hozzavaloId = Number(req.params.hozzavaloId);

        if (isNaN(id) || isNaN(hozzavaloId)) {
            return res.status(400).json({ hiba: " szamokat kell irni pls " });
        }

        let sql = "DELETE FROM recept_hozzavalok WHERE recept_id = ? AND hozzavalo_id = ?";
        const [eredmeny] = await db.query(sql, [id, hozzavaloId]);

        if (eredmeny.affectedRows == 0) {
            return res.status(404).json({ hiba: " nincsenek ilyen hozzavalok a receptben" });
        }

        res.status(204).send();
    }
    catch(error) {
        console.log(error);
        res.status(500).json({ hiba: error.message });
    }
});


export default router;
