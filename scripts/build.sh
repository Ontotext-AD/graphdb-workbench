echo ''
echo '########################   Building -- api --   ###########################'
echo ''

cd packages/api
npm run build

echo ''
echo '########################   Building -- Legacy Workbench --  ###########################'
echo ''
cd ../legacy-workbench
npm run build

echo ''
echo '########################   Building -- Workbench --  ###########################'
echo ''
cd ../workbench
npm run build

echo ''
echo '########################   Building -- Root config --  ###########################'
echo ''
cd ../root-config
npm run build

echo ''
echo '########################   Building -- navbar --   ###########################'
echo ''

cd packages/navbar
npm run build
