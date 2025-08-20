module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // This plugin is specifically for react-native-web.
      // It's used to transpile certain native-only modules into no-ops on web.
      [
        'module-resolver',
        {
          alias: {
            'react-native-maps': 'react-native-web-maps',
          },
        },
      ],
    ],
  };
};