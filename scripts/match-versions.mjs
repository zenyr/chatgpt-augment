import { promises as fs } from "node:fs";
import { resolve } from "node:path";

const PKG_PATH = "package.json";
const MANIFEST_PATH = resolve("manifest.json");

const matchVersion = async () => {
  try {
    const packageJson = await fs.readFile(PKG_PATH, "utf-8");
    const { version } = JSON.parse(packageJson);

    const manifestJson = await fs.readFile(MANIFEST_PATH, "utf-8");
    const manifest = JSON.parse(manifestJson);
    manifest.version = version;

    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
};

matchVersion().then(()=>{
  console.log("Done matching version!");
  process.exit(0);
}).catch((e)=>{
  console.error(e);
  process.exit(1);
});