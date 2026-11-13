import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/", async (req,res) => {
    const {statusz, rendszam} = req.query;
    let base = "SELECT munkalapok.id, munkalapok.rendszam, ugyfelek.nev AS ugyfel, munkalapok.felvetel, munkalapok.leiras, munkalapok.statusz, munkalapok.munkaora, (munkalapok.munkaora * 12000) AS munkadij, SUM(felhasznalasok.db * alkatreszek.ar) AS alkatreszDij, ((munkalapok.munkaora * 12000) + SUM(felhasznalasok.db * alkatreszek.ar)) AS vegosszeg FROM `munkalapok` JOIN ugyfelek ON ugyfelek.id = munkalapok.ugyfel_id LEFT JOIN felhasznalasok ON felhasznalasok.munkalap_id = munkalapok.id LEFT JOIN alkatreszek ON alkatreszek.id = felhasznalasok.alkatresz_id"
    let adat=[]
    let params=[]
    if(statusz){
        let sql = " munkalapok.statusz = ?"
        adat.push(statusz)
        params.push(sql)
    }
    if(rendszam){
        let sql = " munkalapok.rendszam = ?";
        adat.push(rendszam);
        params.push(sql);
    }
    if(!statusz && !rendszam){
        let sql = base + " GROUP BY munkalapok.id, munkalapok.rendszam, ugyfelek.nev, munkalapok.felvetel, munkalapok.leiras, munkalapok.statusz, munkalapok.munkaora ORDER BY munkalapok.felvetel ASC;"
        const [eredmeny] = await db.query(sql);
        return res.json(eredmeny);
    }
    base += " WHERE " + params.join(" AND ");
    base += " GROUP BY munkalapok.id, munkalapok.rendszam, ugyfelek.nev, munkalapok.felvetel, munkalapok.leiras, munkalapok.statusz, munkalapok.munkaora ORDER BY munkalapok.felvetel ASC;"

    const [eredmeny] = await db.query(base, adat);
    res.json(eredmeny);
})

router.get("/:id", async (req, res) => {
    const id = req.params.id;

    let sql = "SELECT munkalapok.id, munkalapok.rendszam, munkalapok.felvetel, munkalapok.leiras, munkalapok.statusz, munkalapok.munkaora, (munkalapok.munkaora * 12000) AS munkadij, ugyfelek.id AS ugyfel_id, ugyfelek.nev AS ugyfel_nev, ugyfelek.telefon AS ugyfel_telefon FROM munkalapok JOIN ugyfelek ON ugyfelek.id = munkalapok.ugyfel_id WHERE munkalapok.id = ?";
    const [munkalapok] = await db.query(sql, [id]);

    if (munkalapok.length === 0) {
        return res.status(404).json({ hiba: " munkalap nincs" });
    }

    let alkatreszSql = "SELECT alkatreszek.id, alkatreszek.nev, felhasznalasok.db, alkatreszek.ar, (felhasznalasok.db * alkatreszek.ar) AS osszeg FROM felhasznalasok JOIN alkatreszek ON alkatreszek.id = felhasznalasok.alkatresz_id WHERE felhasznalasok.munkalap_id = ? ORDER BY alkatreszek.nev ASC";
    const [alkatreszek] = await db.query(alkatreszSql, [id]);

    const munkalap = munkalapok[0];
    let alkatreszDij = 0;
    for (let i = 0; i < alkatreszek.length; i++) {
        alkatreszDij += Number(alkatreszek[i].osszeg);
    }

    res.json({
        id: munkalap.id,
        rendszam: munkalap.rendszam,
        felvetel: munkalap.felvetel,
        leiras: munkalap.leiras,
        statusz: munkalap.statusz,
        ugyfel: {
            id: munkalap.ugyfel_id,
            nev: munkalap.ugyfel_nev,
            telefon: munkalap.ugyfel_telefon
        },
        munkaora: Number(munkalap.munkaora),
        alkatreszek: alkatreszek,
        munkadij: Number(munkalap.munkadij),
        alkatreszDij: alkatreszDij,
        vegosszeg: Number(munkalap.munkadij) + alkatreszDij
    });
});



export default router