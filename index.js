import express from "express";
import cors from "cors";
import run from "./Database.js";
import mainRoute from "./routes/route.js";

const app = express();
app.use(cors());
app.use(express.json());

const port = 8000;

run().then(() => {
  app.use("/", mainRoute);
  app.listen(port, () => {
    console.log(`Listening to port ${port}`);
  });
});
