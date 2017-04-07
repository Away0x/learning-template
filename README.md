# 从零开始实现前端模板引擎

##

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
- Function 是 js 提供的一个用于构造 Function 对象的构造函数
- 使用:
    ```javascript
    // 普通函数
    function log (user, msg) {
        console.log(user, msg)
    }
    log('Away0x', 'lalala')
    // Function 构造函数
    const log = new Function('user', 'msg', 'console.log(user, msg)')
    log('Away0x', 'lalala')
    ```

### 实现
- 大多数前端模板引擎都是用这种方式实现的，其原理在于运用了 js Function 对象可将字符串解析为函数的能力。
- 一个普通模板引擎的工作步骤大致如下:
```javascript
// 1. 编写模板
{@ if( data.con > 20 ) { @}
    <p>ifififififif</p>
{@ } else { @}
    <p>elseelseelseelse</p>
{@ } @}
// 2. 由模板生成函数体字符串
const functionbody = `
    var tpl = ''
    if (data.con > 20) {
        tpl += '<p>ifififififif</p>'
    } else {
        tpl += '<p>ifififififif</p>'
    }
    return tpl
`
// 3. 通过 Function 解析字符串并生成函数
new Function('data', functionbody)(data)
```
- 由此可见，只要将 {@  @} 里的字符串内容生成 js 语句，而其余内容之前加上 一个 'tpl += ' 即可。
- 实现代码如下:
```javascript
const tpl = (str, data) => {
    const tplStr = str.replace(/\n/g, '')
        .replace(/{{(.+?)}}/g, (match, p) => `'+(${p})+'`)
        .replace(/{@(.+?)@}/g, (match, p) => `'; ${p}; tpl += '`)
    // console.log(tplStr)
    return new Function('data', `var tpl='${tplStr}'; return tpl;`)(data)
}
// 测试
const str = `
    {@ if( data.con > 20 ) { @}
        <p>ifififififif</p>
    {@ } else { @}
        <p>elseelseelseelse</p>
    {@ } @}

    {@ for(var i = 0; i < data.list.length; i++) { @}
    	<p>{{i }} : {{ data.list[i] }}</p>
    {@ } @}
`
const data = {con:21, list: [1,2,3,4,5,76,87,8]}
console.log( tpl(str, data) )
// <p>ifififififif</p>
// <p>0 : 1</p><p>1 : 2</p><p>2 : 3</p><p>3 : 4</p><p>4 : 5</p><p>5 : 76</p><p>6 : 87</p><p>7 : 8</p>
```
ok, 一个最最简单的模板引擎就已经完成了，支持在模板中嵌入 js 语句，虽然只有不到10行，但还是挺强大的对不。

### 拓展
#### 实现模板类
为了能够更好的使用，将前面的代码抽成一个类。
- 需求:
    - 标识符格式有可能和后端模板引擎冲突，因此应实现成可配置的
    - {@  @}: 用于嵌套逻辑语句
    - {{  }}: 用于嵌套变量或表达式
    - 在模板中应能添加注释，注释有两种:
        - <!-- -->: 会输出
        - {#  #}: 这种注释会在编译时被忽略，即只在模板中可见
```javascript
class Tpl {
    constructor (config) {
        const defaultConfig = {
            signs: {
                varSign:       ['{{', '}}'],    // 变量/表达式
            	evalSign:      ['{@', '@}'],    // 语句
                commentSign:   ['<!--', '-->'], // 普通注释
                noCommentSign: ['{#', '#}']     // 忽略注释
            }
        }
        // 可通过配置来修改标识符
        this.config = Object.assign({}, defaultConfig, config)
        // ['{{', '}}'] => /{{([\\s\\S]+?)}}/g 构造正则
        Object.keys(this.config.signs).forEach(key => {
            this.config.signs[key].splice(1, 0, '(.+?)')
            this.config.signs[key] = new RegExp(this.config.signs[key].join(''), 'g')
        })
    }
    // 模板解析
    _compile (str, data){
		const tpl = str.replace(/\n/g, '')
            // 注释
    		.replace( this.config.signs.noCommentSign, () => '')
    		.replace( this.config.signs.commentSign, (match, p) => `'+'<!-- ${p} -->'+'`)
            // 表达式/变量
    		.replace( this.config.signs.varSign, (match, p) => `'+(${p})+'`)
            // 语句
    		.replace( this.config.signs.evalSign, (match, p) => {
                let  exp = p.replace('&gt;', '>').replace('&lt;', '<')
    			return `'; ${exp}; tpl += '`
    		})

		return new Function('data', `var tpl='${tpl}'; return tpl;`)(data)
	}
    // 入口
    compile (tplStr, data) { return this._compile(tplStr, data) }
}

function tpl (config) {
    return new Tpl(config)
}

console.log( tpl().compile(str, data) ) // 得到
```

#### 注释的 BUG
上面的代码在解析一些特殊模板注释(如下)时会出错
```javascript
<!-- {{a}} -->
// 由于注释中有标识符，因此会将 a 作为变量解析，会报未定义错误
```
- 解决:
    - 在解析注释时，如注释里有标识符，则将其先替换成其他符号，等语句变量的解析完成时，再替换回来
    ```javascript
    .replace( this.config.signs.commentSign, (match, p) => {
        const exp = p.replace(/[\{\<\}\>]/g, match => `&*&${match.charCodeAt()}&*&`)
        return `'+'<!-- ${exp} -->'+'`
    })
    // ... 解析变量和语句
    .replace(/\&\*\&(.*?)\&\*\&/g, (match, p) =>  String.fromCharCode(p))
    ```

#### 语法模式
在模板里写 js 好烦呀，各种 '{' 乱飞，有些模板提供了更好看的语法：
```javascript
{@ if data.con > 20 @} // if (data.con > 20) {
    <p>ifififififif</p>
{@ elif data.con === 20 @} // } else if (data.con === 20) {
    <p>elseelseelseelseifififififif</p>
{@ else @} // } else {
    <p>elseelseelseelse</p>
{/@ if @} // }
// for (var index = 0; index < data.list.length; index++) { var item = data.list[index]
{@ each data.list as item @}
    <p>循环 {{ index + 1 }} 次: {{ item }}</p>
{/@ each @}
```
其实就是在解析语句时多做一些处理而已:
```javascript
// 配置中增加 syntax 属性，默认 false, 其为 true 是开启 语法模式
// 配置中增加语法模式结束语句的标识符: endEvalSign: ['{/@', '@}']
// 给 Tpl 嘞添加方法，用于 语法模式 的语句解析
_syntax (str) {
    const arr = str.trim().split(/\s+/)
    let exp = str

    if (arr[0] === 'if') {
        // if (xx) {
        exp = `if ( ${arr.slice(1).join(' ')} ) {`
    } else if (arr[0] === 'else') {
        // } else {
        exp = '} else {'
    } else if (arr[0] === 'elif') {
        // } else if (xx) {
        exp = `} else if ( ${arr.slice(1).join(' ')} ) {`
    } else if (arr[0] === 'each') {
        // for (var index = 0, len = xx.length; index < len; index++) {
        exp = `for (var index = 0, len = ${arr[1]}.length; index < len; index++) {var item = ${arr[1]}[index]`
    }

    return exp
}
// 修改 _compile 解析语句的 replace
.replace( this.config.signs.evalSign, (match, p) => {
    let  exp = p.replace('&gt;', '>').replace('&lt;', '<')
                               // 语法模式
    exp = this.config.syntax ? this._syntax(exp) : exp
    return `'; ${exp}; tpl += '`
})
// 增加结束标识的解析 {/@ if @}  {/@ each @}
.replace( this.config.signs.endEvalSign, () => "'} tpl += '")
```

#### 过滤器


- 测试了下，我们这个 模板工具 的性能略优于 underscore.template，但比 Mustache 要差一些
- [演示](http://codepen.io/Away0x/pen/JWqgLw)
- [代码](https://github.com/Away0x/learning-template/blob/master/src/eval/tpl.js)

### 资料
- [详细语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function)
- [只有20行Javascript代码！手把手教你写一个页面模板引擎](http://blog.jobbole.com/56689/)

***

[完整代码 github](https://github.com/Away0x/learning-template)
