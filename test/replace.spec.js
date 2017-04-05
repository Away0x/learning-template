const
    { expect } = require('chai'),
    tpl = require('../src/replace')

describe('replace', () => {
    it('tpl is ok', () => {
        const
            row1  = '<div>{{data}}</div>',
            data1 = { data: 'istpl1' },
            tpl1  = tpl(row1, data1),

            row2  = '<div>{{data.a}}</div>',
            data2 = { data: { a: 'istpl2' } },
            tpl2  = tpl(row2, data2),

            row3  = '<div>{{data.a.aa}}</div>',
            data3 = { data: { a: { aa: 'istpl3' } } },
            tpl3  = tpl(row3, data3),

            row4  = '<div>{{data}}</div>',
            data4 = { data: 0 },
            tpl4  = tpl(row4, data4),

            row5  = '<div>{{data}}</div>',
            data5 = { data: null },
            tpl5  = tpl(row5, data5)

            row6  = '<div>{{data}}</div>',
            data6 = { data: '' },
            tpl6  = tpl(row6, data6),

            row7  = '<div>{{data1}}</div><div>{{data2.b.bb}}</div>',
            data7 = { data1: 'data1', data2: { b: { bb: 'data2' } } },
            tpl7  = tpl(row7, data7)

        expect(tpl1).to.equal('<div>istpl1</div>')
        expect(tpl2).to.equal('<div>istpl2</div>')
        expect(tpl3).to.equal('<div>istpl3</div>')
        expect(tpl4).to.equal('<div>0</div>')
        expect(tpl5).to.equal('<div>null</div>')
        expect(tpl6).to.equal('<div>{{data}}</div>')
        expect(tpl7).to.equal('<div>data1</div><div>data2</div>')
    })
})
