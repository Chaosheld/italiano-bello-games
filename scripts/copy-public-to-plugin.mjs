import { mkdir, rm, cp } from "node:fs/promises";
import path from "node:path";

const src = path.resolve("public");
const dest = path.resolve("wordpress/italiano-bello-games/assets/public");

await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true });

console.log("OK: Copied /public to wordpress plugin assets/public");
