import express from "express";
import db from "../data/db.js";

const router = express.Router();

router.get("/", async (req,res) => {
    const {faj} = req.query;
    let base = "SELECT allatok.id, allatok.nev, allatok.faj, allatok.szuletes, gazdak.nev AS gazda FROM allatok JOIN gazdak ON allatok.gazda_id = gazdak.id";
    let adat = []
    if(faj){
        base += " WHERE allatok.faj = ?"
        adat.push(faj)
    }
    base += " ORDER BY allatok.nev;"
    const [eredmeny] = await db.query(base, adat);
    res.json(eredmeny);
})

router.get("/kezeles-nelkul", async (req, res) => {
    let base = "SELECT allatok.id, allatok.nev, allatok.faj, gazdak.nev AS gazda FROM allatok JOIN gazdak ON allatok.gazda_id = gazdak.id JOIN kezelesek ON allatok.id = kezelesek.allat_id WHERE kezelesek.id IS NULL ORDER BY allatok.nev;";

    const [eredmeny] = await db.query(base);
    res.json(eredmeny);
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const base = "SELECT * FROM allatok WHERE allatok.id = ?";

    const [eredmeny] = await db.query(base, [id]);

    if (eredmeny.length === 0) {
        return res.status(404).json({ error: "Az állat nem található" });
    }

    res.json(eredmeny[0]); 
});


export default router