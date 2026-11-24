// run-code: text of the webpack-dev-server error overlay (dev stack only), then remove it: its iframe covers the
// page and swallows clicks.
async (page) => {
  const overlay = page.locator('#webpack-dev-server-client-overlay');
  if (!await overlay.count()) return 'no webpack overlay';
  const frame = await (await overlay.elementHandle()).contentFrame();
  const text = frame ? (await frame.locator('body').innerText().catch(() => '')).trim() : '';
  await overlay.evaluate(el => el.remove());
  return `webpack overlay removed; it showed:\n${text || '(empty)'}`;
}
