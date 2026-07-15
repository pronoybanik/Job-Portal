import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();


app.listen(process.env.PORT || 5000, () => {
  console.log("Auth service is running on port " + (process.env.PORT || 3000));
});
