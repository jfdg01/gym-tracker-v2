const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
const { resolver, transformer } = config;

// 1. Support for Drizzle ORM (.sql migrations)
config.resolver.sourceExts.push('sql');

// 2. Support for SVGs (gluestack icons)
config.resolver.assetExts = resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");

// 3. Final Wrap with NativeWind
module.exports = withNativeWind(config, {
    input: './global.css'
});
