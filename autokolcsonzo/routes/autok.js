import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const {kategoria} = req.query;
    try{
        let base = "SELECT autok.id, autok.rendszam, autok.marka, autok.modell, autok.kategoria, autok.napidij, COUNT(berlesek.id) AS berlesDb FROM autok LEFT JOIN berlesek ON berlesek.auto_id = autok.id";
        let params = [];
        if(kategoria){
            base += " WHERE autok.kategoria = ?"; 
            params.push(kategoria);
        }
        if(!kategoria){
            base += " GROUP BY autok.id, autok.rendszam, autok.marka, autok.modell, autok.kategoria, autok.napidij ORDER BY autok.rendszam ASC";
            const [eredmeny] = await db.query(base);
            return res.json(eredmeny);
        }
        base += " GROUP BY autok.id, autok.rendszam, autok.marka, autok.modell, autok.kategoria, autok.napidij ORDER BY autok.rendszam ASC";
        const [eredmeny] = await db.query(base, params);
        if(eredmeny.length === 0){
            res.status(400).json({hiba: "Nem letezik ilyen kategoria 400 "});
        }
        res.send(eredmeny.map(a => a.modell).join(", "));
    }
    catch(error){
        res.status(500).json({ hiba: " szerver error 500 " });
    }
});

router.get("/szabad", async (req,res) => {
    const {tol, ig} = req.query;
    try{
        let base = "SELECT * FROM autok WHERE NOT EXISTS (SELECT 1 FROM berlesek WHERE berlesek.auto_id = autok.id AND berlesek.kezdet <= ? AND berlesek.veg >= ?) ORDER BY autok.napidij ASC";
        const [eredmeny] = await db.query(base, [ig, tol]);
        res.send(`az idoszakban szabad autok napidij szerint: ${eredmeny.map(a => a.modell).join(", ")}`);
    }
    catch(error){
        res.status(500).json({ hiba: " szerver error 500 " });
    }
});

router.get("/:id", async (req,res) =>{
    const id = Number(req.params.id);
    if(isNaN(id)){
        return res.status(400).json({hiba: "szamot kene megadni idkent 400"})
    }
    try{
        let sql = "SELECT * FROM autok WHERE id = ?";
        const [eredmeny] = await db.query(sql, [id]);
        if(eredmeny.length === 0){
            return res.status(404).json({hiba: " ninncs ilyen auto 404"});
        }
        let sql2 = "SELECT berlesek.id, ugyfelek.nev AS ugyfel, berlesek.kezdet, berlesek.veg, DATEDIFF(berlesek.veg, berlesek.kezdet) + 1 AS napok, (DATEDIFF(berlesek.veg, berlesek.kezdet) + 1) * autok.napidij AS dij FROM berlesek JOIN ugyfelek ON berlesek.ugyfel_id = ugyfelek.id JOIN autok ON berlesek.auto_id = autok.id WHERE berlesek.auto_id = ? ORDER BY berlesek.kezdet ASC";
        const [berlesek] = await db.query(sql2, [id]);
        
        let osszBevetel = 0;

        for (let i = 0; i < berlesek.length; i++) {
            osszBevetel += Number(berlesek[i].dij);
        }

        res.json({
        id: eredmeny[0].id,
        rendszam: eredmeny[0].rendszam,
        marka: eredmeny[0].marka,
        modell: eredmeny[0].modell,
        kategoria: eredmeny[0].kategoria,
        napidij: Number(eredmeny[0].napidij),
        berlesek: berlesek,
        osszBevetel: osszBevetel
        });
    }
    catch(error){
        res.status(500).json({ hiba: " szerver error 500 " });
    }

})

export default router;
