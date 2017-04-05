/**
 * tpl - 模板函数
 *
 * @param  {String} rowStr 原始字符串模板
 * @param  {Object} data   需填充的数据
 * @return {String}        根据数据生成的字符串
 */
module.exports = function tpl (rowStr, data) {
    const reg = /{{([a-zA-Z$_][a-zA-Z$_0-9\.]*)}}/g

    return rowStr.replace(reg, (match, p1) => {
        const paths = p1.split('.')
        let result  = data

        while (paths.length > 0)
            result = result[ paths.shift() ]
        return String(result) || match
    })
}
