import { promises as fs } from "node:fs";
import { resolve } from "node:path";

const PKG_PATH = "package.json";
const MANIFEST_PATH = resolve("public", "manifest.json");

const matchVersion = async () => {
  try {
    const packageJson = await fs.readFile(PKG_PATH, "utf-8");
    const { version } = JSON.parse(packageJson);

    const manifestJson = await fs.readFile(MANIFEST_PATH, "utf-8");
    const manifest = JSON.parse(manifestJson);
    manifest.version = version;

    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log("Version copied successfully!");
  } catch (error) {
    console.error("Error:", error);
  }
};

matchVersion();
