import express from "express";

import autokRoute from "./routes/autok.js";
import ugyfelekRoute from "./routes/ugyfelek.js";
import statisztikaRoute from "./routes/statisztika.js";
import berlesekRoute from "./routes/berlesek.js";


const app = express();
app.use(express.json());

app.use("/berlesek", berlesekRoute);
app.use("/autok", autokRoute);
app.use("/ugyfelek", ugyfelekRoute);
app.use("/statisztika", statisztikaRoute);

app.listen(3000, () => {
    console.log("http://localhost:3000");
});