const { DateTime } = require("luxon");
const CleanCSS = require("clean-css");
const { minify } = require("terser");

module.exports = function (eleventyConfig) {
  const isProd = process.env.ELEVENTY_ENV === "production";

  // ---- Passthrough copy -----------------------------------------------------
  // Static assets, CMS admin, and the uploads media folder are copied as-is.
  eleventyConfig.addPassthroughCopy({ "src/assets/images": "assets/images" });
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("uploads");
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });

  // Rebuild when CSS/JS change (they are compiled through templates/filters).
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  // ---- Collections ----------------------------------------------------------
  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("services", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/services/*.md")
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0))
  );

  // ---- Filters --------------------------------------------------------------
  eleventyConfig.addFilter("readableDate", (date, zone = "utc") =>
    DateTime.fromJSDate(date, { zone }).toFormat("LLL dd, yyyy")
  );

  eleventyConfig.addFilter("isoDate", (date) =>
    DateTime.fromJSDate(date, { zone: "utc" }).toISO()
  );

  eleventyConfig.addFilter("htmlDate", (date) =>
    DateTime.fromJSDate(date, { zone: "utc" }).toFormat("yyyy-LL-dd")
  );

  // Absolute URL builder for canonical / OG / sitemap tags.
  eleventyConfig.addFilter("absoluteUrl", (path, base) => {
    try {
      return new URL(path, base).href;
    } catch (e) {
      return path;
    }
  });

  // Limit an array (used for blog previews on the home page).
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));

  // Excerpt fallback for cards.
  eleventyConfig.addFilter("truncate", (str, n = 160) => {
    if (!str) return "";
    const text = String(str).replace(/<[^>]*>/g, "");
    return text.length > n ? text.slice(0, n).trim() + "…" : text;
  });

  // ---- Inline asset transforms (minify in prod) -----------------------------
  eleventyConfig.addFilter("cssmin", (code) =>
    isProd ? new CleanCSS({}).minify(code).styles : code
  );

  eleventyConfig.addNunjucksAsyncFilter("jsmin", async (code, callback) => {
    if (!isProd) return callback(null, code);
    try {
      const result = await minify(code);
      callback(null, result.code);
    } catch (err) {
      console.warn("Terser error: ", err);
      callback(null, code);
    }
  });

  // ---- Base config ----------------------------------------------------------
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    pathPrefix: "/",
  };
};
