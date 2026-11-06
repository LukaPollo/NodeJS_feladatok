import express from "express";
import db from "../data/db.js";

const route = express.Router();

route.get("/", async (req,res) => {
    const {sosemRendelt, rendelt} = req.query;
    let base = "SELECT DISTINCT termekek.id, termekek.nev, termekek.kategoria, termekek.ar FROM termekek JOIN tetelek ON termekek.id = tetelek.termek_id";
    let params = [];

    if(sosemRendelt && !rendelt){
        let sql = "tetelek.id IS NULL";
        params.push(sql);
    }
    if(rendelt && !sosemRendelt){
        let sql = "tetelek.id IS NOT NULL";
        params.push(sql);
    }
    else{
        return res.send("Vagy rendelt vagy nem rendelt, donts");
    }

    if (params.length > 0) {
        base += " WHERE " + params.join(" AND ");
    }

    const [eredmeny] = await db.query(base);
    res.json(eredmeny);
});

export default route