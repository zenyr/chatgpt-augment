// @ts-check
const BANNER_GPT = `/**
* ########### Note to the reviewer ###########
* 
* This file contains a bunch of encoded tokens 
* that are used to encode the string to estimate GPT-3 token length.
* 
* The huge array and the content of this script is NOT obfuscated.
* (this is "cl100k_base token" written in javascript)
* See: https://gpt-tokenizer.dev/
*/
`;
const BANNER_VENDOR = `/**
* ########### Note to the reviewer ###########
* 
* This file came from third party libraries.
* (a.k.a. "vendor code")
* Module: {modules}
*/
`;
const BANNER_MAIN = `/**
* ########### Note to the reviewer ###########
* 
* This is the only code I have control of.
* Let me know if there are any issues with this one! :)
* 
*/
`;

import fs from "fs/promises";
import path from "path";

/**
 * @param {string} fileName
 */
async function getModules(fileName) {
  const output = (await import("../vite.config.rollup.js")).default.output;
  if (!output || Array.isArray(output)) return "";
  const chunks = output.manualChunks;
  if (!chunks) return "";
  const vndName = /(vnd.[^-]+)/.exec(fileName)?.[1];
  const found = vndName && chunks[vndName];
  if (!found) return "";
  return found.join(", ");
}

async function addPrefixToFiles() {
  const files = await fs.readdir("dist/assets");

  for (const file of files) {
    if (file.endsWith(".js")) {
      const filePath = path.join("dist/assets", file);
      const content = await fs.readFile(filePath, "utf8");
      const isGptTokenizer = filePath.includes("gotTokenizer");
      const isMain = filePath.includes("main") && !filePath.includes("loader");
      const modules = await getModules(path.basename(filePath));
      const prefixedContent = `${
        isGptTokenizer ? BANNER_GPT : !isMain ? BANNER_VENDOR : BANNER_MAIN
      }${content}`;
      await fs.writeFile(
        filePath,
        prefixedContent.replace("{modules}", modules || "N/A")
      );
      console.log(`Added prefix to ${file}`);
    }
  }
}

addPrefixToFiles()
  .then(() => {
    console.log("Done adding banners!");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
