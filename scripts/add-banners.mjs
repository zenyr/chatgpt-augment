// @ts-check
const BANNER_GPT = `/**
* ########### Note to the reviewer ###########
* 
* This file contains a bunch of encoded tokens 
* that are used to encode the string to estimate GPT-3 token length.
* 
* The huge content of this script is NOT obfuscated.
* (this is "GPT-3 tokens" written in javascript, unobfuscated for your review)
* See: https://github.com/openai/GPT-3-Encoder/blob/79387f/Encoder.js
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
  const chunks = (await import("../vite.config.rollup.js")).chunks;
  if (!chunks || Array.isArray(chunks)) return "";
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
      const isGptTokenizer = filePath.includes("gpt3");
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
