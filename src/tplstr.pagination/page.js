class Pagination {
    /* CONFIG:
    * wrapSelector:                  挂载处
    * currentPage:                   当前页数
    * totalPage:                     总页数
    * howMuchPageButtons:            显示几个页码按钮
    * baseOnCurrentPageButtonOffset: 当前页码前后会展示几个页码按钮
    * canJump:                       是否显示跳转框
    * hasHeadBtn:                    是否显示首页按钮
    * hasTailBtn:                    是否显示尾页按钮
    * toPage:                        页面跳转事件
    */
    constructor (wrapSelector='body') {
        this._defaultConfig = {
            currentPage: 1,
            howMuchPageButtons: 5,
            totalPage: 1,
            baseOnCurrentPageButtonOffset: 2,
            canJump: true,
            hasHeadBtn: true,
            hasTailBtn: true,
            toPage: function () {}
        }
        this.$wrap = document.querySelector(wrapSelector)
        this._bindEvent() // 绑定事件
    }
    /* BEGIN ---------------------------- 基础 -------------------------------------------- */
    // 首按钮是否禁用
    _headDisabled () { return ! (this.config.currentPage > 1) }
    // 尾按钮是否禁用
    _tailDisabled () { return ! (this.config.currentPage < this.config.totalPage) }
    // 首省略号是否显示
    _headEllipsisShow () {
        const {
            totalPage, howMuchPageButtons, currentPage, baseOnCurrentPageButtonOffset
        } = this.config

        if (totalPage > howMuchPageButtons) {
            if (currentPage > baseOnCurrentPageButtonOffset + 1) return true
        }
    }
    // 尾省略号是否显示
    _tailEllipsisShow () {
        const {
            totalPage, howMuchPageButtons, currentPage, baseOnCurrentPageButtonOffset
        } = this.config

        if (totalPage > howMuchPageButtons) {
            if (totalPage > (currentPage + baseOnCurrentPageButtonOffset)) return true
        }
    }
    // 最终显示的页码按钮数
    _showBtnNum () {
        return count_start_and_end_page(
            this.config.currentPage,        this.config.totalPage,
            this.config.howMuchPageButtons, this.config.baseOnCurrentPageButtonOffset
        )
    }
    /* END ---------------------------- 基础 -------------------------------------------- */

    /* BEGIN ---------------------------- 渲染 -------------------------------------------- */
    // 首部按钮
    _renderHeadBtn () {
        const disable = can(this._headDisabled(), 'disable')

        return (`
            <span class="Pagination-button ${disable}" ref="headBtn">首页</span>
            <span class="Pagination-button ${disable}" ref="prevBtn">上一页</span>
        `)
    }
    // 首部省略号
    _renderHeadEllipsis () {
        return (`
            <span class="Pagination-info">...</span>
        `)
    }
    // 页码按钮
    _renderPageBtn (num) {
        return (`
            <span>
                ${
                    (this.config.currentPage === num)
                    ? `<span class="Pagination-button active">${num}</span>`
                    : `<span class="Pagination-button" ref="pageBtn">${num}</span>`
                }
            </span>
        `)
    }
    // 尾部省略号
    _renderTailEllipsis () {
        return (`
            <span class="Pagination-info">...</span>
        `)
    }
    // 尾部按钮
    _renderTailBtn () {
        const disable = can(this._tailDisabled(), 'disable')
        return (`
            <span class="Pagination-button ${disable}" ref="nextBtn">下一页</span>
            <span class="Pagination-button ${disable}" ref="tailBtn">尾页</span>
            <span class="Pagination-info">共 ${this.config.totalPage} 页</span>
        `)
    }
    // 跳转按钮
    _renderJump () {
        return (`
            <span>
                <span class="Pagination-input">到第 <input type="text" ref="jumpInput"> 页</span>
                <span class="Pagination-submit" ref="jumpBtn">确定</span>
            </span>
        `)
    }
    // 渲染主函数
    _render () {
        /* 结构
        * 1. 首部按钮
        * 2. 首部省略号
        * 3. 页码按钮
        * 4. 尾部省略号
        * 5. 尾部按钮
        * 6. 跳转按钮
        */
        return (`
            <div class="PAGIANTION">
                ${ can(this.config.hasHeadBtn, this._renderHeadBtn()) }
                ${ can(this._headEllipsisShow(), this._renderHeadEllipsis()) }
                ${ this._showBtnNum().map(this._renderPageBtn.bind(this)).join('') }
                ${ can(this._tailEllipsisShow(), this._renderTailEllipsis()) }
                ${ can(this.config.hasTailBtn, this._renderTailBtn()) }
                ${ can(this.config.canJump, this._renderJump()) }
            </div>
        `)
    }
    /* END ---------------------------- 渲染 -------------------------------------------- */

    /* BEGIN ---------------------------- DOM -------------------------------------------- */
    render (config) {
        this.config = Object.assign({}, this._defaultConfig, config)

        this.$wrap.innerHTML = this._render()
    }
    // 事件绑定
    _bindEvent () {
        const
            $wrap = this.$wrap,
            headBtn = 'headBtn', prevBtn = 'prevBtn',
            nextBtn = 'nextBtn', tailBtn = 'tailBtn',
            pageBtn = 'pageBtn', jumpBtn = 'jumpBtn', jumpInput = 'jumpInput',
            isEl = ($el, val) => $el.getAttribute('ref') === val,
            delegate = eventType => (childEl, callback, wrap) => {
                (wrap || $wrap).addEventListener(eventType, ev => {
                    if ( ! ev.target || ! isEl(ev.target, childEl)) return
                    callback && callback(ev)
                })
            },
            trim     = val => String(val).trim(),
            getNum   = val => parseInt(trim(val), 10),
            validate = val => {
                const num = getNum(val)

                if (isNaN(num)) {
                    alert('请输入合法的数字')
                    return false
                }

                if (num <= 0 || num > this.config.totalPage) {
                    alert(`请输入 1 ~ ${this.config.totalPage} 以内的数字`)
                    return false
                }

                return true
            },
            delegateClick = delegate('click')

        delegateClick(headBtn, this._toHeadPage.bind(this))
        delegateClick(prevBtn, this._toPrevPage.bind(this))

        delegateClick(pageBtn, ev => {
            this._toPage( parseInt(ev.target.textContent) )
        })

        delegateClick(nextBtn, this._toNextPage.bind(this))
        delegateClick(tailBtn, this._toTailPage.bind(this))

        delegateClick(jumpBtn, ev => {
            const
                $text = $wrap.querySelector(`[ref=${jumpInput}]`),
                page = $text.value

            $text.value = ''
            if ( ! validate(page) ) return

            this._toPage( getNum(page) )
        })
        delegate('keydown')(jumpInput, ev => {
            const
                $text = ev.target,
                page = $text.value

            if ( (ev.keyCode !== 13) ) return
            $text.value = ''
            if ( ! validate(page) ) return

            this._toPage( getNum(page) )
        })
    }
    /* END ---------------------------- DOM -------------------------------------------- */

    /* BEGIN ---------------------------- 事件 -------------------------------------------- */
    // 跳转页码
    _toPage (page) {
        if (page > this.config.totalPage) return
        this.config.toPage(page)
    }
    // 跳到首页
    _toHeadPage () {
        if ( this._headDisabled() ) return
        this._toPage(1)
    }
    // 跳到上一页
    _toPrevPage() {
      if ( this._headDisabled() ) return
      let currentPage = this.config.currentPage
      this._toPage(--currentPage)
    }
    // 跳到下一页
    _toNextPage() {
      if ( this._tailDisabled() ) return
      let currentPage = this.config.currentPage
      this._toPage(++currentPage)
    }
    // 跳到尾页
    _toTailPage() {
      if ( this._tailDisabled() ) return
      let currentPage = this.config.totalPage;
      this._toPage(currentPage)
    }
    /* END ---------------------------- 事件 -------------------------------------------- */
}

function pagination (wrapSelector) {
    return new Pagination(wrapSelector)
}
