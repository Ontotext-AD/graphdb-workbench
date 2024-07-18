echo ''
echo '########################   Building -- api --   ###########################'
echo ''

cd packages/api
npm run build

echo ''
echo '########################   Building -- shared-components --   ###########################'
echo ''

cd packages/shared-components
npm run build

echo ''
echo '########################   Building -- Workbench --  ###########################'
echo ''
cd ../workbench
npm run build
