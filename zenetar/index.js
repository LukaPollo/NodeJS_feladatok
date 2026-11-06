import express from "express"; 
import db from "./data/db.js";
const app = express();

app.get("/eloadok", async (req, res) => {
    const orszag = req.query
    let sql = "SELECT eloadok.nev FROM eloadok ORDER BY nev ASC";
    if (orszag.orszag) 
    {
        sql = "SELECT eloadok.nev FROM eloadok WHERE orszag = ?";
        let [eredmeny] = await db.query(sql, [orszag.orszag]);
        res.json(eredmeny);
    }
let [eredmeny] = await db.query(sql);

    res.json(eredmeny);
});

app.get("/eloadok/:id", async (req, res) => {
    const id = req.params.id;
    let sql = "SELECT * FROM eloadok WHERE id = ?";
    let [eredmeny] = await db.query(sql, [id]);
    res.json(eredmeny);
});

//            SQL ERROR JAVITANDO
app.get("/albumok", async (req, res) => {
    let params = []; // sql WHERE filter array
    let adat = [];   // inputted filter array
    let base = "SELECT * FROM albumok";
    // szűkítő feltételek vizsgálata és az ennek megfelelő sql utasítás elkészítése
    const {mufaj, tol, ig} = req.query;
    if (mufaj || tol || ig) {
        // vannak szűkitő feltétele
        if (mufaj) {
            let mufajsql = "mufaj = ?";
            params.push(mufajsql); // sql where push
            adat.push(mufaj);      // inputted filter push
        }
        if (tol) {
            let datumsql = "ev >= ?";
            params.push(datumsql);
            adat.push(tol);
        }
        if (ig) {
            let datumsql = "ev <= ?";
            params.push(datumsql);
            adat.push(ig);
        }
        base += base + " WHERE " + params.join(" AND ") 
        let [eredmeny] = await db.query(base, adat) // base = sql, adat = input
        res.json(eredmeny);
    } 
    else {
        let sql = "SELECT * FROM albumok";
        let eredmeny = await db.query(sql);
        res.json(eredmeny);
    }
});


app.get("/albumok/kereses", async (req, res) => {
    const q = req.query.q;
    let sql = "SELECT * FROM albumok JOIN eloadok ON albumok.eloado_id = eloadok.id WHERE albumok.cim LIKE ? OR eloadok.nev LIKE ?";
    let [eredmeny] = await db.query(sql, [`%${q}%`, `%${q}%`]);
    if(q.length <2){
        res.status(400).json({error: "2 karakter minimum"});
        return;
    }
    res.json(eredmeny);
});

app.get("/mufajok", async (req, res) => {
    let sql = "SELECT DISTINCT mufaj FROM albumok";
    let [eredmeny] = await db.query(sql);
    res.json(eredmeny);
});

app.get("/statisztika/eloadok", async (req, res) => {
    // LEFT JOIN album nelkuliek miatt
    let sql = "SELECT eloadok.nev, COUNT(albumok.id) as albumok_szama, MIN(albumok.ev) as elso_album, MAX(albumok.ev) as utolso_album FROM eloadok LEFT JOIN albumok ON eloadok.id = albumok.eloado_id GROUP BY eloadok.id, eloadok.nev";
    let [eredmeny] = await db.query(sql);
    res.json(eredmeny);
});

app.get("/orszagok", async (req, res) => {
    let sql = "SELECT DISTINCT orszag FROM eloadok";
    let [eredmeny] = await db.query(sql);
    res.json(eredmeny);
});

app.listen(3000, () => {
    console.log("http://localhost:3000");
});