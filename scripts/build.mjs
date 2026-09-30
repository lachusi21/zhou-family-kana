// 把 kana-family.html（claude.ai 版本的網頁內容）包成完整的網站，輸出到 dist/
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";

const page = readFileSync("kana-family.html", "utf8");
const head = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="周家一起練五十音：每天 20 題平假名、片假名小考，附詞語和例句。">
<meta property="og:title" content="周家五十音">
<meta property="og:description" content="每天 20 題平假名、片假名小考，全家一起記錄成績。">
<meta property="og:image" content="cover.webp">
<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
`;

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
writeFileSync("dist/index.html", head + page + "\n</body>\n</html>\n");
copyFileSync("cover.webp", "dist/cover.webp");
console.log("built dist/index.html");
