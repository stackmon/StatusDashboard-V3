import express from "express";
import { join } from "path";

const app = express();
const port = 80;

app.use(express.static("dist"));

app.get("*", (req, res) => {
  res.sendFile(join("dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
