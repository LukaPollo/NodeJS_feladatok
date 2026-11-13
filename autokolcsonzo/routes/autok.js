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
    if(!tol || !ig || isNaN(Date.parse(tol)) || isNaN(Date.parse(ig)) || new Date(tol).toISOString().slice(0,10) !== tol || new Date(ig).toISOString().slice(0,10) !== ig || ig < tol){
        return res.status(400).json({hiba: "hianyzo vagy hibas datum"});
    }
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
        let sql = "SELECT * from autok WHERE id = ?"; // Ill write it another time
        const[eredmeny] = await db.query(sql, [id]);
        if(eredmeny.length === 0){
            return res.status(404).json({hiba: "Nincs ilyen auto 404"});
        }
        res.json(eredmeny);
    }
    catch(error){
        res.status(500).json({ hiba: " szerver error 500 " });
    }

})

export default router;
