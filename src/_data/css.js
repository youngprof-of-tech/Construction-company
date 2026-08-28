const fs = require("fs");
const path = require("path");

// Concatenate all CSS partials in filename order (10-, 20-, 30-...).
module.exports = () => {
  const dir = path.join(__dirname, "..", "assets", "css");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".css"))
    .sort()
    .map((f) => fs.readFileSync(path.join(dir, f), "utf8"))
    .join("\n");
};
