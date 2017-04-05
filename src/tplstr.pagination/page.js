class Pagination {
    /* CONFIG:
    * currentPage:                   当前页数
    * totalPage:                     总页数
    * howMuchPageButtons:            显示几个页码按钮
    * baseOnCurrentPageButtonOffset: 当前页码前后会展示几个页码按钮
    * canJump:                       是否显示跳转框
    * toPage:                        页面跳转事件
    */
    constructor (config) {
        const
            defaultConfig = {
                currentPage: 1,
                howMuchPageButtons: 5,
                baseOnCurrentPageButtonOffset: 2,
                canJump: true,
                toPage: function () {}
            }

        this.config = Object.assign({}, defaultConfig, config)
    },
    /* BEGIN ---------------------------- 基础 -------------------------------------------- */
    // 首按钮是否禁用
    _headDisabled () { return ! (this.config.currentPage > 1) },
    // 尾按钮是否禁用
    _tailDisabled () { return ! (this.config.currentPage < this.config.totalPage) },
    // 首省略号是否显示
    _headEllipsisShow () {
        const {
            totalPage, howMuchPageButtons, currentPage, baseOnCurrentPageButtonOffset
        } = this.config

        if (totalPage > howMuchPageButtons) {
            if (currentPage > baseOnCurrentPageButtonOffset + 1) return true
        }
    },
    // 尾省略号是否显示
    _tailEllipsisShow () {
        const {
            totalPage, howMuchPageButtons, currentPage, baseOnCurrentPageButtonOffset
        } = this.config

        if (totalPage > howMuchPageButtons) {
            if (totalPage > (currentPage + baseOnCurrentPageButtonOffset)) return true
        }
    },
    // 最终显示的页码按钮数
    _showBunNum () {
        return count_start_and_end_page(
            this.config.currentPage,        this.config.totalPage,
            this.config.howMuchPageButtons, this.config.baseOnCurrentPageButtonOffset
        )
    },
    /* END ---------------------------- 基础 -------------------------------------------- */

    /* BEGIN ---------------------------- 渲染 -------------------------------------------- */
    // 首部按钮
    _renderHeadBtn () {
        return (`
            <span class="Pagination-button" :class="{disable: headDisabled}" @click.stop="toHeadPage">首页</span>
            <span class="Pagination-button" :class="{disable: headDisabled}" @click.stop="toPrevPage">上一页</span>
        `)
    },
    // 渲染主函数
    render () {
        return (`
            <div class="PAGIANTION">
                <!-- 首部按钮 -->
                <span class="Pagination-button" :class="{disable: headDisabled}" @click.stop="toHeadPage">首页</span>
                <span class="Pagination-button" :class="{disable: headDisabled}" @click.stop="toPrevPage">上一页</span>

                <!-- 首部省略号 -->
                <span v-if="headEllipsisShow" class="Pagination-info">...</span>

                <!-- 页码按钮 -->
                <span v-for="i in showBunNum">
                <span v-if="currentPage === i" class="Pagination-button active">{{ i }}</span>
                <span v-else class="Pagination-button" @click.stop="toPage(i)">{{ i }}</span>
                </span>

                <!-- 尾部省略号 -->
                <span v-if="tailEllipsisShow" class="Pagination-info">...</span>

                <!-- 尾部按钮 -->
                <span class="Pagination-button" :class="{disable: tailDisabled}" @click.stop="toNextPage">下一页</span>
                <span class="Pagination-button" :class="{disable: tailDisabled}" @click.stop="toTailPage">尾页</span>
                <span class="Pagination-info">共 {{ totalPage }} 页</span>

                <!-- 跳转按钮 -->
                <span v-if="canJump">
                <span class="Pagination-input">到第 <input type="text" v-model="canJumpNum" @keyup.enter="toPage(canJumpNum)"> 页</span>
                <span class="Pagination-submit" @click.stop="toPage(canJumpNum)">确定</span>
                </span>
            </div>
        `)
    },
    /* END ---------------------------- 渲染 -------------------------------------------- */

    /* BEGIN ---------------------------- 事件 -------------------------------------------- */
    // 跳转页码
    _toPage (page) {
        if (page > this.config.totalPage) return
        this.config.toPage(page)
    },
    // 跳到首页
    _toHeadPage () {
        if ( this._headDisabled() ) return
        this._toPage(1)
    },
    // 跳到上一页
    _toPrevPage() {
      if ( this.headDisabled() ) return
      let currentPage = this.config.currentPage
      this._toPage(--currentPage)
    },
    // 跳到下一页页
    _toNextPage() {
      if ( this.tailDisabled() ) return
      let currentPage = this.config.currentPage
      this._toPage(++currentPage)
    },
    // 跳到尾页
    _toTailPage() {
      if ( this.tailDisabled() ) return
      let currentPage = this.config.totalPage;
      this._toPage(currentPage)
    }
    /* END ---------------------------- 事件 -------------------------------------------- */
}
