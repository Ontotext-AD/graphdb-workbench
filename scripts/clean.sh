echo ''
echo '########################   Cleaning -- api --   ###########################'
echo ''
echo '- Delete "packages/api/dist"'
rm -fr packages/api/dist
echo '- Delete "packages/api/node_modules"'
rm -fr packages/api/node_modules

echo ''
echo '########################   Cleaning -- Workbench --   ###########################'
echo ''
echo '- Delete "packages/workbench/dist"'
rm -fr packages/workbench/dist
echo '- Delete "packages/workbench/node_modules"'
rm -fr packages/workbench/node_modules
echo '- Delete "packages/workbench/.angular"'
rm -fr packages/workbench/.angular

echo ''
echo '########################   Cleaning -- Legacy Workbench --   ###########################'
echo ''
echo '- Delete "packages/legacy-workbench/dist"'
rm -fr packages/legacy-workbench/dist
echo '- Delete "packages/legacy-workbench/node_modules"'
rm -fr packages/legacy-workbench/node_modules

echo ''
echo '########################   Cleaning -- Root config --   ###########################'
echo ''
echo '- Delete "packages/root-config/dist"'
rm -fr packages/root-config/dist
echo '- Delete "packages/root-config/node_modules"'
rm -fr packages/root-config/node_modules

echo ''
echo '########################   Cleaning -- Root --   ###########################'
echo ''
echo '- Delete "node_modules"'
rm -fr node_modules
echo '- Delete "deploy"'
rm -fr deploy
