echo ''
echo '######################## Cleaning -- Shared components -- ###########################'
echo ''
echo '- Delete "packages/shared-components/.stencil"'
rm -fr packages/shared-components/.stencil
echo '- Delete "packages/shared-components/dist"'
rm -fr packages/shared-components/dist
echo '- Delete "packages/shared-components/loader"'
rm -fr packages/shared-components/loader
echo '- Delete "packages/shared-components/node_modules"'
rm -fr packages/shared-components/node_modules
echo '- Delete "packages/shared-components/www"'
rm -fr packages/shared-components/www`

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
