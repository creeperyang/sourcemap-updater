const { relative } = require('path')
const mozilla = require('source-map')
const { parse, stringify } = require('postcss')

module.exports = update

function getConsumer (json) {
    if (Buffer.isBuffer(json)) {
        json = json.toString()
    }
    return new mozilla.SourceMapConsumer(json)
}

function getGenerator (file, sourceRoot, skipValidation) {
    return new mozilla.SourceMapGenerator({
        file,
        sourceRoot,
        skipValidation
    })
}

function update (data, options) {
    if (!data || data.length < 2) {
        throw new Error('Expect [css, map] as first parameter.')
    }
    const css = data[0].toString()
    const consumer = getConsumer(data[1])
    if (!options) {
        options = {}
    }
    const generator = getGenerator(consumer.file)

    const updatedCss = generateString(generator, consumer, parse(css), options.updater)
    const json = JSON.parse(generator.toString())
    if (consumer.sourceRoot && !json.sourceRoot) {
        json.sourceRoot = consumer.sourceRoot
        json.sources = json.sources.map(s => relative(consumer.sourceRoot, s))
    }
    return {
        css: updatedCss,
        map: json,
        sourceMapGenerator: generator
    }
}

function generateString (generator, consumer, root, updater = () => false) {
    let css = ''

    let line = 1
    let column = 1

    let lines, last, updated, original
    stringify(root, (str, node, type) => {
        updated = updater(str, node, type, consumer)
        // If updated is `false`, means use the original text.
        if (updated === false) {
            css += str
            updated = str
        }
        // Else if updated is string, use it instead.
        else if (typeof updated === 'string') {
            css += updated
        }
        // Otherwise, delete the original text.
        else {
            // Make `if (node && xxx)` falsy, and then won't add mapping
            node = null
            updated = ''
        }

        if (node && type !== 'end') {
            if (node.source && node.source.start) {
                original = consumer.originalPositionFor(node.source.start)
                // { source: '../css/simple.css', line: 8, column: 0, name: null }
                generator.addMapping({
                    source: original.source,
                    generated: { line, column: column - 1 },
                    original: {
                        line: original.line,
                        column: original.column
                    }
                })
            } else {
                generator.addMapping({
                    source: '<no source>',
                    original: {
                        line: 1,
                        column: 0
                    },
                    generated: {
                        line,
                        column: column - 1
                    }
                })
            }
        }

        lines = updated.match(/\n/g)
        if (lines) {
            line += lines.length
            last = updated.lastIndexOf('\n')
            column = updated.length - last
        } else {
            column += updated.length
        }

        if (node && type !== 'start') {
            if (node.source && node.source.end) {
                original = consumer.originalPositionFor(node.source.end)
                if (original.line != null) {
                    generator.addMapping({
                        source: original.source,
                        generated: {
                            line,
                            column: column - 1
                        },
                        original: {
                            line: original.line,
                            column: original.column
                        }
                    })
                }
            } else {
                generator.addMapping({
                    source: '<no source>',
                    original: {
                        line: 1,
                        column: 0
                    },
                    generated: {
                        line,
                        column: column - 1
                    }
                })
            }
        }
    })

    return css
}
