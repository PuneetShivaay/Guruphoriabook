// We intialize server here
import express from "express";
import "dotenv/config"


const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.send("Hello GuruPhoria");
})

app.get("/health", (_req, res) => {
    res.json({ status: "ok"})
})

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT)
});