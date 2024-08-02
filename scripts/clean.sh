echo ''
echo '######################## Cleaning -- Shared components -- ###########################'
echo ''
echo '- Delete "packages/shared-components/.stencil"'
rm -rf packages/shared-components/.stencil
echo '- Delete "packages/shared-components/dist"'
rm -rf packages/shared-components/dist
echo '- Delete "packages/shared-components/loader"'
rm -rf packages/shared-components/loader
echo '- Delete "packages/shared-components/node_modules"'
rm -rf packages/shared-components/node_modules
echo '- Delete "packages/shared-components/www"'
rm -rf packages/shared-components/www

echo ''
echo '########################   Cleaning -- api --   ###########################'
echo ''
echo '- Delete "packages/api/dist"'
rm -rf packages/api/dist
echo '- Delete "packages/api/node_modules"'
rm -rf packages/api/node_modules

echo ''
echo '########################   Cleaning -- Workbench --   ###########################'
echo ''
echo '- Delete "packages/workbench/dist"'
rm -rf packages/workbench/dist
echo '- Delete "packages/workbench/node_modules"'
rm -rf packages/workbench/node_modules
echo '- Delete "packages/workbench/.angular"'
rm -rf packages/workbench/.angular

echo ''
echo '########################   Cleaning -- Legacy Workbench --   ###########################'
echo ''
echo '- Delete "packages/legacy-workbench/dist"'
rm -rf packages/legacy-workbench/dist
echo '- Delete "packages/legacy-workbench/node_modules"'
rm -rf packages/legacy-workbench/node_modules

echo ''
echo '########################   Cleaning -- Root config --   ###########################'
echo ''
echo '- Delete "packages/root-config/dist"'
rm -rf packages/root-config/dist
echo '- Delete "packages/root-config/node_modules"'
rm -rf packages/root-config/node_modules

echo ''
echo '########################   Cleaning -- Root --   ###########################'
echo ''
echo '- Delete "node_modules"'
rm -rf node_modules
echo '- Delete "dist"'
rm -rf dist
