import express from "express";

import receptekRoute from "./routes/receptek.js";
import hozzavalokRoute from "./routes/hozzavalok.js";
import statisztikaRoute from "./routes/statisztika.js";

const app = express();
app.use(express.json());


app.use("/receptek", receptekRoute);
app.use("/hozzavalok", hozzavalokRoute);
app.use("/statisztika", statisztikaRoute);

app.listen(3000, () => {
    console.log("http://localhost:3000");
});