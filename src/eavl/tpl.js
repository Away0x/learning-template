const Filters = {
    upper: str => str.toUpperCase(),
    lower: str => str.toLowerCase(),
    reverse: str => str.split('').reverse().join(''),
    escape: str => string.replace(/&(?!\w+;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}
// /([\\s\\S]+?)/
class Tpl {
    constructor (config={}) {
        const defaultConfig = {
            signs: {
                varSign:       ['{{', '}}'],    // 变量/表达式/过滤器
            	evalSign:      ['{@', '@}'],    // 语句
                endEvalSign:   ['{/@', '@}'],   // 语法模式结束语句
                commentSign:   ['<!--', '-->'], // 普通注释
                noCommentSign: ['{#', '#}']     // 忽略注释
            },
            syntax: false                       // 语法模式
        }

        this.config = Object.assign({}, defaultConfig, config)
        // ['{{', '}}'] => /{{([\\s\\S]+?)}}/g 构造正则
        Object.keys(this.config.signs).forEach(key => {
            this.config.signs[key].splice(1, 0, '(.+?)')
            this.config.signs[key] = new RegExp(this.config.signs[key].join(''), 'g')
        })
    }
    // 语法模式
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
    // 模板解析
    _compile (str, data){
		const tpl = str.replace(/\n/g, '')
            // 注释
    		.replace( this.config.signs.noCommentSign, () => '')
    		.replace( this.config.signs.commentSign, (match, p) => {
                const exp = p.replace(/[\{\<\}\>]/g, match => `&*&${match.charCodeAt()}&*&`)
    			return `'+'<!-- ${exp} -->'+'`
    		})
            // 表达式
    		.replace( this.config.signs.varSign, (match, p) => {
                const filterIndex = p.indexOf('|')
                let val = p

                if (filterIndex !== -1) { // 有过滤器
                    const
                        arr     = val.split('|').map(s => s.trim()),
                        filters = arr.slice(1) || [],
                        oldVal  = arr[0]

                    val = filters.reduce((curVal, filterName) => {
                        if ( ! Filters[filterName] ) {
                            throw new Error(`没有 ${filterName} 过滤器`)
                            return
                        }

                        return `Filters['${filterName}'](${curVal})`
                    }, oldVal)
                }
                return `'+(${val})+'`
            })
            // 语句
    		.replace( this.config.signs.evalSign, (match, p) => {
                let  exp = p.replace('&gt;', '>').replace('&lt;', '<')
                                           // 语法模式
                exp = this.config.syntax ? this._syntax(exp) : exp
    			return `'; ${exp}; tpl += '`
    		})
            // 语法模式(结束标签)
            .replace( this.config.signs.endEvalSign, () => "'} tpl += '")
            .replace(/\&\*\&(.*?)\&\*\&/g, (match, p) =>  String.fromCharCode(p))

		return new Function('data', `var tpl='${tpl}'; return tpl;`)(data)
	}
    // 入口
    compile (tplStr, data) {
        try {
            return this._compile(tplStr, data)
        }
        catch (err) {
            console.warn(err)
            console.trace()
        }
    }
}

function tpl (config) {
    return new Tpl(config)
}
