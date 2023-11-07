module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'module:metro-react-native-babel-preset',
        {
          unstable_disableES6Transforms: true,
        },
      ],
     // 'module:metro-react-native-babel-preset',
      // Add the following preset for web support
      'babel-preset-expo',
    ],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.tsx', '.ts', '.js', '.json'],
        },
      ],
      'react-native-reanimated/plugin',
      'tailwindcss-react-native/babel',
    ],
  };
};