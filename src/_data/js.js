const fs = require("fs");
const path = require("path");

// Concatenate all JS modules in filename order (10-, 20-, 30-...).
module.exports = () => {
  const dir = path.join(__dirname, "..", "assets", "js");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".js"))
    .sort()
    .map((f) => fs.readFileSync(path.join(dir, f), "utf8"))
    .join("\n");
};
