import app from "./app.mjs";
import AppConfig from "./configs/app.config.mjs";

AppConfig.Server.dev === 1 ? console.log(AppConfig) : console.log();

app.listen(process.env.PORT, () => {
  console.log("Server successfully running");
});
