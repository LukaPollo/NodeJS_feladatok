import express from "express";

import autokRoute from "./routes/autok.js";
import ugyfelekRoute from "./routes/ugyfelek.js";
import statisztikaRoute from "./routes/statisztika.js";

const app = express();

app.use("/autok", autokRoute);
app.use("/ugyfelek", ugyfelekRoute);
app.use("/statisztika", statisztikaRoute);

app.listen(3000, () => {
    console.log("http://localhost:3000");
});