# 周家五十音

全家一起練日文五十音的小網站：每天 20 題平假名、片假名混合小考，每題附詞語、例句和圖片，爸爸、媽媽、姐姐、弟弟各自記錄成績。

- 網頁內容在 `kana-family.html`，`node scripts/build.mjs` 會把它包成 `dist/index.html`。
- 推送到 `main` 後，GitHub Actions 會自動部署到 GitHub Pages 和 Cloudflare Pages。
- Cloudflare Pages 需要在 repo 的 Settings → Secrets and variables → Actions 加上
  `CLOUDFLARE_API_TOKEN`（權限：Account → Cloudflare Pages → Edit）和 `CLOUDFLARE_ACCOUNT_ID`。
  沒設定時會跳過 Cloudflare，只部署 GitHub Pages。
- 在這兩個網站上，成績存在各自裝置的瀏覽器裡；全家共用的成績紀錄只在 claude.ai 的版本有。
