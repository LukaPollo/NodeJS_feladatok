import express from "express";

import munkalapokRoute from "./routes/munkalapok.js";
import alkatreszekRoute from "./routes/alkatreszek.js";
import ugyfelekRoute from "./routes/ugyfelek.js";
import statisztikaRoute from "./routes/statisztika.js";

const app = express();

app.use("/munkalapok", munkalapokRoute);
app.use("/alkatreszek", alkatreszekRoute);
app.use("/ugyfelek", ugyfelekRoute);
app.use("/statisztika", statisztikaRoute);

app.listen(3000, () => {
    console.log("http://localhost:3000")
})