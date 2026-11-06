import express from "express";
import jaratokRoutes from "./routes/jaratok.js";
import repuloterekRoutes from "./routes/repuloterek.js";
import legitarsasagokRoutes from "./routes/legitarsasagok.js";

const app = express();

app.use(jaratokRoutes);
app.use(repuloterekRoutes);
app.use(legitarsasagokRoutes);

app.listen(3000, () => {
    console.log("http://localhost:3000");
});