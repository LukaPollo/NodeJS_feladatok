import express from "express";
import rendelesekRoute from "./routes/rendelesek.js";
import vasarlokRoute from "./routes/vasarlok.js";
import termekekRoute from "./routes/termekek.js";
import statisztikaRoute from "./routes/statisztika.js";

const app = express();
app.use("/rendelesek", rendelesekRoute);
app.use("/vasarlok", vasarlokRoute);
app.use("/termekek", termekekRoute);
app.use("/statisztika", statisztikaRoute);

app.listen(3000, () => {
    console.log("http://localhost:3000");
});