import express from "express";

import gazdakRoute from "./route/gazdak.js";
import allatokRoute from "./route/allatok.js";
import kezelesekRoute from "./route/kezelesek.js";
import statisticsRoute from "./route/statisztika.js";

const app = express();
app.use(express.json())

app.use("/gazdak", gazdakRoute);
app.use("/allatok", allatokRoute);
app.use("/statisztika", statisticsRoute);
app.use("/kezelesek", kezelesekRoute);

app.listen(3000, () => {
    console.log("http://localhost:3000");
});