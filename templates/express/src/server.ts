import 'dotenv/config'
import { App } from "./app";
import { validateEnvs } from "./lib/utils/validateEnv";
import { HomeController } from "./modules/home/home.controller";

console.log("\nExpress API");
console.log("Starting server...");
console.log("")

validateEnvs()

const app = new App([
  new HomeController()
])

app.listen()