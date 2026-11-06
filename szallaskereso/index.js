import express from "express";
import db from "./data/db.js";
import szallasokRoute from "./routes/szallasok.js";
import varosokRoute from "./routes/varosok.js";
import orszagokRoute from "./routes/orszagok.js";
import ajanlatRoute from "./routes/ajanlat.js";
import legjobbRoute from "./routes/legjobb.js";

const app = express();

app.use(szallasokRoute);
app.use(varosokRoute);
app.use(orszagokRoute);
app.use(ajanlatRoute);
app.use(legjobbRoute);

app.listen(3000, () => {
    console.log("szerver fut:" + " http://localhost:3000");
});