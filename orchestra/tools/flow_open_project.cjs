const { chromium } = require(process.env.HOME + "/flow-mcp/node_modules/playwright-core");
(async () => {
  const b = await chromium.connectOverCDP("http://127.0.0.1:9333");
  const page = b.contexts()[0].pages().find(p => p.url().includes("flow.google.com"));
  const href = await page.evaluate(() => {
    const el = [...document.querySelectorAll("*")].find(e => e.childElementCount === 0 && e.textContent.trim() === (process.argv[2] || "lacre-vietna"));
    let n = el; for (let i = 0; i < 8 && n; i++) { const a = n.querySelector && n.querySelector("a[href*='/project/']"); if (a) return a.href; if (n.closest && n.closest("a")) return n.closest("a").href; n = n.parentElement; }
    return null;
  });
  console.log("href", href);
  if (href) { await page.goto(href + "?hl=en"); await page.waitForTimeout(5000); }
  console.log(page.url());
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
