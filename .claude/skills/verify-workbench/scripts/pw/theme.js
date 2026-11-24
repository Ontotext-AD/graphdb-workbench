// run-code: store the theme mode the way the Workbench settings page does (localStorage
// `ontotext.gdb.application.settings`.themeMode = light|dark|system), optionally emulate the OS color scheme,
// reload so the first render uses it, then read back what is applied.
async (page, a) => {
  if (!page.url().startsWith(new URL(a.wbUrl).origin)) await page.goto(a.wbUrl + '/');
  if (a.os) await page.emulateMedia({colorScheme: a.os});
  await page.evaluate(mode => {
    const key = 'ontotext.gdb.application.settings';
    const settings = JSON.parse(localStorage.getItem(key) || '{}');
    settings.themeMode = mode;
    localStorage.setItem(key, JSON.stringify(settings));
  }, a.mode);
  await page.reload();
  await page.locator('[data-test="onto-repository-selector"]').first().waitFor({timeout: 30000});
  return page.evaluate(() => ({
    stored: JSON.parse(localStorage.getItem('ontotext.gdb.application.settings')).themeMode,
    osPrefersDark: matchMedia('(prefers-color-scheme: dark)').matches,
    applied: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    bodyBackground: getComputedStyle(document.body).backgroundColor,
  }));
}
