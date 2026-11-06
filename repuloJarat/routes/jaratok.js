import express from "express";
import db from "../data/db.js"
const app = express.Router();

app.get("/jaratok", async (req, res) => {
    const { honnan, hova, legitarsasag } = req.query;
    let base = "SELECT * FROM jaratok JOIN repuloterek AS indulo ON jaratok.honnan_id = indulo.id JOIN repuloterek AS erkezo ON jaratok.hova_id = erkezo.id JOIN legitarsasagok ON jaratok.legitarsasag_id = legitarsasagok.id";
    let end = " ORDER BY jaratok.indulas ASC";
    const adat = [];
    const params = [];

    if(honnan) {
        let sql = "indulo.kod = ?";
        adat.push(honnan);
        params.push(sql);
    }
    if(hova) {
        let sql = "erkezo.kod = ?";
        adat.push(hova);
        params.push(sql);
    }
    if(legitarsasag){
        let sql = "legitarsasagok.kod = ?";
        adat.push(legitarsasag);
        params.push(sql);
    }
    console.log(req.query);
    console.log(params, adat);

    if(params.length > 0) {
        base += " WHERE " + params.join(" AND ");
    }
    base += end;

    const [eredmeny] = await db.query(base, adat);
    res.json(eredmeny);
});

app.get("/jaratok/:id", async (req,res) => {
    const id = req.params.id;

    let base = "SELECT jaratok.jaratszam, legitarsasagok.nev AS legitarsasag, indulo.kod AS honnan, indulo.varos AS honnanVaros, erkezo.kod AS hova, erkezo.varos AS hovaVaros, TIME_FORMAT(jaratok.indulas, '%H:%i') AS indulas, TIME_FORMAT(ADDTIME(jaratok.indulas, SEC_TO_TIME(jaratok.idotartam * 60)), '%H:%i') AS erkezes, jaratok.idotartam, jaratok.ar FROM jaratok JOIN repuloterek AS indulo ON jaratok.honnan_id = indulo.id JOIN repuloterek AS erkezo ON jaratok.hova_id = erkezo.id JOIN legitarsasagok ON jaratok.legitarsasag_id = legitarsasagok.id";

    let adat = [];
    let params = [];

    if(id){
        let sql = "jaratok.jaratszam = ?";
        adat.push(id);
        params.push(sql);
    }

    if(params.length > 0){
        base += " WHERE " + params.join(" AND ");
    }

    const [eredmeny] = await db.query(base, adat);

    if(eredmeny.length === 0){
        return res.sendStatus(404);
    }

    res.json(eredmeny[0]);
});

export default app;