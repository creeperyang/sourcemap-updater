const { readFileSync } = require('fs')
const test = require('ava')
const update = require('../lib')

test('should generate correct source map when css not changes.', t => {
    const content = readFileSync(`${__dirname}/res/concated.css`)
    const res = update([
        content,
        readFileSync(`${__dirname}/res/concated.css.map`)
    ])
    t.is(res.css, content.toString())
    t.deepEqual(res.map, require('./res/concated.expected.json'))
})

test('should generate correct source map when css changes.', t => {
    const res = update([
        readFileSync(`${__dirname}/res/concated.css`),
        readFileSync(`${__dirname}/res/concated.css.map`)
    ], {
        updater (str, node, type) {
            // for `prop-value`s, remove all newline of value.
            if (!type && node && node.prop) {
                node.value = node.value.replace(/\s*\n\s*/g, '')
                return node.toString() + ';'
            }
            return false
        }
    })
    t.is(res.css, readFileSync(`${__dirname}/res/concated.beautiful.css`).toString())
    t.deepEqual(res.map, require('./res/concated.beautiful.expected.json'))
})

test('should generate correct source map when css deletes some lines.', t => {
    const res = update([
        readFileSync(`${__dirname}/res/concated.css`),
        readFileSync(`${__dirname}/res/concated.css.map`)
    ], {
        updater (str, node, type) {
            // for `prop-value`s, remove `background-image`
            if (!type && node && node.prop === 'background-image') {
                return ''
            }
            return false
        }
    })
    t.is(res.css, readFileSync(`${__dirname}/res/concated.nobg.css`).toString())
    t.deepEqual(res.map, require('./res/concated.nobg.expected.json'))
})

test('should generate correct source map when map is empty.', t => {
    const content = readFileSync(`${__dirname}/res/concated.css`)
    const expected = require('./res/raw.json')

    const res = update([
        content,
        null
    ])
    t.is(res.css, content.toString())
    t.deepEqual(res.map, expected)

    const res2 = update([
        content,
        {}
    ])
    t.is(res2.css, content.toString())
    t.deepEqual(res2.map, expected)

    const res3 = update([
        content,
        {}
    ], { file: 'css/y.css' })
    t.is(res3.css, content.toString())
    t.deepEqual(res3.map, Object.assign({}, expected, {
        file: 'css/y.css',
        sources: ['css/y.css']
    }))

    const res4 = update([
        content,
        { file: 'css/y.css' }
    ])
    t.is(res4.css, content.toString())
    t.deepEqual(res4.map, Object.assign({}, expected, {
        file: 'css/y.css',
        sources: ['css/y.css']
    }))
})
