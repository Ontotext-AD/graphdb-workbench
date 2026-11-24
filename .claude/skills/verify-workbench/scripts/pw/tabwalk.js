// run-code: press Tab (Shift+Tab) n times with the real keyboard and describe the focused element after each press.
async (page, a) => {
  const lines = [];
  for (let i = 1; i <= a.n; i++) {
    await page.keyboard.press(a.shift ? 'Shift+Tab' : 'Tab');
    lines.push(`${i}. ` + await page.evaluate(`(${a.describe})()`));
  }
  return lines.join('\n');
}
