const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Support for Drizzle ORM (.sql migrations)
config.resolver.sourceExts.push('sql');

// Support for SVGs (gluestack icons)
const { resolver: { assetExts, sourceExts } } = config;
config.resolver.assetExts = assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");

module.exports = withNativeWind(config, { input: './global.css' });
