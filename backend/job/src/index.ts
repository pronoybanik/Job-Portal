
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();


app.listen(process.env.PORT || 5002, () => {
  console.log("Job service is running on port " + (process.env.PORT || 5003));
});

