# 从零开始实现前端模板引擎

## replace
### 介绍
replace 是字符串提供的一个超级强大的方法，这里只介绍简单的使用，更多详细的语法参见下面提供的链接
- 一参可为 `字符串` 或 `正则`:
    - 为正则时有两种情况: `普通匹配模式` 和 `全局匹配模式`:
        - 全局匹配模式下，若二参为函数，则该函数在每次匹配时都会被调用
- 二参可为 `字符串` 或 `一个用于生成字符串的函数`:
    - 当为字符串时:
        - 可在字符串中使用 特殊替换字符 ($n ...)
    - 当为函数时:
        - 函数中不能用 特殊替换字符
        - 一参为正则匹配的文本
        - 倒数第二参为匹配到的子字符串在原字符串中的偏移量
        - 最后一参为被匹配的原始字符串
        - 其余参数为正则中每个分组匹配到的文本
        ```javascript
            function replacer(match, p1, p2, p3, offset, string) {
                // match 为 'abc12345#$*%'        : 正则匹配的文本
                // p1,p2,p3 分别为 abc 12345 #$*% : 即每个小组匹配到的文本, pn 表示有 n 个小组
                // offset 为 0                    : 匹配到的子字符串在原字符串中的偏移量。
                //      （比如，如果原字符串是'abcd'，匹配到的子字符串时'bc'，那么这个参数将是1）
                // string 为 'abc12345#$*%'       : 被匹配的原始字符串
                return [p1, p2, p3].join(' - ');
            }
            // 注意正则中的 括号 ，这里分有 3个组
            var newString = 'abc12345#$*%'.replace(/([^\d]*)(\d*)([^\w]*)/, replacer);
            // newString => 'abc - 12345 - #$*%'
        ```

以下是各种情况下的具体案例:
```javascript
// 最基础的使用
'123'.replace('1', 'A') // 'A23'
'lalala 2Away0x2'.replace(/2(.*)2/, '$1') // 'lalala Away0x'

// trim
const trim = str => str.replace(/(^\s*)|(\s*$)/g, '')

trim('  abc    ') // 'abc'

// format
const format = str =>
    (...args) =>
        str.replace(/{(\d+)}/g, (match, p) => args[p] || '')

format('lalal{0}wowowo{1}hahah{2}')('-A-', '-B-', '-C') // lala-A-wowo-B-haha-C
```

### 原理
先在模板中预留占位( {{填充数据}} )，再将对应的数据填入

### 实现
要求1: 可填充简单数据
```javascript
const tpl = (str, data) => str.replace(/{{(.*)}}/g, (match, p) => data[p])
tpl('<div>{{data}}</div>', {data: 'tpl'}) // '<div>tpl</div>'
```

要求2: 可填充嵌套数据
```javascript
// 可根据占位符 {{data.a}} 中的 . 来获得数据的依赖路径，从而得到对应的数据
// 由于 使用 "." 连接，所以其前后应为合法的变量名，因此需重新构造正则
/* 合法变量名
*    - 开头可为字符和少量特殊字符: [a-zA-Z$_]
*    - 余部还可是数字:            [a-zA-Z$_0-9]
*/
// 除开头外还需匹配 连接符 "." ,因此最终正则为: /{{([a-zA-Z$_][a-zA-Z$_0-9\.]*)}}/g
function tpl (str, data) {
    const reg = /{{([a-zA-Z$_][a-zA-Z$_0-9\.]*)}}/g

    // 全局匹配模式下，replace 的回调在每次匹配时都会执行,
    // p 为占位符中的变量,该例为 data.a
    return str.replace(reg, (match, p) => {
        const paths = p.split('.') // ['data', 'a']
        let result  = data

        while (paths.length > 0)
            result = result[ paths.shift() ] // 得到路径最末端的数据
        return String(result) || match // 需转成字符串，因为可能遇到 0, null 等数据
    })
}
tpl('<div>{{data.a}}</div>', {data: {a: 'tpl'}}) // '<div>tpl</div>'
```

最终代码:
```javascript
function tpl (str, data) {
    const reg = /{{([a-zA-Z$_][a-zA-Z$_0-9\.]*)}}/g

    return str.replace(reg, (match, p) => {
        const paths = p.split('.')
        let result  = data

        while (paths.length > 0)
            result = result[ paths.shift() ]
        return String(result) || match
    })
}
```

### 优缺点
- 优点: 简单
- 缺点: 无法在模板中使用表达式，所有数据都得事先计算好再填入，且填充的数据应为基础类型，灵活性差，难以满足复杂的需求

### 资料
[详细语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace)

***

## es6 模板字符串
### 介绍
- 模板字符串是 es6 中我最爱的特性啦！比起传统模板引擎，我更喜欢用模板字符串来编写组件
- 模板字符串包裹在 反引号(Esc按钮下面那个) 中，其中可通过 ${} 的语法进行插值
```javascript
// 特性一:多行
`123123
 23213`

// 特性二: 字符串中可插值（强大的不要不要的）
/* 作为一门伪函数式编程语言，js 的很多语法都可以返回数据:
*    - 表达式: 各种运算符表达式，三目(可用来替代简单的判断语句)
*    - 函数:  封装各种复杂的逻辑，最后返回一个值即可
*    - 方法:  如一些有返回值的数据方法
*       - 最强大的如数组的 map, filter ...
*/
// 以下字符串都等于 '123tpl456'
const str1 = `123${'tpl'}456`
const str2 = `123${false || 'tpl'}456`
const str3 = `123${true ? 'tpl' : ''}456`
const str4 = `123${ (function () {return 'tpl'}()) }456`
const fn = () => 'tpl'
const str5 = `123${ fn() }456`
const str6 = `123${
    ['T', 'P', 'L'].map(s => s.toLowerCase()).join('')
}456`
console.log([str1, str2, str3, str4, str5, str6].every(s => s === '123tpl456'))

// 特性三: 模板函数 (个人很少用到)
var a = 5, b = 10
function tag (strArr, ...vals) {
    console.log(strArr, vals)
}
tag`Hello ${ a + b } world ${a * b}`
// strArr => ['Hello ', ' world ', '']
// vals   => [15, 30]  (${}里的值)
```

### 案例
- 由于直接用模板字符串当模板引擎了，所以就直接写个组件吧
    - [演示](http://codepen.io/Away0x/pen/dvEGpL)
    - [代码](https://github.com/Away0x/learning-template/blob/master/src/tplstr.pagination/page.js)
- 用这种方法写模板需注意的是一定要细分组件(很函数式，有种写 jsx 的既视感)

### 资料
- [详细语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/template_strings)
- [相关文章](http://www.pdosgk.com/index.php/home/news/show/id/80442.html)

***

## new Function
### 介绍

### 原理

### 实现
- 测试了下，我们这个 模板工具 的性能略优于 underscore.template，但比 Mustache 要差一些
- [演示]http://codepen.io/Away0x/pen/JWqgLw)
- [代码](https://github.com/Away0x/learning-template/blob/master/src/eval/tpl.js)

### 资料
- [详细语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function)
- [只有20行Javascript代码！手把手教你写一个页面模板引擎](http://blog.jobbole.com/56689/)

***

[完整代码 github](https://github.com/Away0x/learning-template)
