import "dotenv/config";
import app from "./app.js";

app.listen(process.env.PORT || 5002, () => {
  console.log("User service is running on port " + (process.env.PORT || 5002));
});
