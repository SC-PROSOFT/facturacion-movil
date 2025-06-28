module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
     [
      'module:react-native-dotenv', // <--- USA EL PREFIJO 'module:'
      {
        moduleName: '@env',
        path: '.env',
        blocklist: null,
        allowlist: null,
        safe: false,
        allowUndefined: true,
        verbose: false,
      },
    ], // ¡Añade esta línea!
  ],
};
