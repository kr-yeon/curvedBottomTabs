module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.js', '.json'],
        alias: {
          '~': './src',
          '@components': './src/components',
          '@utils': './src/utils',
          '@assets': './src/assets',
          '@screens': './src/screens',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
