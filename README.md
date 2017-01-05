# sourcemap-updater

[![Build Status](https://travis-ci.org/creeperyang/universal-css-processor.svg?branch=master)](https://travis-ci.org/creeperyang/universal-css-processor)

> A tool help to modify css and update sourcemap automatically.

Assume that you have a css (maybe generated via `sass/postcss`) and a corresponding sourcemap. If you want to modify the css (such as delete one declaration, change a prop value), you could modify directly, but the sourcemap would be inaccurate.

This lib will help you modify css (more convenient/powerful), and  update sourcemap automatically. This means you no longer need to care about sourcemap when you modify css.

## Installation and Usage

```bash
npm i --save sourcemap-updater
```

And then

```js
const update = require('sourcemap-updater')

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

writeFileSync(`${__dirname}/res/concated.css`, res.css)
writeFileSync(`${__dirname}/res/concated.css.map`, res.map)
```

## API

**`update(data, options)`**

- `data` is `Array`, `data[0]` is css content (`String/Buffer`), and `data[1]` is original sourcemap (`String/Buffer/Object`).
- `options` is `Object`. And `options.updater` is `Function`.

    `options.updater` is like `function(str, node, type){}`, is the same as [`postcss/builder`](http://api.postcss.org/global.html#builder)


## License

MIT