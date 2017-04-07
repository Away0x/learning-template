function count_start_and_end_page(currentPage=1, totalPage=1, howMuchPageButtons, baseOnCurrentPageButtonOffset) {
    let startPage, endPage, result = []
    // 当前页码大于偏移量，则起始按钮为 当前页码 - 偏移量
    if (currentPage > baseOnCurrentPageButtonOffset) {
        startPage = currentPage - baseOnCurrentPageButtonOffset
        endPage = ( totalPage > (currentPage + baseOnCurrentPageButtonOffset) )
            ? (currentPage + baseOnCurrentPageButtonOffset)
            : totalPage
    }
    // 当前页码小于偏移量
    else {
        startPage = 1
        endPage = (totalPage > howMuchPageButtons)
            ? howMuchPageButtons
            : totalPage
    }

    if ( (currentPage + baseOnCurrentPageButtonOffset) > totalPage ) {
        startPage = startPage - (currentPage + baseOnCurrentPageButtonOffset - endPage)
    }

    if (startPage <= 0) startPage = 1

    for (let i = startPage; i <= endPage; i++) {
        result.push(i)
    }
    return result // 返回一个区间数组，供生成区间页码按钮
}

function can (boolean, str) {
    return boolean ? str: ''
}
