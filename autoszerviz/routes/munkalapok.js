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
    try{
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
        }
        catch(error){
            console.error(error);
            res.status(500).json({hiba: "Szerver hiba"});
        }
    
});

router.patch("/:id/statusz", async (req, res) => {
    const id = req.params.id;
    const {statusz} = req.body;

    if (isNaN(id)) {
        return res.status(400).json({hiba: " szamnak kene lennia az idnak 400"});
    }

    const statuszok = ["felvéve", "javítás alatt", "kész", "átadva"];

    if (!statuszok.includes(statusz)) {
        return res.status(400).json({hiba: " rossz statusz 400 "});
    }

    try {
        let sql = "SELECT * FROM munkalapok WHERE id = ?";
        const [munkalap] = await db.query(sql, [id]);

        if (munkalap.length === 0) {
            return res.status(404).json({hiba: " nincs ilyen munkalap 404"});
        }

        let sql2 = "UPDATE munkalapok SET statusz = ? WHERE id = ?";
        await db.query(sql2, [statusz, id]);

        let sql3 = "SELECT * FROM munkalapok WHERE id = ?";
        const [eredmeny] = await db.query(sql3, [id]);

        res.json(eredmeny[0]);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({hiba: " szerver hiba 500"});
    }
});

router.post("/:id/alkatreszek", async (req, res) => {
    const id = req.params.id;
    const {alkatreszId, db: darab} = req.body;

    let hibak = [];

    if (isNaN(id) || id <= 0) {
        hibak.push(" hibas munkalap id ");
    }

    if (isNaN(alkatreszId) || alkatreszId <= 0) {
        hibak.push(" hibas alkatresz id");
    }

    if (isNaN(darab) || darab <= 0) {
        hibak.push(" db pozitivnak kene lennie es szamnak ");
    }

    if (hibak.length > 0) {
        return res.status(400).json({hibak});
    }

    let kapcsolat;

    try {
        kapcsolat = await db.getConnection();
        await kapcsolat.beginTransaction();

        let sql = "SELECT * FROM munkalapok WHERE id = ?";
        const [munkalap] = await kapcsolat.query(sql, [id]);

        if (munkalap.length === 0) {
            await kapcsolat.rollback(); // minden valtozast vissavonja
            return res.status(404).json({hiba: " nincs ilyen munkalap 404"});
        }

        let sql2 = "SELECT * FROM alkatreszek WHERE id = ?";
        const [alkatresz] = await kapcsolat.query(sql2, [alkatreszId]);

        if (alkatresz.length === 0) {
            await kapcsolat.rollback();
            return res.status(404).json({hiba: " nincs ilyen alkatresz"});
        }

        if (alkatresz[0].keszlet < darab) {
            await kapcsolat.rollback();
            return res.status(409).json({hiba: "nincs elegendo keszlet"});
        }

        let sql3 = "SELECT * FROM felhasznalasok WHERE munkalap_id = ? AND alkatresz_id = ?";
        const [vanMar] = await kapcsolat.query(sql3, [id, alkatreszId]);

        if (vanMar.length > 0) {
            await kapcsolat.rollback();
            return res.status(409).json({hiba: " ez az alkatresz mar van a munkalapon 409 "});
        }

        let sql4 = "INSERT INTO felhasznalasok (munkalap_id, alkatresz_id, db) VALUES (?, ?, ?)";
        await kapcsolat.query(sql4, [id, alkatreszId, darab]);

        let sql5 = "UPDATE alkatreszek SET keszlet = keszlet - ? WHERE id = ?";
        await kapcsolat.query(sql5, [darab, alkatreszId]);

        await kapcsolat.commit(); // felrakja a valtozasokat

        let sql6 = "SELECT munkalapok.id, munkalapok.rendszam, munkalapok.felvetel, munkalapok.leiras, munkalapok.statusz, munkalapok.munkaora, (munkalapok.munkaora * 12000) AS munkadij, ugyfelek.id AS ugyfel_id, ugyfelek.nev AS ugyfel_nev, ugyfelek.telefon AS ugyfel_telefon FROM munkalapok JOIN ugyfelek ON ugyfelek.id = munkalapok.ugyfel_id WHERE munkalapok.id = ?";
        const [munkalapAdat] = await db.query(sql6, [id]);

        let sql7 = "SELECT alkatreszek.id, alkatreszek.nev, felhasznalasok.db, alkatreszek.ar, (felhasznalasok.db * alkatreszek.ar) AS osszeg FROM felhasznalasok JOIN alkatreszek ON alkatreszek.id = felhasznalasok.alkatresz_id WHERE felhasznalasok.munkalap_id = ? ORDER BY alkatreszek.nev ASC";
        const [alkatreszek] = await db.query(sql7, [id]);

        const munkalap2 = munkalapAdat[0];

        let alkatreszDij = 0;

        for (let i = 0; i < alkatreszek.length; i++) {
            alkatreszDij += Number(alkatreszek[i].osszeg);
        }

        res.status(201).json({
            id: munkalap2.id,
            rendszam: munkalap2.rendszam,
            felvetel: munkalap2.felvetel,
            leiras: munkalap2.leiras,
            statusz: munkalap2.statusz,
            ugyfel: {
                id: munkalap2.ugyfel_id,
                nev: munkalap2.ugyfel_nev,
                telefon: munkalap2.ugyfel_telefon
            },
            munkaora: Number(munkalap2.munkaora),
            alkatreszek: alkatreszek,
            munkadij: Number(munkalap2.munkadij),
            alkatreszDij: alkatreszDij,
            vegosszeg: Number(munkalap2.munkadij) + alkatreszDij
        });
    }
    catch (error) {
        if (kapcsolat) {
            await kapcsolat.rollback(); // visszavonja a valtozasokat ha valami tortent a szerverel 
        }

        console.log(error);
        res.status(500).json({hiba: "szerver hiba 500"});
    }
    finally {
        if (kapcsolat) {
            kapcsolat.release(); // vissza engedi a kapcsolatot a poolba hogy ujra feltudjuk hasznalni 
        }
    }
});


export default router