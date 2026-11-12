import express from "express";

import szakkorokRoute from "./routes/szakkorok.js";
import jelentkezesekRoute from "./routes/jelentkezesek.js";
import diakokRoute from "./routes/diakok.js";
import utkozesekRoute from "./routes/utkozesek.js";

const app = express();
app.use(express.json());

app.use("/szakkorok", szakkorokRoute);
app.use("/diakok", diakokRoute);
app.use("/jelentkezesek", jelentkezesekRoute);
app.use("/utkozesek", utkozesekRoute);

app.listen(3000, () => {
    console.log("http://localhost:3000");
});