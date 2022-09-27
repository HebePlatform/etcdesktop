const {defineConfig} = require('@vue/cli-service')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = defineConfig({
    transpileDependencies: true,

    configureWebpack: {
        plugins: [
            new NodePolyfillPlugin()
        ]
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration:true,
            builderOptions: {
                asar: false,
                appId: 'org.etc.etcdesktop',
                productName: 'Etc-Desktop',
                copyright: 'Copyright©hebeblock',
                nsis: {
                    oneClick: false,
                    allowToChangeInstallationDirectory: true,
                    createDesktopShortcut: true,
                    runAfterFinish: true
                },
                win: {
                    legalTrademarks: 'Copyright©hebeblock',
                    icon: 'public/icon.ico',
                    target: [{
                        target: 'nsis',
                        arch: ['x64', 'ia32']
                    }]
                },
                dmg: {
                    icon: 'build/icons/icon.icns'
                },
                linux: {
                    icon: 'build/icons/256x256.png'
                },
                mac: {
                    icon: 'build/icons/icon.icns'
                }
            }
        },
    }
})
