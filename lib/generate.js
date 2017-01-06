/**
 * Generate source map from raw css
 */

const postcss = require('postcss')

module.exports = generate

function generate (css, file = 'from.css') {
    if (!css || !css.toString) {
        throw new Error('genrate: expect String/Buffer as first parameter')
    }
    css = css.toString()

    return postcss([]).process(css, {
        from: file,
        map: {
            annotation: false
        }
    }).map
}
