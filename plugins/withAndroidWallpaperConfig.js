const { withAndroidManifest } = require('@expo/config-plugins');

const withAndroidWallpaperConfig = (config) => {
    return withAndroidManifest(config, async (config) => {
        // NOTE: 'wallpaper' configChange is not valid in modern Android SDKs.
        // We are keeping this plugin file but disabling the actual modification
        // to avoid breaking the build.
        return config;
    });
};

module.exports = withAndroidWallpaperConfig;
