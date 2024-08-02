echo ''
echo '########################   Building -- api --   ###########################'
echo ''

npm run build --prefix packages/api

echo ''
echo '########################   Building -- shared-components --   ###########################'
echo ''

npm run build --prefix packages/shared-components

echo ''
echo '########################   Building -- Workbench --  ###########################'
echo ''
npm run build --prefix packages/workbench
