const fs = require('fs');
const dir = __dirname + '/src'

const dataHTML = `<!DOCTYPE html>
html(lang="en")
    head
        meta(charset="UTF-8")
        meta(name="viewport", content="width=device-width, initial-scale=1.0")
        title Document
    body`;


const {
    src,
    dest
} = require('gulp');
const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const fileInclude = require("gulp-file-include");
const del = require('del');
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const group_media = require('gulp-group-css-media-queries');
const cleanCss = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const webpHTML = require('gulp-webp-html');
const webpCss = require('gulp-webp-css');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff')
const ttf2woff2 = require('gulp-ttf2woff2')
const fonter = require('gulp-fonter');
const pug = require('gulp-pug');
const htmlmin = require('gulp-htmlmin');

const project_foleder = 'dist';
const source_folder = 'src';

const path = {
    build: {
        html: project_foleder + '/',
        css: project_foleder + '/css/',
        js: project_foleder + '/js/',
        img: project_foleder + '/img/',
        fonts: project_foleder + '/fonts/',
    },

    src: {
        html: source_folder + '/*.pug',
        css: source_folder + '/scss/style.scss',
        js: source_folder + '/js/script.js',
        img: source_folder + '/img/**/*',
        fonts: source_folder + '/fonts/*.ttf',
    },

    watch: {
        html: source_folder + '/**/*.pug',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*',
    },

    clean: './' + project_foleder + '/',
}



function browserSync() {
    browsersync.init({
        server: {
            baseDir: './' + project_foleder + '/'
        },
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(pug({
            pretty: true
        }))
        .pipe(fileInclude())
        .pipe(webpHTML())
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(webpCss())
        .pipe(scss({
            outputStyle: "expanded",
            includePaths: require('node-normalize-scss').includePaths
        }))
        .pipe(group_media())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 versions'],
            cascade: false
        }))
        .pipe(cleanCss())
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function imges() {
    return src(path.src.img)
        .pipe(webp({
            quality: 70
        }))
        .pipe(imagemin({
            progressive: true,
            svgOlugins: [{
                removeViewBox: false
            }],
            interLaced: true,
            optimizationLevel: 3
        }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts))
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
}

gulp.task('svgSprite', function () {
    return gulp.src([source_folder + '/iconsprite/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../icons/icons.svg'
                }
            }
        }))
        .pipe(dest(path.build.img))
})

function init() {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
        fs.mkdirSync(dir + '/img');
        fs.mkdirSync(dir + '/scss');
        fs.mkdirSync(dir + '/js');
        //! pug
        fs.writeFileSync(dir + '/index.pug', dataHTML);
        //! scss
        fs.writeFileSync(dir + '/scss/style.scss', `@import '__base';@import '__components';@import '__layout';@import '__pages';@import '__themes';@import '__utils';@import '__vendors';`);
        fs.writeFileSync(dir + '/scss/__base.scss', `// включает глобальные стили, такие как сброс стилей, типография, цвета и т.д.`);
        fs.writeFileSync(dir + '/scss/__components.scss', `//  содержит отдельные компоненты с отдельным файлом .scss для каждого из них.`);
        fs.writeFileSync(dir + '/scss/__layout.scss', `// содержит стили для основных компонентов макета, таких как хедер, футер, навигация и т.д.`);
        fs.writeFileSync(dir + '/scss/__pages.scss', `// содержит стили, специфичные для отдельных страниц, если это необходимо.`);
        fs.writeFileSync(dir + '/scss/__themes.scss', `// стили для разных тем.`);
        fs.writeFileSync(dir + '/scss/__utils.scss', `// глобальные миксины, функции, вспомогательные селекторы и т.д.`);
        fs.writeFileSync(dir + '/scss/__vendors.scss', `// стили, миксины и прочее от третьих сторон`);
        //! js
        fs.writeFileSync(dir + '/js/script.js', ` `);
    } else {
        return
    }
}

gulp.task('delete', function () {
    if (fs.existsSync(dir)) {
        var deleteFolderRecursive = function (path) {
            if (fs.existsSync(path)) {
                fs.readdirSync(path).forEach(function (file, index) {
                    var curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        deleteFolderRecursive(curPath);
                    } else { // delete file
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            }
        };
        deleteFolderRecursive(dir)
    }
})

init()

gulp.task('otf2ttf', function () {
    return src([source_folder + '/fonts/*.otf'])
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(source_folder + '/fonts/'))
})

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], imges);
}

function clean() {
    return del(path.clean)
}

let build = gulp.series(clean, gulp.parallel(js, css, html, imges));
let watch = gulp.parallel(build, browserSync, watchFiles);

exports.js = js;
exports.css = css;
exports.html = html;
exports.fonts = fonts;
exports.build = build;
exports.watch = watch;
exports.imges = imges;
exports.default = watch;