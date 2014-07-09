豆瓣电影APP
==========

## 关于

 * 豆瓣 API 权限限制较多，真实数据非常有限，导致只有北美票房榜以及影片信息页为真实数据

## 实现

 * `fox-sidemenu` 为最底层的容器
 * `fox-page` 为实际的页面单元，分别位于`fox-sidemenu-menu` 和 `fox-sidemenu-content` 中
 * 每个页面带独立 `fox-toolbar`，无全局的
 * 样式方面：在 `body` 增加 `douban` 类名，在 css 中以此为命名空间重写组件样式
 * 采用 `fox-template` + `fox-ajax` 实现渲染
 * 多页面采用自带的 `pjax` 功能
 * `pjax` 载入的页面注意事项：
    * `fox-page` 需要添加 `class="main-page"`，确保直接打开页面后导航也能正常工作
    * 建议在 `fox-page` 上添加特定的 css 类，方便作为样式的命名空间，另外内联脚本中访问 DOM 时也可以更准确 
    * 内联脚本有可能在刷新时执行也可能被 `pjax` 载入执行，因此建议做如下判断

    ```javascript
    HTMLImports.ready ? setTimeout(ready,10) : window.addEventListener('HTMLImportsLoaded', ready, false);
    ```
* `fox-template` 隐藏处理：为了防止未渲染的模板被展现出来，默认给 `fox-template` 添加了 `visibility:hidden` 样式，因此其默认为隐藏状态。在其渲染完后，会增加 `fox-template-renderred` 的 class，显示渲染完成的模板；
* `fox-page` loading 状态处理：将 `fox-page` 的 'loading' 属性设置为 `true` 为显示 loading 图标，在 `fox-page` 中通过增加 class 来实现

## 遗留问题

### `fox-sidemenu`

 * 使用手势操作时，ios safari 自带的 `swipe` 手势识别会产生冲突，例如向左划来关闭 sidemenu 可能会触发`前进`操作；
 * 在 sidemenu 打开状态下，点击右侧的内容块时应该屏蔽默认的点击行为(包括swipe)，而仅仅关闭 sidemenu；
 * 点击左侧菜单中的链接时，应该 `pjax` 载入新页面并替换 `fox-sidemenu-content` 中的 `fox-page`

### `fox-slider`

 * 结构和使用过于复杂，应该简化

### `rivetsjs`

 * 不支持传统模板的字符串替换功能
 * binder扩展不便利，例如要实现<a href=“movie.php?id={data.id}”></a>类似的功能需要重新写binder

### pjax

 * 页面中存在脚本时，无法确保脚本的执行在资源都加载完成后，需要实现局部的 'HTMLImportsLoaded' 功能；

### 性能

 * 资源的合并压缩

## 总结

 * foxui 搭框架速度很快；
 * 缺样式组件和布局，例如如何在一个内容块中快速实现两列布局； 
 * 如果有脚手架（多模板）会更加高效
