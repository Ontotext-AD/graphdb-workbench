echo ''
echo '########################   Installing -- legacy-workbench --   ###########################'
echo ''

cd packages/legacy-workbench
npm install

echo ''
echo '########################   Installing -- root-config --   ###########################'
echo ''

cd ..
cd root-config
npm install

echo ''
echo '########################   Installing -- workbench --   ###########################'
echo ''

cd ..
cd workbench
npm install


echo ''
echo '########################   Installing -- api --   ###########################'
echo ''

cd ..
cd api
npm install

echo ''
echo '########################   Installing -- shared components --   ###########################'
echo ''

cd ..
cd shared-components
npm install