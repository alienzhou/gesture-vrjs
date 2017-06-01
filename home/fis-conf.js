/**
 * @file FIS 配置
 * @author
 */

fis.config.set('namespace', 'home');

// chrome下可以安装插件实现livereload功能
// https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
fis.config.set('livereload.port', 35729);

if (fis.IS_FIS3) {
    fis.media('debug').match('*', {
        optimizer: null,
        useHash: false,
        deploy: fis.plugin('http-push', {
            receiver: 'http://127.0.0.1:8085/yog/upload',
            to: '/'
        })
    }).match('::package', {
        spriter: fis.plugin('csssprites', {// 启用 fis-spriter-csssprites 插件
            layout: 'matrix',
            margin: '10'
        }),
        'static/css/main.less':[
            "**.less"
        ]
    }).match('*.less', {// 对 CSS 进行图片合并
        // 给匹配到的文件分配属性 `useSprite`
        useSprite: true
    }).match('*.png', {
        // fis-optimizer-png-compressor 插件进行压缩，已内置
        optimizer: fis.plugin('png-compressor')
    });

    fis.media('prod').match('*', {
        deploy: fis.plugin('http-push', {
            receiver: 'http://127.0.0.1:8085/yog/upload',
            to: '/'
        })
    }).match('::package', {
        spriter: fis.plugin('csssprites', {// 启用 fis-spriter-csssprites 插件
            layout: 'matrix',
            margin: '10'
        }),
        'static/css/main.less':[
            "**.less"
        ]
    }).match('*.less', {// 对 CSS 进行图片合并
        // 给匹配到的文件分配属性 `useSprite`
        useSprite: true,
        useHash: true,
        optimizer: fis.plugin('clean-css')
    }).match('*.js', {
        useHash: true,
        optimizer: fis.plugin('uglify-js')
    }).match('*.png', {
        // fis-optimizer-png-compressor 插件进行压缩，已内置
        optimizer: fis.plugin('png-compressor')
    });
}
else {
    fis.config.merge({
        deploy: {
            debug: {
                to: '/',
                // yog2 默认的部署入口，使用调试模式启动 yog2 项目后，这个入口就会生效。IP与端口请根据实际情况调整。
                receiver: 'http://127.0.0.1:8085/yog/upload'
            }
        }
    });

    fis.config.set('modules.postpackager', 'simple');
    fis.config.set('pack', {
        'static/css/main.less':[
            "**.less"
        ]
    });
    fis.config.set('modules.parser.less', 'less');
    fis.config.set('settings.postpackager.simple.autoCombine', true);
    fis.config.set('modules.spriter', 'csssprites');
    var paths = fis.config.get('roadmap.path') || [];
    paths.unshift({
        reg: /^client\/(.*\.less)$/i,
        useSprite: true
    });
}
