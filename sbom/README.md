# SBOM sources

`vendored-libraries.cdx.json` lists the third-party libraries copied into
`packages/legacy-workbench/src/js/lib/`, which no lockfile records. `scripts/build-sbom.js` merges it into
`dist/sbom.cdx.json`.

For each library:

- `version` and `purl` are of the upstream release the copy is based on, so scanners match its known vulnerabilities.
- `pedigree.notes` says how the copy differs from that release.
- `evidence.occurrences` points to the copied file.

Update the entry when a copied library is changed, replaced or removed.
