import { config } from "dotenv";
config({ path: ".env.local" });
import { resetDemoAccount } from "../src/lib/demo-seed";
resetDemoAccount().then(({ email }) => console.log(`Demo account reset: ${email}`)).catch(error => { console.error(error); process.exit(1); });
