import express from "express";
import expressProxy from "express-http-proxy";

const app = express();

app.use("/api/auth", expressProxy("http://localhost:5000"));
app.use("/api/utils", expressProxy("http://localhost:5001"));
app.use("/api/user", expressProxy("http://localhost:5002"));
app.use("/api/job", expressProxy("http://localhost:5003"));

app.listen(3000, () => {
  console.log("Gateway server listening on port 3000");
});
