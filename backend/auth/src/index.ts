import "dotenv/config";
import "./cache/index.js";
import app from "./app.js";

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("Auth service is running on port " + port);
});

