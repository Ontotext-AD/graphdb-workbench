module.exports = (api) => {
  api.cache.using(() => process.env.NODE_ENV);

  const presets = [
    '@babel/preset-env',
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }]
  ];

  const plugins = [];
  if (process.env.NODE_ENV === 'test') {
    plugins.push('istanbul');
  }

  return {
    compact: false,
    presets,
    plugins
  };
};
