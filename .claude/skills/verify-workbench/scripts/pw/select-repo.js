// run-code: select a repository the way the app persists it (localStorage
// `ontotext.gdb.repository.selectedRepository` = {id, location}; same as cy.presetRepository), reload, read back
// what the header's repository selector shows.
async (page, a) => {
  if (!page.url().startsWith(new URL(a.wbUrl).origin)) await page.goto(a.wbUrl + '/');
  await page.evaluate(ref => localStorage.setItem('ontotext.gdb.repository.selectedRepository', JSON.stringify(ref)),
    {id: a.id, location: a.location});
  // A `repositoryId` URL parameter wins over the stored selection: drop it before reloading.
  const url = new URL(page.url());
  url.searchParams.delete('repositoryId');
  await page.goto(url.href);
  const shown = page.locator('[data-test="onto-repository-selector"] [data-test="repository-selection"] .repository-id').first();
  await page.waitForFunction(id => document.querySelector('[data-test="onto-repository-selector"] .repository-id')
    ?.textContent.trim() === id, a.id, {timeout: 15000}).catch(() => {});
  const text = (await shown.textContent({timeout: 5000}).catch(() => '')).trim();
  if (text !== a.id) throw new Error(`FAIL selector shows "${text}", not "${a.id}" (does the repository exist on this stack?)`);
  return `OK selected ${a.id}`;
}
