/*!
 * =====================================================
 * Foxui v0.1.0 (https://github.com/foxui/fox-core)
 * Copyright 2014 fex-team
 * Licensed under BSD (https://github.com/foxui/fox-core/blob/master/LICENSE)
 *
 * v0.1.0 designed by @fex-team.
 * =====================================================
 */
/* Zepto v1.1.3 - zepto event ajax form ie - zeptojs.com/license */


var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = function(parent, node) {
    return parent !== node && parent.contains(node)
  }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className,
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        })
    },
    text: function(text){
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = (text === undefined) ? '' : ''+text })
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (value === undefined) ?
        (this[0] && this[0][name]) :
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function(name, value){
      var data = this.attr('data-' + name.replace(capitalRE, '-$1').toLowerCase(), value)
      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return arguments.length === 0 ?
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        ) :
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (this.length==0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0], computedStyle = getComputedStyle(element, '')
        if(!element) return
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(isArray(property) ? property: [property], function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          traverseNode(parent.insertBefore(node, target), function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // items in the collection might not be DOM elements
      if('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else this.each(function(){
        try { this[name]() }
        catch(e) {}
      })
      return this
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred()
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)
    if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var result = [], el
    $([].slice.call(this.get(0).elements)).each(function(){
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto);

// Rivets.js
// version: 0.6.8
// author: Michael Richards
// license: MIT
(function() {
	var Rivets, bindMethod, unbindMethod, _ref, __bind = function(fn, me) {
		return function() {
			return fn.apply(me, arguments);
		};
	}, __indexOf = [].indexOf ||
	function(item) {
		for (var i = 0, l = this.length; i < l; i++) {
			if ( i in this && this[i] === item)
				return i;
		}
		return -1;
	}, __slice = [].slice, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
		for (var key in parent) {
			if (__hasProp.call(parent, key))
				child[key] = parent[key];
		}
		function ctor() {
			this.constructor = child;
		}


		ctor.prototype = parent.prototype;
		child.prototype = new ctor();
		child.__super__ = parent.prototype;
		return child;
	};

	Rivets = {
		binders : {},
		components : {},
		formatters : {},
		adapters : {},
		config : {
			prefix : 'rv',
			templateDelimiters : ['{', '}'],
			rootInterface : '.',
			preloadData : true,
			handler : function(context, ev, binding) {
				return this.call(context, ev, binding.view.models);
			}
		}
	};

	if ('jQuery' in window) {
		_ref = 'on' in jQuery.prototype ? ['on', 'off'] : ['bind', 'unbind'], bindMethod = _ref[0], unbindMethod = _ref[1];
		Rivets.Util = {
			bindEvent : function(el, event, handler) {
				return jQuery(el)[bindMethod](event, handler);
			},
			unbindEvent : function(el, event, handler) {
				return jQuery(el)[unbindMethod](event, handler);
			},
			getInputValue : function(el) {
				var $el;
				$el = jQuery(el);
				if ($el.attr('type') === 'checkbox') {
					return $el.is(':checked');
				} else {
					return $el.val();
				}
			}
		};
	} else {
		Rivets.Util = {
			bindEvent : (function() {
				if ('addEventListener' in window) {
					return function(el, event, handler) {
						return el.addEventListener(event, handler, false);
					};
				}
				return function(el, event, handler) {
					return el.attachEvent('on' + event, handler);
				};
			})(),
			unbindEvent : (function() {
				if ('removeEventListener' in window) {
					return function(el, event, handler) {
						return el.removeEventListener(event, handler, false);
					};
				}
				return function(el, event, handler) {
					return el.detachEvent('on' + event, handler);
				};
			})(),
			getInputValue : function(el) {
				var o, _i, _len, _results;
				if (el.type === 'checkbox') {
					return el.checked;
				} else if (el.type === 'select-multiple') {
					_results = [];
					for ( _i = 0, _len = el.length; _i < _len; _i++) {
						o = el[_i];
						if (o.selected) {
							_results.push(o.value);
						}
					}
					return _results;
				} else {
					return el.value;
				}
			}
		};
	}

	Rivets.View = (function() {
		function View(els, models, options) {
			var k, option, v, _base, _i, _len, _ref1, _ref2, _ref3;
			this.els = els;
			this.models = models;
			this.options = options != null ? options : {};
			this.update = __bind(this.update, this);
			this.publish = __bind(this.publish, this);
			this.sync = __bind(this.sync, this);
			this.unbind = __bind(this.unbind, this);
			this.bind = __bind(this.bind, this);
			this.select = __bind(this.select, this);
			this.build = __bind(this.build, this);
			this.componentRegExp = __bind(this.componentRegExp, this);
			this.bindingRegExp = __bind(this.bindingRegExp, this);
			if (!(this.els.jquery || this.els instanceof Array)) {
				this.els = [this.els];
			}
			_ref1 = ['config', 'binders', 'formatters', 'adapters'];
			for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
				option = _ref1[_i];
				this[option] = {};
				if (this.options[option]) {
					_ref2 = this.options[option];
					for (k in _ref2) {
						v = _ref2[k];
						this[option][k] = v;
					}
				}
				_ref3 = Rivets[option];
				for (k in _ref3) {
					v = _ref3[k];
					if ((_base = this[option])[k] == null) {
						_base[k] = v;
					}
				}
			}
			this.build();
		}


		View.prototype.bindingRegExp = function() {
			return new RegExp("^" + this.config.prefix + "-");
		};

		View.prototype.componentRegExp = function() {
			return new RegExp("^" + (this.config.prefix.toUpperCase()) + "-");
		};

		View.prototype.build = function() {
			var bindingRegExp, buildBinding, componentRegExp, el, parse, skipNodes, _i, _len, _ref1, _this = this;
			this.bindings = [];
			skipNodes = [];
			bindingRegExp = this.bindingRegExp();
			componentRegExp = this.componentRegExp();
			buildBinding = function(binding, node, type, declaration) {
				var context, ctx, dependencies, keypath, options, pipe, pipes;
				options = {};
				pipes = (function() {
					var _i, _len, _ref1, _results;
					_ref1 = declaration.split('|');
					_results = [];
					for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
						pipe = _ref1[_i];
						_results.push(pipe.trim());
					}
					return _results;
				})();
				context = (function() {
					var _i, _len, _ref1, _results;
					_ref1 = pipes.shift().split('<');
					_results = [];
					for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
						ctx = _ref1[_i];
						_results.push(ctx.trim());
					}
					return _results;
				})();
				keypath = context.shift();
				options.formatters = pipes;
				if ( dependencies = context.shift()) {
					options.dependencies = dependencies.split(/\s+/);
				}
				return _this.bindings.push(new Rivets[binding](_this, node, type, keypath, options));
			};
			parse = function(node) {
				var attribute, attributes, binder, childNode, delimiters, identifier, n, parser, regexp, text, token, tokens, type, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref1, _ref2, _ref3, _ref4, _ref5, _results;
				if (__indexOf.call(skipNodes, node) < 0) {
					if (node.nodeType === 3) {
						parser = Rivets.TextTemplateParser;
						if ( delimiters = _this.config.templateDelimiters) {
							if (( tokens = parser.parse(node.data, delimiters)).length) {
								if (!(tokens.length === 1 && tokens[0].type === parser.types.text)) {
									for ( _i = 0, _len = tokens.length; _i < _len; _i++) {
										token = tokens[_i];
										text = document.createTextNode(token.value);
										node.parentNode.insertBefore(text, node);
										if (token.type === 1) {
											buildBinding('TextBinding', text, null, token.value);
										}
									}
									node.parentNode.removeChild(node);
								}
							}
						}
					} else if (componentRegExp.test(node.tagName)) {
						type = node.tagName.replace(componentRegExp, '').toLowerCase();
						_this.bindings.push(new Rivets.ComponentBinding(_this, node, type));
					} else if (node.attributes != null) {
						_ref1 = node.attributes;
						for ( _j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
							attribute = _ref1[_j];
							if (bindingRegExp.test(attribute.name)) {
								type = attribute.name.replace(bindingRegExp, '');
								if (!( binder = _this.binders[type])) {
									_ref2 = _this.binders;
									for (identifier in _ref2) {
										value = _ref2[identifier];
										if (identifier !== '*' && identifier.indexOf('*') !== -1) {
											regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
											if (regexp.test(type)) {
												binder = value;
											}
										}
									}
								}
								binder || ( binder = _this.binders['*']);
								if (binder.block) {
									_ref3 = node.childNodes;
									for ( _k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
										n = _ref3[_k];
										skipNodes.push(n);
									}
									attributes = [attribute];
								}
							}
						}
						_ref4 = attributes || node.attributes;
						for ( _l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
							attribute = _ref4[_l];
							if (bindingRegExp.test(attribute.name)) {
								type = attribute.name.replace(bindingRegExp, '');
								buildBinding('Binding', node, type, attribute.value);
							}
						}
					}
					_ref5 = (function() {
						var _len4, _n, _ref5, _results1;
						_ref5 = node.childNodes;
						_results1 = [];
						for ( _n = 0, _len4 = _ref5.length; _n < _len4; _n++) {
							n = _ref5[_n];
							_results1.push(n);
						}
						return _results1;
					})();
					_results = [];
					for ( _m = 0, _len4 = _ref5.length; _m < _len4; _m++) {
						childNode = _ref5[_m];
						_results.push(parse(childNode));
					}
					return _results;
				}
			};
			_ref1 = this.els;
			for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
				el = _ref1[_i];
				parse(el);
			}
		};

		View.prototype.select = function(fn) {
			var binding, _i, _len, _ref1, _results;
			_ref1 = this.bindings;
			_results = [];
			for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
				binding = _ref1[_i];
				if (fn(binding)) {
					_results.push(binding);
				}
			}
			return _results;
		};

		View.prototype.bind = function() {
			var binding, _i, _len, _ref1, _results;
			_ref1 = this.bindings;
			_results = [];
			for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
				binding = _ref1[_i];
				_results.push(binding.bind());
			}
			return _results;
		};

		View.prototype.unbind = function() {
			var binding, _i, _len, _ref1, _results;
			_ref1 = this.bindings;
			_results = [];
			for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
				binding = _ref1[_i];
				_results.push(binding.unbind());
			}
			return _results;
		};

		View.prototype.sync = function() {
			var binding, _i, _len, _ref1, _results;
			_ref1 = this.bindings;
			_results = [];
			for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
				binding = _ref1[_i];
				_results.push(binding.sync());
			}
			return _results;
		};

		View.prototype.publish = function() {
			var binding, _i, _len, _ref1, _results;
			_ref1 = this.select(function(b) {
				return b.binder.publishes;
			});
			_results = [];
			for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
				binding = _ref1[_i];
				_results.push(binding.publish());
			}
			return _results;
		};

		View.prototype.update = function(models) {
			var binding, key, model, _i, _len, _ref1, _results;
			if (models == null) {
				models = {};
			}
			for (key in models) {
				model = models[key];
				this.models[key] = model;
			}
			_ref1 = this.bindings;
			_results = [];
			for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
				binding = _ref1[_i];
				_results.push(binding.update(models));
			}
			return _results;
		};

		return View;

	})();

	Rivets.Binding = (function() {
		function Binding(view, el, type, keypath, options) {
			this.view = view;
			this.el = el;
			this.type = type;
			this.keypath = keypath;
			this.options = options != null ? options : {};
			this.update = __bind(this.update, this);
			this.unbind = __bind(this.unbind, this);
			this.bind = __bind(this.bind, this);
			this.publish = __bind(this.publish, this);
			this.sync = __bind(this.sync, this);
			this.set = __bind(this.set, this);
			this.eventHandler = __bind(this.eventHandler, this);
			this.formattedValue = __bind(this.formattedValue, this);
			this.setBinder = __bind(this.setBinder, this);
			this.formatters = this.options.formatters || [];
			this.dependencies = [];
			this.model =
			void 0;
			this.setBinder();
		}


		Binding.prototype.setBinder = function() {
			var identifier, regexp, value, _ref1;
			if (!(this.binder = this.view.binders[this.type])) {
				_ref1 = this.view.binders;
				for (identifier in _ref1) {
					value = _ref1[identifier];
					if (identifier !== '*' && identifier.indexOf('*') !== -1) {
						regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
						if (regexp.test(this.type)) {
							this.binder = value;
							this.args = new RegExp("^" + (identifier.replace('*', '(.+)')) + "$").exec(this.type);
							this.args.shift();
						}
					}
				}
			}
			this.binder || (this.binder = this.view.binders['*']);
			if (this.binder instanceof Function) {
				return this.binder = {
					routine : this.binder
				};
			}
		};

		Binding.prototype.formattedValue = function(value) {
			var args, formatter, id, _i, _len, _ref1;
			_ref1 = this.formatters;
			for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
				formatter = _ref1[_i];
				args = formatter.split(/\s+/);
				id = args.shift();
				formatter = this.view.formatters[id];
				if ((formatter != null ? formatter.read :
				void 0) instanceof Function) {
					value = formatter.read.apply(formatter, [value].concat(__slice.call(args)));
				} else if ( formatter instanceof Function) {
					value = formatter.apply(null, [value].concat(__slice.call(args)));
				}
			}
			return value;
		};

		Binding.prototype.eventHandler = function(fn) {
			var binding, handler;
			handler = ( binding = this).view.config.handler;
			return function(ev) {
				return handler.call(fn, this, ev, binding);
			};
		};

		Binding.prototype.set = function(value) {
			var _ref1;
			value = value instanceof Function && !this.binder["function"] ? this.formattedValue(value.call(this.model)) : this.formattedValue(value);
			return ( _ref1 = this.binder.routine) != null ? _ref1.call(this, this.el, value) :
			void 0;
		};

		Binding.prototype.sync = function() {
			var dependency, observer, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
			if (this.model !== this.observer.target) {
				_ref1 = this.dependencies;
				for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
					observer = _ref1[_i];
					observer.unobserve();
				}
				this.dependencies = [];
				if (((this.model = this.observer.target) != null) && (( _ref2 = this.options.dependencies) != null ? _ref2.length :
				void 0)) {
					_ref3 = this.options.dependencies;
					for ( _j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
						dependency = _ref3[_j];
						observer = new Rivets.Observer(this.view, this.model, dependency, this.sync);
						this.dependencies.push(observer);
					}
				}
			}
			return this.set(this.observer.value());
		};

		Binding.prototype.publish = function() {
			var args, formatter, id, value, _i, _len, _ref1, _ref2, _ref3;
			value = Rivets.Util.getInputValue(this.el);
			_ref1 = this.formatters.slice(0).reverse();
			for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
				formatter = _ref1[_i];
				args = formatter.split(/\s+/);
				id = args.shift();
				if (( _ref2 = this.view.formatters[id]) != null ? _ref2.publish :
				void 0) {
					value = ( _ref3 = this.view.formatters[id]).publish.apply(_ref3, [value].concat(__slice.call(args)));
				}
			}
			return this.observer.publish(value);
		};

		Binding.prototype.bind = function() {
			var dependency, observer, _i, _len, _ref1, _ref2, _ref3;
			if (( _ref1 = this.binder.bind) != null) {
				_ref1.call(this, this.el);
			}
			this.observer = new Rivets.Observer(this.view, this.view.models, this.keypath, this.sync);
			this.model = this.observer.target;
			if ((this.model != null) && (( _ref2 = this.options.dependencies) != null ? _ref2.length :
			void 0)) {
				_ref3 = this.options.dependencies;
				for ( _i = 0, _len = _ref3.length; _i < _len; _i++) {
					dependency = _ref3[_i];
					observer = new Rivets.Observer(this.view, this.model, dependency, this.sync);
					this.dependencies.push(observer);
				}
			}
			if (this.view.config.preloadData) {
				return this.sync();
			}
		};

		Binding.prototype.unbind = function() {
			var observer, _i, _len, _ref1, _ref2;
			if (( _ref1 = this.binder.unbind) != null) {
				_ref1.call(this, this.el);
			}
			this.observer.unobserve();
			_ref2 = this.dependencies;
			for ( _i = 0, _len = _ref2.length; _i < _len; _i++) {
				observer = _ref2[_i];
				observer.unobserve();
			}
			return this.dependencies = [];
		};

		Binding.prototype.update = function(models) {
			var _ref1;
			if (models == null) {
				models = {};
			}
			this.model = this.observer.target;
			return ( _ref1 = this.binder.update) != null ? _ref1.call(this, models) :
			void 0;
		};

		return Binding;

	})();

	Rivets.ComponentBinding = (function(_super) {
		__extends(ComponentBinding, _super);

		function ComponentBinding(view, el, type) {
			var attribute, _i, _len, _ref1, _ref2;
			this.view = view;
			this.el = el;
			this.type = type;
			this.unbind = __bind(this.unbind, this);
			this.bind = __bind(this.bind, this);
			this.update = __bind(this.update, this);
			this.locals = __bind(this.locals, this);
			this.component = Rivets.components[this.type];
			this.attributes = {};
			this.inflections = {};
			_ref1 = this.el.attributes || [];
			for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
				attribute = _ref1[_i];
				if ( _ref2 = attribute.name, __indexOf.call(this.component.attributes, _ref2) >= 0) {
					this.attributes[attribute.name] = attribute.value;
				} else {
					this.inflections[attribute.name] = attribute.value;
				}
			}
		}


		ComponentBinding.prototype.sync = function() {
		};

		ComponentBinding.prototype.locals = function(models) {
			var inverse, key, model, path, result, _i, _len, _ref1, _ref2;
			if (models == null) {
				models = this.view.models;
			}
			result = {};
			_ref1 = this.inflections;
			for (key in _ref1) {
				inverse = _ref1[key];
				_ref2 = inverse.split('.');
				for ( _i = 0, _len = _ref2.length; _i < _len; _i++) {
					path = _ref2[_i];
					result[key] = (result[key] || models)[path];
				}
			}
			for (key in models) {
				model = models[key];
				if (result[key] == null) {
					result[key] = model;
				}
			}
			return result;
		};

		ComponentBinding.prototype.update = function(models) {
			var _ref1;
			return ( _ref1 = this.componentView) != null ? _ref1.update(this.locals(models)) :
			void 0;
		};

		ComponentBinding.prototype.bind = function() {
			var el, _ref1;
			if (this.componentView != null) {
				return ( _ref1 = this.componentView) != null ? _ref1.bind() :
				void 0;
			} else {
				el = this.component.build.call(this.attributes);
				(this.componentView = new Rivets.View(el, this.locals(), this.view.options)).bind();
				return this.el.parentNode.replaceChild(el, this.el);
			}
		};

		ComponentBinding.prototype.unbind = function() {
			var _ref1;
			return ( _ref1 = this.componentView) != null ? _ref1.unbind() :
			void 0;
		};

		return ComponentBinding;

	})(Rivets.Binding);

	Rivets.TextBinding = (function(_super) {
		__extends(TextBinding, _super);

		function TextBinding(view, el, type, keypath, options) {
			this.view = view;
			this.el = el;
			this.type = type;
			this.keypath = keypath;
			this.options = options != null ? options : {};
			this.sync = __bind(this.sync, this);
			this.formatters = this.options.formatters || [];
			this.dependencies = [];
		}


		TextBinding.prototype.binder = {
			routine : function(node, value) {
				return node.data = value != null ? value : '';
			}
		};

		TextBinding.prototype.sync = function() {
			return TextBinding.__super__.sync.apply(this, arguments);
		};

		return TextBinding;

	})(Rivets.Binding);

	Rivets.KeypathParser = (function() {
		function KeypathParser() {
		}


		KeypathParser.parse = function(keypath, interfaces, root) {
			var char, current, index, tokens, _i, _ref1;
			tokens = [];
			current = {
				"interface" : root,
				path : ''
			};
			for ( index = _i = 0, _ref1 = keypath.length; _i < _ref1; index = _i += 1) {
				char = keypath.charAt(index);
				if (__indexOf.call(interfaces, char) >= 0) {
					tokens.push(current);
					current = {
						"interface" : char,
						path : ''
					};
				} else {
					current.path += char;
				}
			}
			tokens.push(current);
			return tokens;
		};

		return KeypathParser;

	})();

	Rivets.TextTemplateParser = (function() {
		function TextTemplateParser() {
		}


		TextTemplateParser.types = {
			text : 0,
			binding : 1
		};

		TextTemplateParser.parse = function(template, delimiters) {
			var index, lastIndex, lastToken, length, substring, tokens, value;
			tokens = [];
			length = template.length;
			index = 0;
			lastIndex = 0;
			while (lastIndex < length) {
				index = template.indexOf(delimiters[0], lastIndex);
				if (index < 0) {
					tokens.push({
						type : this.types.text,
						value : template.slice(lastIndex)
					});
					break;
				} else {
					if (index > 0 && lastIndex < index) {
						tokens.push({
							type : this.types.text,
							value : template.slice(lastIndex, index)
						});
					}
					lastIndex = index + delimiters[0].length;
					index = template.indexOf(delimiters[1], lastIndex);
					if (index < 0) {
						substring = template.slice(lastIndex - delimiters[1].length);
						lastToken = tokens[tokens.length - 1];
						if ((lastToken != null ? lastToken.type :
						void 0) === this.types.text) {
							lastToken.value += substring;
						} else {
							tokens.push({
								type : this.types.text,
								value : substring
							});
						}
						break;
					}
					value = template.slice(lastIndex, index).trim();
					tokens.push({
						type : this.types.binding,
						value : value
					});
					lastIndex = index + delimiters[1].length;
				}
			}
			return tokens;
		};

		return TextTemplateParser;

	})();

	Rivets.Observer = (function() {
		function Observer(view, model, keypath, callback) {
			this.view = view;
			this.model = model;
			this.keypath = keypath;
			this.callback = callback;
			this.unobserve = __bind(this.unobserve, this);
			this.realize = __bind(this.realize, this);
			this.value = __bind(this.value, this);
			this.publish = __bind(this.publish, this);
			this.read = __bind(this.read, this);
			this.set = __bind(this.set, this);
			this.adapter = __bind(this.adapter, this);
			this.update = __bind(this.update, this);
			this.initialize = __bind(this.initialize, this);
			this.parse = __bind(this.parse, this);
			this.parse();
			this.initialize();
		}


		Observer.prototype.parse = function() {
			var interfaces, k, path, root, v, _ref1;
			interfaces = (function() {
				var _ref1, _results;
				_ref1 = this.view.adapters;
				_results = [];
				for (k in _ref1) {
					v = _ref1[k];
					_results.push(k);
				}
				return _results;
			}).call(this);
			if ( _ref1 = this.keypath[0], __indexOf.call(interfaces, _ref1) >= 0) {
				root = this.keypath[0];
				path = this.keypath.substr(1);
			} else {
				root = this.view.config.rootInterface;
				path = this.keypath;
			}
			this.tokens = Rivets.KeypathParser.parse(path, interfaces, root);
			return this.key = this.tokens.pop();
		};

		Observer.prototype.initialize = function() {
			this.objectPath = [];
			this.target = this.realize();
			if (this.target != null) {
				return this.set(true, this.key, this.target, this.callback);
			}
		};

		Observer.prototype.update = function() {
			var next, oldValue;
			if (( next = this.realize()) !== this.target) {
				if (this.target != null) {
					this.set(false, this.key, this.target, this.callback);
				}
				if (next != null) {
					this.set(true, this.key, next, this.callback);
				}
				oldValue = this.value();
				this.target = next;
				if (this.value() !== oldValue) {
					return this.callback();
				}
			}
		};

		Observer.prototype.adapter = function(key) {
			return this.view.adapters[key["interface"]];
		};

		Observer.prototype.set = function(active, key, obj, callback) {
			var action;
			action = active ? 'subscribe' : 'unsubscribe';
			return this.adapter(key)[action](obj, key.path, callback);
		};

		Observer.prototype.read = function(key, obj) {
			return this.adapter(key).read(obj, key.path);
		};

		Observer.prototype.publish = function(value) {
			if (this.target != null) {
				return this.adapter(this.key).publish(this.target, this.key.path, value);
			}
		};

		Observer.prototype.value = function() {
			if (this.target != null) {
				return this.read(this.key, this.target);
			}
		};

		Observer.prototype.realize = function() {
			var current, index, prev, token, unreached, _i, _len, _ref1;
			current = this.model;
			unreached = null;
			_ref1 = this.tokens;
			for ( index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
				token = _ref1[index];
				if (current != null) {
					if (this.objectPath[index] != null) {
						if (current !== ( prev = this.objectPath[index])) {
							this.set(false, token, prev, this.update);
							this.set(true, token, current, this.update);
							this.objectPath[index] = current;
						}
					} else {
						this.set(true, token, current, this.update);
						this.objectPath[index] = current;
					}
					current = this.read(token, current);
				} else {
					if (unreached == null) {
						unreached = index;
					}
					if ( prev = this.objectPath[index]) {
						this.set(false, token, prev, this.update);
					}
				}
			}
			if (unreached != null) {
				this.objectPath.splice(unreached);
			}
			return current;
		};

		Observer.prototype.unobserve = function() {
			var index, obj, token, _i, _len, _ref1;
			_ref1 = this.tokens;
			for ( index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
				token = _ref1[index];
				if ( obj = this.objectPath[index]) {
					this.set(false, token, obj, this.update);
				}
			}
			if (this.target != null) {
				return this.set(false, this.key, this.target, this.callback);
			}
		};

		return Observer;

	})();

	Rivets.binders.text = function(el, value) {
		if (el.textContent != null) {
			return el.textContent = value != null ? value : '';
		} else {
			return el.innerText = value != null ? value : '';
		}
	};

	Rivets.binders.html = function(el, value) {
		return el.innerHTML = value != null ? value : '';
	};

	Rivets.binders.show = function(el, value) {
		return el.style.display = value ? '' : 'none';
	};

	Rivets.binders.hide = function(el, value) {
		return el.style.display = value ? 'none' : '';
	};

	Rivets.binders.enabled = function(el, value) {
		return el.disabled = !value;
	};

	Rivets.binders.disabled = function(el, value) {
		return el.disabled = !!value;
	};

	Rivets.binders.checked = {
		publishes : true,
		bind : function(el) {
			return Rivets.Util.bindEvent(el, 'change', this.publish);
		},
		unbind : function(el) {
			return Rivets.Util.unbindEvent(el, 'change', this.publish);
		},
		routine : function(el, value) {
			var _ref1;
			if (el.type === 'radio') {
				return el.checked = (( _ref1 = el.value) != null ? _ref1.toString() :
				void 0) === (value != null ? value.toString() :
				void 0);
			} else {
				return el.checked = !!value;
			}
		}
	};

	Rivets.binders.unchecked = {
		publishes : true,
		bind : function(el) {
			return Rivets.Util.bindEvent(el, 'change', this.publish);
		},
		unbind : function(el) {
			return Rivets.Util.unbindEvent(el, 'change', this.publish);
		},
		routine : function(el, value) {
			var _ref1;
			if (el.type === 'radio') {
				return el.checked = (( _ref1 = el.value) != null ? _ref1.toString() :
				void 0) !== (value != null ? value.toString() :
				void 0);
			} else {
				return el.checked = !value;
			}
		}
	};

	Rivets.binders.value = {
		publishes : true,
		bind : function(el) {
			return Rivets.Util.bindEvent(el, 'change', this.publish);
		},
		unbind : function(el) {
			return Rivets.Util.unbindEvent(el, 'change', this.publish);
		},
		routine : function(el, value) {
			var o, _i, _len, _ref1, _ref2, _ref3, _results;
			if (window.jQuery != null) {
				el = jQuery(el);
				if ((value != null ? value.toString() :
				void 0) !== (( _ref1 = el.val()) != null ? _ref1.toString() :
				void 0)) {
					return el.val(value != null ? value : '');
				}
			} else {
				if (el.type === 'select-multiple') {
					if (value != null) {
						_results = [];
						for ( _i = 0, _len = el.length; _i < _len; _i++) {
							o = el[_i];
							_results.push(o.selected = ( _ref2 = o.value, __indexOf.call(value, _ref2) >= 0));
						}
						return _results;
					}
				} else if ((value != null ? value.toString() :
				void 0) !== (( _ref3 = el.value) != null ? _ref3.toString() :
				void 0)) {
					return el.value = value != null ? value : '';
				}
			}
		}
	};

	Rivets.binders["if"] = {
		block : true,
		bind : function(el) {
			var attr, declaration;
			if (this.marker == null) {
				attr = [this.view.config.prefix, this.type].join('-').replace('--', '-');
				declaration = el.getAttribute(attr);
				this.marker = document.createComment(" rivets: " + this.type + " " + declaration + " ");
				el.removeAttribute(attr);
				el.parentNode.insertBefore(this.marker, el);
				return el.parentNode.removeChild(el);
			}
		},
		unbind : function() {
			var _ref1;
			return ( _ref1 = this.nested) != null ? _ref1.unbind() :
			void 0;
		},
		routine : function(el, value) {
			var key, model, models, options, _ref1;
			if (!!value === (this.nested == null)) {
				if (value) {
					models = {};
					_ref1 = this.view.models;
					for (key in _ref1) {
						model = _ref1[key];
						models[key] = model;
					}
					options = {
						binders : this.view.options.binders,
						formatters : this.view.options.formatters,
						adapters : this.view.options.adapters,
						config : this.view.options.config
					};
					(this.nested = new Rivets.View(el, models, options)).bind();
					return this.marker.parentNode.insertBefore(el, this.marker.nextSibling);
				} else {
					el.parentNode.removeChild(el);
					this.nested.unbind();
					return
					delete this.nested;
				}
			}
		},
		update : function(models) {
			var _ref1;
			return ( _ref1 = this.nested) != null ? _ref1.update(models) :
			void 0;
		}
	};

	Rivets.binders.unless = {
		block : true,
		bind : function(el) {
			return Rivets.binders["if"].bind.call(this, el);
		},
		unbind : function() {
			return Rivets.binders["if"].unbind.call(this);
		},
		routine : function(el, value) {
			return Rivets.binders["if"].routine.call(this, el, !value);
		},
		update : function(models) {
			return Rivets.binders["if"].update.call(this, models);
		}
	};

	Rivets.binders['on-*'] = {
		"function" : true,
		unbind : function(el) {
			if (this.handler) {
				return Rivets.Util.unbindEvent(el, this.args[0], this.handler);
			}
		},
		routine : function(el, value) {
			if (this.handler) {
				Rivets.Util.unbindEvent(el, this.args[0], this.handler);
			}
			return Rivets.Util.bindEvent(el, this.args[0], this.handler = this.eventHandler(value));
		}
	};

	Rivets.binders['each-*'] = {
		block : true,
		bind : function(el) {
			var attr;
			if (this.marker == null) {
				attr = [this.view.config.prefix, this.type].join('-').replace('--', '-');
				this.marker = document.createComment(" rivets: " + this.type + " ");
				this.iterated = [];
				el.removeAttribute(attr);
				el.parentNode.insertBefore(this.marker, el);
				return el.parentNode.removeChild(el);
			}
		},
		unbind : function(el) {
			var view, _i, _len, _ref1, _results;
			if (this.iterated != null) {
				_ref1 = this.iterated;
				_results = [];
				for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
					view = _ref1[_i];
					_results.push(view.unbind());
				}
				return _results;
			}
		},
		routine : function(el, collection) {
			var binding, data, i, index, k, key, model, modelName, options, previous, template, v, view, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2, _ref3, _ref4, _results;
			modelName = this.args[0];
			collection = collection || [];
			if (this.iterated.length > collection.length) {
				_ref1 = Array(this.iterated.length - collection.length);
				for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
					i = _ref1[_i];
					view = this.iterated.pop();
					view.unbind();
					this.marker.parentNode.removeChild(view.els[0]);
				}
			}
			for ( index = _j = 0, _len1 = collection.length; _j < _len1; index = ++_j) {
				model = collection[index];
				data = {
					index : index
				};
				data[modelName] = model;
				if (this.iterated[index] == null) {
					_ref2 = this.view.models;
					for (key in _ref2) {
						model = _ref2[key];
						if (data[key] == null) {
							data[key] = model;
						}
					}
					previous = this.iterated.length ? this.iterated[this.iterated.length - 1].els[0] : this.marker;
					options = {
						binders : this.view.options.binders,
						formatters : this.view.options.formatters,
						adapters : this.view.options.adapters,
						config : {}
					};
					_ref3 = this.view.options.config;
					for (k in _ref3) {
						v = _ref3[k];
						options.config[k] = v;
					}
					options.config.preloadData = true;
					template = el.cloneNode(true);
					view = new Rivets.View(template, data, options);
					view.bind();
					this.iterated.push(view);
					this.marker.parentNode.insertBefore(template, previous.nextSibling);
				} else if (this.iterated[index].models[modelName] !== model) {
					this.iterated[index].update(data);
				}
			}
			if (el.nodeName === 'OPTION') {
				_ref4 = this.view.bindings;
				_results = [];
				for ( _k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
					binding = _ref4[_k];
					if (binding.el === this.marker.parentNode && binding.type === 'value') {
						_results.push(binding.sync());
					} else {
						_results.push(
						void 0);
					}
				}
				return _results;
			}
		},
		update : function(models) {
			var data, key, model, view, _i, _len, _ref1, _results;
			data = {};
			for (key in models) {
				model = models[key];
				if (key !== this.args[0]) {
					data[key] = model;
				}
			}
			_ref1 = this.iterated;
			_results = [];
			for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
				view = _ref1[_i];
				_results.push(view.update(data));
			}
			return _results;
		}
	};

	Rivets.binders['class-*'] = function(el, value) {
		var elClass;
		elClass = " " + el.className + " ";
		if (!value === (elClass.indexOf(" " + this.args[0] + " ") !== -1)) {
			return el.className = value ? "" + el.className + " " + this.args[0] : elClass.replace(" " + this.args[0] + " ", ' ').trim();
		}
	};
	
	

	Rivets.binders['*'] = function(el, value) {
		if (value != null) {
			return el.setAttribute(this.type, value);
		} else {
			return el.removeAttribute(this.type);
		}
	};

	Rivets.adapters['.'] = {
		id : '_rv',
		counter : 0,
		weakmap : {},
		weakReference : function(obj) {
			var id;
			if (obj[this.id] == null) {
				id = this.counter++;
				this.weakmap[id] = {
					callbacks : {}
				};
				Object.defineProperty(obj, this.id, {
					value : id
				});
			}
			return this.weakmap[obj[this.id]];
		},
		stubFunction : function(obj, fn) {
			var map, original, weakmap;
			original = obj[fn];
			map = this.weakReference(obj);
			weakmap = this.weakmap;
			return obj[fn] = function() {
				var callback, k, r, response, _i, _len, _ref1, _ref2, _ref3, _ref4;
				response = original.apply(obj, arguments);
				_ref1 = map.pointers;
				for (r in _ref1) {
					k = _ref1[r];
					_ref4 = ( _ref2 = ( _ref3 = weakmap[r]) != null ? _ref3.callbacks[k] :
					void 0) != null ? _ref2 : [];
					for ( _i = 0, _len = _ref4.length; _i < _len; _i++) {
						callback = _ref4[_i];
						callback();
					}
				}
				return response;
			};
		},
		observeMutations : function(obj, ref, keypath) {
			var fn, functions, map, _base, _i, _len;
			if (Array.isArray(obj)) {
				map = this.weakReference(obj);
				if (map.pointers == null) {
					map.pointers = {};
					functions = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
					for ( _i = 0, _len = functions.length; _i < _len; _i++) {
						fn = functions[_i];
						this.stubFunction(obj, fn);
					}
				}
				if ((_base = map.pointers)[ref] == null) {
					_base[ref] = [];
				}
				if (__indexOf.call(map.pointers[ref], keypath) < 0) {
					return map.pointers[ref].push(keypath);
				}
			}
		},
		unobserveMutations : function(obj, ref, keypath) {
			var keypaths, _ref1;
			if (Array.isArray(obj && (obj[this.id] != null))) {
				if ( keypaths = ( _ref1 = this.weakReference(obj).pointers) != null ? _ref1[ref] :
				void 0) {
					return keypaths.splice(keypaths.indexOf(keypath), 1);
				}
			}
		},
		subscribe : function(obj, keypath, callback) {
			var callbacks, value, _this = this;
			callbacks = this.weakReference(obj).callbacks;
			if (callbacks[keypath] == null) {
				callbacks[keypath] = [];
				value = obj[keypath];
				Object.defineProperty(obj, keypath, {
					enumerable : true,
					get : function() {
						return value;
					},
					set : function(newValue) {
						var _i, _len, _ref1;
						if (newValue !== value) {
							value = newValue;
							_ref1 = callbacks[keypath];
							for ( _i = 0, _len = _ref1.length; _i < _len; _i++) {
								callback = _ref1[_i];
								callback();
							}
							return _this.observeMutations(newValue, obj[_this.id], keypath);
						}
					}
				});
			}
			if (__indexOf.call(callbacks[keypath], callback) < 0) {
				callbacks[keypath].push(callback);
			}
			return this.observeMutations(obj[keypath], obj[this.id], keypath);
		},
		unsubscribe : function(obj, keypath, callback) {
			var callbacks;
			callbacks = this.weakmap[obj[this.id]].callbacks[keypath];
			callbacks.splice(callbacks.indexOf(callback), 1);
			return this.unobserveMutations(obj[keypath], obj[this.id], keypath);
		},
		read : function(obj, keypath) {
			return obj[keypath];
		},
		publish : function(obj, keypath, value) {
			return obj[keypath] = value;
		}
	};

	Rivets.factory = function(exports) {
		exports._ = Rivets;
		exports.binders = Rivets.binders;
		exports.components = Rivets.components;
		exports.formatters = Rivets.formatters;
		exports.adapters = Rivets.adapters;
		exports.config = Rivets.config;
		exports.configure = function(options) {
			var property, value;
			if (options == null) {
				options = {};
			}
			for (property in options) {
				value = options[property];
				Rivets.config[property] = value;
			}
		};
		return exports.bind = function(el, models, options) {
			var view;
			if (models == null) {
				models = {};
			}
			if (options == null) {
				options = {};
			}
			view = new Rivets.View(el, models, options);
			view.bind();
			return view;
		};
	};

	if ( typeof exports === 'object') {
		Rivets.factory(exports);
	} else if ( typeof define === 'function' && define.amd) {
		define(['exports'], function(exports) {
			Rivets.factory(this.rivets = exports);
			return exports;
		});
	} else {
		Rivets.factory(this.rivets = {});
	}

}).call(this);

// We don't use the platform bootstrapper, so fake this stuff.

window.Platform = {};
var logFlags = {};


// DOMTokenList polyfill for IE9
(function () {

if (typeof window.Element === "undefined" || "classList" in document.documentElement) return;

var prototype = Array.prototype,
    indexOf = prototype.indexOf,
    slice = prototype.slice,
    push = prototype.push,
    splice = prototype.splice,
    join = prototype.join;

function DOMTokenList(el) {
  this._element = el;
  if (el.className != this._classCache) {
    this._classCache = el.className;

    if (!this._classCache) return;

      // The className needs to be trimmed and split on whitespace
      // to retrieve a list of classes.
      var classes = this._classCache.replace(/^\s+|\s+$/g,'').split(/\s+/),
        i;
    for (i = 0; i < classes.length; i++) {
      push.call(this, classes[i]);
    }
  }
};

function setToClassName(el, classes) {
  el.className = classes.join(' ');
}

DOMTokenList.prototype = {
  add: function(token) {
    if(this.contains(token)) return;
    push.call(this, token);
    setToClassName(this._element, slice.call(this, 0));
  },
  contains: function(token) {
    return indexOf.call(this, token) !== -1;
  },
  item: function(index) {
    return this[index] || null;
  },
  remove: function(token) {
    var i = indexOf.call(this, token);
     if (i === -1) {
       return;
     }
    splice.call(this, i, 1);
    setToClassName(this._element, slice.call(this, 0));
  },
  toString: function() {
    return join.call(this, ' ');
  },
  toggle: function(token) {
    if (indexOf.call(this, token) === -1) {
      this.add(token);
    } else {
      this.remove(token);
    }
  }
};

window.DOMTokenList = DOMTokenList;

function defineElementGetter (obj, prop, getter) {
  if (Object.defineProperty) {
    Object.defineProperty(obj, prop,{
      get : getter
    })
  } else {
    obj.__defineGetter__(prop, getter);
  }
}

defineElementGetter(Element.prototype, 'classList', function () {
  return new DOMTokenList(this);
});

})();


/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

if (typeof WeakMap === 'undefined') {
  (function() {
    var defineProperty = Object.defineProperty;
    var counter = Date.now() % 1e9;

    var WeakMap = function() {
      this.name = '__st' + (Math.random() * 1e9 >>> 0) + (counter++ + '__');
    };

    WeakMap.prototype = {
      set: function(key, value) {
        var entry = key[this.name];
        if (entry && entry[0] === key)
          entry[1] = value;
        else
          defineProperty(key, this.name, {value: [key, value], writable: true});
      },
      get: function(key) {
        var entry;
        return (entry = key[this.name]) && entry[0] === key ?
            entry[1] : undefined;
      },
      delete: function(key) {
        this.set(key, undefined);
      }
    };

    window.WeakMap = WeakMap;
  })();
}

/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(global) {

  var registrationsTable = new WeakMap();

  // We use setImmediate or postMessage for our future callback.
  var setImmediate = window.msSetImmediate;

  // Use post message to emulate setImmediate.
  if (!setImmediate) {
    var setImmediateQueue = [];
    var sentinel = String(Math.random());
    window.addEventListener('message', function(e) {
      if (e.data === sentinel) {
        var queue = setImmediateQueue;
        setImmediateQueue = [];
        queue.forEach(function(func) {
          func();
        });
      }
    });
    setImmediate = function(func) {
      setImmediateQueue.push(func);
      window.postMessage(sentinel, '*');
    };
  }

  // This is used to ensure that we never schedule 2 callas to setImmediate
  var isScheduled = false;

  // Keep track of observers that needs to be notified next time.
  var scheduledObservers = [];

  /**
   * Schedules |dispatchCallback| to be called in the future.
   * @param {MutationObserver} observer
   */
  function scheduleCallback(observer) {
    scheduledObservers.push(observer);
    if (!isScheduled) {
      isScheduled = true;
      setImmediate(dispatchCallbacks);
    }
  }

  function wrapIfNeeded(node) {
    return window.ShadowDOMPolyfill &&
        window.ShadowDOMPolyfill.wrapIfNeeded(node) ||
        node;
  }

  function dispatchCallbacks() {
    // http://dom.spec.whatwg.org/#mutation-observers

    isScheduled = false; // Used to allow a new setImmediate call above.

    var observers = scheduledObservers;
    scheduledObservers = [];
    // Sort observers based on their creation UID (incremental).
    observers.sort(function(o1, o2) {
      return o1.uid_ - o2.uid_;
    });

    var anyNonEmpty = false;
    observers.forEach(function(observer) {

      // 2.1, 2.2
      var queue = observer.takeRecords();
      // 2.3. Remove all transient registered observers whose observer is mo.
      removeTransientObserversFor(observer);

      // 2.4
      if (queue.length) {
        observer.callback_(queue, observer);
        anyNonEmpty = true;
      }
    });

    // 3.
    if (anyNonEmpty)
      dispatchCallbacks();
  }

  function removeTransientObserversFor(observer) {
    observer.nodes_.forEach(function(node) {
      var registrations = registrationsTable.get(node);
      if (!registrations)
        return;
      registrations.forEach(function(registration) {
        if (registration.observer === observer)
          registration.removeTransientObservers();
      });
    });
  }

  /**
   * This function is used for the "For each registered observer observer (with
   * observer's options as options) in target's list of registered observers,
   * run these substeps:" and the "For each ancestor ancestor of target, and for
   * each registered observer observer (with options options) in ancestor's list
   * of registered observers, run these substeps:" part of the algorithms. The
   * |options.subtree| is checked to ensure that the callback is called
   * correctly.
   *
   * @param {Node} target
   * @param {function(MutationObserverInit):MutationRecord} callback
   */
  function forEachAncestorAndObserverEnqueueRecord(target, callback) {
    for (var node = target; node; node = node.parentNode) {
      var registrations = registrationsTable.get(node);

      if (registrations) {
        for (var j = 0; j < registrations.length; j++) {
          var registration = registrations[j];
          var options = registration.options;

          // Only target ignores subtree.
          if (node !== target && !options.subtree)
            continue;

          var record = callback(options);
          if (record)
            registration.enqueue(record);
        }
      }
    }
  }

  var uidCounter = 0;

  /**
   * The class that maps to the DOM MutationObserver interface.
   * @param {Function} callback.
   * @constructor
   */
  function JsMutationObserver(callback) {
    this.callback_ = callback;
    this.nodes_ = [];
    this.records_ = [];
    this.uid_ = ++uidCounter;
  }

  JsMutationObserver.prototype = {
    observe: function(target, options) {
      target = wrapIfNeeded(target);

      // 1.1
      if (!options.childList && !options.attributes && !options.characterData ||

          // 1.2
          options.attributeOldValue && !options.attributes ||

          // 1.3
          options.attributeFilter && options.attributeFilter.length &&
              !options.attributes ||

          // 1.4
          options.characterDataOldValue && !options.characterData) {

        throw new SyntaxError();
      }

      var registrations = registrationsTable.get(target);
      if (!registrations)
        registrationsTable.set(target, registrations = []);

      // 2
      // If target's list of registered observers already includes a registered
      // observer associated with the context object, replace that registered
      // observer's options with options.
      var registration;
      for (var i = 0; i < registrations.length; i++) {
        if (registrations[i].observer === this) {
          registration = registrations[i];
          registration.removeListeners();
          registration.options = options;
          break;
        }
      }

      // 3.
      // Otherwise, add a new registered observer to target's list of registered
      // observers with the context object as the observer and options as the
      // options, and add target to context object's list of nodes on which it
      // is registered.
      if (!registration) {
        registration = new Registration(this, target, options);
        registrations.push(registration);
        this.nodes_.push(target);
      }

      registration.addListeners();
    },

    disconnect: function() {
      this.nodes_.forEach(function(node) {
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          var registration = registrations[i];
          if (registration.observer === this) {
            registration.removeListeners();
            registrations.splice(i, 1);
            // Each node can only have one registered observer associated with
            // this observer.
            break;
          }
        }
      }, this);
      this.records_ = [];
    },

    takeRecords: function() {
      var copyOfRecords = this.records_;
      this.records_ = [];
      return copyOfRecords;
    }
  };

  /**
   * @param {string} type
   * @param {Node} target
   * @constructor
   */
  function MutationRecord(type, target) {
    this.type = type;
    this.target = target;
    this.addedNodes = [];
    this.removedNodes = [];
    this.previousSibling = null;
    this.nextSibling = null;
    this.attributeName = null;
    this.attributeNamespace = null;
    this.oldValue = null;
  }

  function copyMutationRecord(original) {
    var record = new MutationRecord(original.type, original.target);
    record.addedNodes = original.addedNodes.slice();
    record.removedNodes = original.removedNodes.slice();
    record.previousSibling = original.previousSibling;
    record.nextSibling = original.nextSibling;
    record.attributeName = original.attributeName;
    record.attributeNamespace = original.attributeNamespace;
    record.oldValue = original.oldValue;
    return record;
  };

  // We keep track of the two (possibly one) records used in a single mutation.
  var currentRecord, recordWithOldValue;

  /**
   * Creates a record without |oldValue| and caches it as |currentRecord| for
   * later use.
   * @param {string} oldValue
   * @return {MutationRecord}
   */
  function getRecord(type, target) {
    return currentRecord = new MutationRecord(type, target);
  }

  /**
   * Gets or creates a record with |oldValue| based in the |currentRecord|
   * @param {string} oldValue
   * @return {MutationRecord}
   */
  function getRecordWithOldValue(oldValue) {
    if (recordWithOldValue)
      return recordWithOldValue;
    recordWithOldValue = copyMutationRecord(currentRecord);
    recordWithOldValue.oldValue = oldValue;
    return recordWithOldValue;
  }

  function clearRecords() {
    currentRecord = recordWithOldValue = undefined;
  }

  /**
   * @param {MutationRecord} record
   * @return {boolean} Whether the record represents a record from the current
   * mutation event.
   */
  function recordRepresentsCurrentMutation(record) {
    return record === recordWithOldValue || record === currentRecord;
  }

  /**
   * Selects which record, if any, to replace the last record in the queue.
   * This returns |null| if no record should be replaced.
   *
   * @param {MutationRecord} lastRecord
   * @param {MutationRecord} newRecord
   * @param {MutationRecord}
   */
  function selectRecord(lastRecord, newRecord) {
    if (lastRecord === newRecord)
      return lastRecord;

    // Check if the the record we are adding represents the same record. If
    // so, we keep the one with the oldValue in it.
    if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord))
      return recordWithOldValue;

    return null;
  }

  /**
   * Class used to represent a registered observer.
   * @param {MutationObserver} observer
   * @param {Node} target
   * @param {MutationObserverInit} options
   * @constructor
   */
  function Registration(observer, target, options) {
    this.observer = observer;
    this.target = target;
    this.options = options;
    this.transientObservedNodes = [];
  }

  Registration.prototype = {
    enqueue: function(record) {
      var records = this.observer.records_;
      var length = records.length;

      // There are cases where we replace the last record with the new record.
      // For example if the record represents the same mutation we need to use
      // the one with the oldValue. If we get same record (this can happen as we
      // walk up the tree) we ignore the new record.
      if (records.length > 0) {
        var lastRecord = records[length - 1];
        var recordToReplaceLast = selectRecord(lastRecord, record);
        if (recordToReplaceLast) {
          records[length - 1] = recordToReplaceLast;
          return;
        }
      } else {
        scheduleCallback(this.observer);
      }

      records[length] = record;
    },

    addListeners: function() {
      this.addListeners_(this.target);
    },

    addListeners_: function(node) {
      var options = this.options;
      if (options.attributes)
        node.addEventListener('DOMAttrModified', this, true);

      if (options.characterData)
        node.addEventListener('DOMCharacterDataModified', this, true);

      if (options.childList)
        node.addEventListener('DOMNodeInserted', this, true);

      if (options.childList || options.subtree)
        node.addEventListener('DOMNodeRemoved', this, true);
    },

    removeListeners: function() {
      this.removeListeners_(this.target);
    },

    removeListeners_: function(node) {
      var options = this.options;
      if (options.attributes)
        node.removeEventListener('DOMAttrModified', this, true);

      if (options.characterData)
        node.removeEventListener('DOMCharacterDataModified', this, true);

      if (options.childList)
        node.removeEventListener('DOMNodeInserted', this, true);

      if (options.childList || options.subtree)
        node.removeEventListener('DOMNodeRemoved', this, true);
    },

    /**
     * Adds a transient observer on node. The transient observer gets removed
     * next time we deliver the change records.
     * @param {Node} node
     */
    addTransientObserver: function(node) {
      // Don't add transient observers on the target itself. We already have all
      // the required listeners set up on the target.
      if (node === this.target)
        return;

      this.addListeners_(node);
      this.transientObservedNodes.push(node);
      var registrations = registrationsTable.get(node);
      if (!registrations)
        registrationsTable.set(node, registrations = []);

      // We know that registrations does not contain this because we already
      // checked if node === this.target.
      registrations.push(this);
    },

    removeTransientObservers: function() {
      var transientObservedNodes = this.transientObservedNodes;
      this.transientObservedNodes = [];

      transientObservedNodes.forEach(function(node) {
        // Transient observers are never added to the target.
        this.removeListeners_(node);

        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          if (registrations[i] === this) {
            registrations.splice(i, 1);
            // Each node can only have one registered observer associated with
            // this observer.
            break;
          }
        }
      }, this);
    },

    handleEvent: function(e) {
      // Stop propagation since we are managing the propagation manually.
      // This means that other mutation events on the page will not work
      // correctly but that is by design.
      e.stopImmediatePropagation();

      switch (e.type) {
        case 'DOMAttrModified':
          // http://dom.spec.whatwg.org/#concept-mo-queue-attributes

          var name = e.attrName;
          var namespace = e.relatedNode.namespaceURI;
          var target = e.target;

          // 1.
          var record = new getRecord('attributes', target);
          record.attributeName = name;
          record.attributeNamespace = namespace;

          // 2.
          var oldValue =
              e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;

          forEachAncestorAndObserverEnqueueRecord(target, function(options) {
            // 3.1, 4.2
            if (!options.attributes)
              return;

            // 3.2, 4.3
            if (options.attributeFilter && options.attributeFilter.length &&
                options.attributeFilter.indexOf(name) === -1 &&
                options.attributeFilter.indexOf(namespace) === -1) {
              return;
            }
            // 3.3, 4.4
            if (options.attributeOldValue)
              return getRecordWithOldValue(oldValue);

            // 3.4, 4.5
            return record;
          });

          break;

        case 'DOMCharacterDataModified':
          // http://dom.spec.whatwg.org/#concept-mo-queue-characterdata
          var target = e.target;

          // 1.
          var record = getRecord('characterData', target);

          // 2.
          var oldValue = e.prevValue;


          forEachAncestorAndObserverEnqueueRecord(target, function(options) {
            // 3.1, 4.2
            if (!options.characterData)
              return;

            // 3.2, 4.3
            if (options.characterDataOldValue)
              return getRecordWithOldValue(oldValue);

            // 3.3, 4.4
            return record;
          });

          break;

        case 'DOMNodeRemoved':
          this.addTransientObserver(e.target);
          // Fall through.
        case 'DOMNodeInserted':
          // http://dom.spec.whatwg.org/#concept-mo-queue-childlist
          var target = e.relatedNode;
          var changedNode = e.target;
          var addedNodes, removedNodes;
          if (e.type === 'DOMNodeInserted') {
            addedNodes = [changedNode];
            removedNodes = [];
          } else {

            addedNodes = [];
            removedNodes = [changedNode];
          }
          var previousSibling = changedNode.previousSibling;
          var nextSibling = changedNode.nextSibling;

          // 1.
          var record = getRecord('childList', target);
          record.addedNodes = addedNodes;
          record.removedNodes = removedNodes;
          record.previousSibling = previousSibling;
          record.nextSibling = nextSibling;

          forEachAncestorAndObserverEnqueueRecord(target, function(options) {
            // 2.1, 3.2
            if (!options.childList)
              return;

            // 2.2, 3.3
            return record;
          });

      }

      clearRecords();
    }
  };

  global.JsMutationObserver = JsMutationObserver;

  // Provide unprefixed MutationObserver with native or JS implementation
  if (!global.MutationObserver && global.WebKitMutationObserver)
    global.MutationObserver = global.WebKitMutationObserver;

  if (!global.MutationObserver)
    global.MutationObserver = JsMutationObserver;


})(this);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * Implements `document.register`
 * @module CustomElements
*/

/**
 * Polyfilled extensions to the `document` object.
 * @class Document
*/

(function(scope) {

// imports

if (!scope) {
  scope = window.CustomElements = {flags:{}};
}
var flags = scope.flags;

// native document.registerElement?

var hasNative = Boolean(document.registerElement);
var useNative = !flags.register && hasNative;

if (useNative) {

  // stub
  var nop = function() {};

  // exports
  scope.registry = {};
  scope.upgradeElement = nop;
  
  scope.watchShadow = nop;
  scope.upgrade = nop;
  scope.upgradeAll = nop;
  scope.upgradeSubtree = nop;
  scope.observeDocument = nop;
  scope.upgradeDocument = nop;
  scope.takeRecords = nop;

} else {

  /**
   * Registers a custom tag name with the document.
   *
   * When a registered element is created, a `readyCallback` method is called
   * in the scope of the element. The `readyCallback` method can be specified on
   * either `options.prototype` or `options.lifecycle` with the latter taking
   * precedence.
   *
   * @method register
   * @param {String} name The tag name to register. Must include a dash ('-'),
   *    for example 'x-component'.
   * @param {Object} options
   *    @param {String} [options.extends]
   *      (_off spec_) Tag name of an element to extend (or blank for a new
   *      element). This parameter is not part of the specification, but instead
   *      is a hint for the polyfill because the extendee is difficult to infer.
   *      Remember that the input prototype must chain to the extended element's
   *      prototype (or HTMLElement.prototype) regardless of the value of
   *      `extends`.
   *    @param {Object} options.prototype The prototype to use for the new
   *      element. The prototype must inherit from HTMLElement.
   *    @param {Object} [options.lifecycle]
   *      Callbacks that fire at important phases in the life of the custom
   *      element.
   *
   * @example
   *      FancyButton = document.registerElement("fancy-button", {
   *        extends: 'button',
   *        prototype: Object.create(HTMLButtonElement.prototype, {
   *          readyCallback: {
   *            value: function() {
   *              console.log("a fancy-button was created",
   *            }
   *          }
   *        })
   *      });
   * @return {Function} Constructor for the newly registered type.
   */
  function register(name, options) {
    //console.warn('document.registerElement("' + name + '", ', options, ')');
    // construct a defintion out of options
    // TODO(sjmiles): probably should clone options instead of mutating it
    var definition = options || {};
    if (!name) {
      // TODO(sjmiles): replace with more appropriate error (EricB can probably
      // offer guidance)
      throw new Error('document.registerElement: first argument `name` must not be empty');
    }
    if (name.indexOf('-') < 0) {
      // TODO(sjmiles): replace with more appropriate error (EricB can probably
      // offer guidance)
      throw new Error('document.registerElement: first argument (\'name\') must contain a dash (\'-\'). Argument provided was \'' + String(name) + '\'.');
    }
    // elements may only be registered once
    if (getRegisteredDefinition(name)) {
      throw new Error('DuplicateDefinitionError: a type with name \'' + String(name) + '\' is already registered');
    }
    // must have a prototype, default to an extension of HTMLElement
    // TODO(sjmiles): probably should throw if no prototype, check spec
    if (!definition.prototype) {
      // TODO(sjmiles): replace with more appropriate error (EricB can probably
      // offer guidance)
      throw new Error('Options missing required prototype property');
    }
    // record name
    definition.__name = name.toLowerCase();
    // ensure a lifecycle object so we don't have to null test it
    definition.lifecycle = definition.lifecycle || {};
    // build a list of ancestral custom elements (for native base detection)
    // TODO(sjmiles): we used to need to store this, but current code only
    // uses it in 'resolveTagName': it should probably be inlined
    definition.ancestry = ancestry(definition.extends);
    // extensions of native specializations of HTMLElement require localName
    // to remain native, and use secondary 'is' specifier for extension type
    resolveTagName(definition);
    // some platforms require modifications to the user-supplied prototype
    // chain
    resolvePrototypeChain(definition);
    // overrides to implement attributeChanged callback
    overrideAttributeApi(definition.prototype);
    // 7.1.5: Register the DEFINITION with DOCUMENT
    registerDefinition(definition.__name, definition);
    // 7.1.7. Run custom element constructor generation algorithm with PROTOTYPE
    // 7.1.8. Return the output of the previous step.
    definition.ctor = generateConstructor(definition);
    definition.ctor.prototype = definition.prototype;
    // force our .constructor to be our actual constructor
    definition.prototype.constructor = definition.ctor;
    // if initial parsing is complete
    if (scope.ready) {
      // upgrade any pre-existing nodes of this type
      scope.upgradeAll(document);
    }
    return definition.ctor;
  }

  function ancestry(extnds) {
    var extendee = getRegisteredDefinition(extnds);
    if (extendee) {
      return ancestry(extendee.extends).concat([extendee]);
    }
    return [];
  }

  function resolveTagName(definition) {
    // if we are explicitly extending something, that thing is our
    // baseTag, unless it represents a custom component
    var baseTag = definition.extends;
    // if our ancestry includes custom components, we only have a
    // baseTag if one of them does
    for (var i=0, a; (a=definition.ancestry[i]); i++) {
      baseTag = a.is && a.tag;
    }
    // our tag is our baseTag, if it exists, and otherwise just our name
    definition.tag = baseTag || definition.__name;
    if (baseTag) {
      // if there is a base tag, use secondary 'is' specifier
      definition.is = definition.__name;
    }
  }

  function resolvePrototypeChain(definition) {
    // if we don't support __proto__ we need to locate the native level
    // prototype for precise mixing in
    if (!Object.__proto__) {
      // default prototype
      var nativePrototype = HTMLElement.prototype;
      // work out prototype when using type-extension
      if (definition.is) {
        var inst = document.createElement(definition.tag);
        nativePrototype = Object.getPrototypeOf(inst);
      }
      // ensure __proto__ reference is installed at each point on the prototype
      // chain.
      // NOTE: On platforms without __proto__, a mixin strategy is used instead
      // of prototype swizzling. In this case, this generated __proto__ provides
      // limited support for prototype traversal.
      var proto = definition.prototype, ancestor;
      while (proto && (proto !== nativePrototype)) {
        var ancestor = Object.getPrototypeOf(proto);
        proto.__proto__ = ancestor;
        proto = ancestor;
      }
    }
    // cache this in case of mixin
    definition.native = nativePrototype;
  }

  // SECTION 4

  function instantiate(definition) {
    // 4.a.1. Create a new object that implements PROTOTYPE
    // 4.a.2. Let ELEMENT by this new object
    //
    // the custom element instantiation algorithm must also ensure that the
    // output is a valid DOM element with the proper wrapper in place.
    //
    return upgrade(domCreateElement(definition.tag), definition);
  }

  function upgrade(element, definition) {
    // some definitions specify an 'is' attribute
    if (definition.is) {
      element.setAttribute('is', definition.is);
    }
    // remove 'unresolved' attr, which is a standin for :unresolved.
    element.removeAttribute('unresolved');
    // make 'element' implement definition.prototype
    implement(element, definition);
    // flag as upgraded
    element.__upgraded__ = true;
    // there should never be a shadow root on element at this point
    // we require child nodes be upgraded before `created`
    scope.upgradeSubtree(element);
    // lifecycle management
    created(element);
    // OUTPUT
    return element;
  }

  function implement(element, definition) {
    // prototype swizzling is best
    if (Object.__proto__) {
      element.__proto__ = definition.prototype;
    } else {
      // where above we can re-acquire inPrototype via
      // getPrototypeOf(Element), we cannot do so when
      // we use mixin, so we install a magic reference
      customMixin(element, definition.prototype, definition.native);
      element.__proto__ = definition.prototype;
    }
  }

  function customMixin(inTarget, inSrc, inNative) {
    // TODO(sjmiles): 'used' allows us to only copy the 'youngest' version of
    // any property. This set should be precalculated. We also need to
    // consider this for supporting 'super'.
    var used = {};
    // start with inSrc
    var p = inSrc;
    // sometimes the default is HTMLUnknownElement.prototype instead of
    // HTMLElement.prototype, so we add a test
    // the idea is to avoid mixing in native prototypes, so adding
    // the second test is WLOG
    while (p !== inNative && p !== HTMLUnknownElement.prototype) {
      var keys = Object.getOwnPropertyNames(p);
      for (var i=0, k; k=keys[i]; i++) {
        if (!used[k]) {
          Object.defineProperty(inTarget, k,
              Object.getOwnPropertyDescriptor(p, k));
          used[k] = 1;
        }
      }
      p = Object.getPrototypeOf(p);
    }
  }

  function created(element) {
    // invoke createdCallback
    if (element.createdCallback) {
      element.createdCallback();
    }
  }

  // attribute watching

  function overrideAttributeApi(prototype) {
    // overrides to implement callbacks
    // TODO(sjmiles): should support access via .attributes NamedNodeMap
    // TODO(sjmiles): preserves user defined overrides, if any
    if (prototype.setAttribute._polyfilled) {
      return;
    }
    var setAttribute = prototype.setAttribute;
    prototype.setAttribute = function(name, value) {
      changeAttribute.call(this, name, value, setAttribute);
    }
    var removeAttribute = prototype.removeAttribute;
    prototype.removeAttribute = function(name) {
      changeAttribute.call(this, name, null, removeAttribute);
    }
    prototype.setAttribute._polyfilled = true;
  }

  // https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/custom/
  // index.html#dfn-attribute-changed-callback
  function changeAttribute(name, value, operation) {
    var oldValue = this.getAttribute(name);
    operation.apply(this, arguments);
    var newValue = this.getAttribute(name);
    if (this.attributeChangedCallback
        && (newValue !== oldValue)) {
      this.attributeChangedCallback(name, oldValue, newValue);
    }
  }

  // element registry (maps tag names to definitions)

  var registry = {};

  function getRegisteredDefinition(name) {
    if (name) {
      return registry[name.toLowerCase()];
    }
  }

  function registerDefinition(name, definition) {
    registry[name] = definition;
  }

  function generateConstructor(definition) {
    return function() {
      return instantiate(definition);
    };
  }

  function createElement(tag, typeExtension) {
    // TODO(sjmiles): ignore 'tag' when using 'typeExtension', we could
    // error check it, or perhaps there should only ever be one argument
    var definition = getRegisteredDefinition(typeExtension || tag);
    if (definition) {
      return new definition.ctor();
    }
    return domCreateElement(tag);
  }

  function upgradeElement(element) {
    if (!element.__upgraded__ && (element.nodeType === Node.ELEMENT_NODE)) {
      var type = element.getAttribute('is') || element.localName;
      var definition = getRegisteredDefinition(type);
      return definition && upgrade(element, definition);
    }
  }

  function cloneNode(deep) {
    // call original clone
    var n = domCloneNode.call(this, deep);
    // upgrade the element and subtree
    scope.upgradeAll(n);
    // return the clone
    return n;
  }
  // capture native createElement before we override it

  var domCreateElement = document.createElement.bind(document);

  // capture native cloneNode before we override it

  var domCloneNode = Node.prototype.cloneNode;

  // exports

  document.registerElement = register;
  document.createElement = createElement; // override
  Node.prototype.cloneNode = cloneNode; // override

  scope.registry = registry;

  /**
   * Upgrade an element to a custom element. Upgrading an element
   * causes the custom prototype to be applied, an `is` attribute 
   * to be attached (as needed), and invocation of the `readyCallback`.
   * `upgrade` does nothing if the element is already upgraded, or
   * if it matches no registered custom tag name.
   *
   * @method ugprade
   * @param {Element} element The element to upgrade.
   * @return {Element} The upgraded element.
   */
  scope.upgrade = upgradeElement;
}

// bc
document.register = document.registerElement;

scope.hasNative = hasNative;
scope.useNative = useNative;

})(window.CustomElements);

 /*
Copyright 2013 The Polymer Authors. All rights reserved.
Use of this source code is governed by a BSD-style
license that can be found in the LICENSE file.
*/

(function(scope){

var logFlags = window.logFlags || {};

// walk the subtree rooted at node, applying 'find(element, data)' function
// to each element
// if 'find' returns true for 'element', do not search element's subtree
function findAll(node, find, data) {
  var e = node.firstElementChild;
  if (!e) {
    e = node.firstChild;
    while (e && e.nodeType !== Node.ELEMENT_NODE) {
      e = e.nextSibling;
    }
  }
  while (e) {
    if (find(e, data) !== true) {
      findAll(e, find, data);
    }
    e = e.nextElementSibling;
  }
  return null;
}

// walk all shadowRoots on a given node.
function forRoots(node, cb) {
  var root = node.shadowRoot;
  while(root) {
    forSubtree(root, cb);
    root = root.olderShadowRoot;
  }
}

// walk the subtree rooted at node, including descent into shadow-roots,
// applying 'cb' to each element
function forSubtree(node, cb) {
  //logFlags.dom && node.childNodes && node.childNodes.length && console.group('subTree: ', node);
  findAll(node, function(e) {
    if (cb(e)) {
      return true;
    }
    forRoots(e, cb);
  });
  forRoots(node, cb);
  //logFlags.dom && node.childNodes && node.childNodes.length && console.groupEnd();
}

// manage lifecycle on added node
function added(node) {
  if (upgrade(node)) {
    insertedNode(node);
    return true;
  }
  inserted(node);
}

// manage lifecycle on added node's subtree only
function addedSubtree(node) {
  forSubtree(node, function(e) {
    if (added(e)) {
      return true;
    }
  });
}

// manage lifecycle on added node and it's subtree
function addedNode(node) {
  return added(node) || addedSubtree(node);
}

// upgrade custom elements at node, if applicable
function upgrade(node) {
  if (!node.__upgraded__ && node.nodeType === Node.ELEMENT_NODE) {
    var type = node.getAttribute('is') || node.localName;
    var definition = scope.registry[type];
    if (definition) {
      logFlags.dom && console.group('upgrade:', node.localName);
      scope.upgrade(node);
      logFlags.dom && console.groupEnd();
      return true;
    }
  }
}

function insertedNode(node) {
  inserted(node);
  if (inDocument(node)) {
    forSubtree(node, function(e) {
      inserted(e);
    });
  }
}


// TODO(sorvell): on platforms without MutationObserver, mutations may not be 
// reliable and therefore attached/detached are not reliable.
// To make these callbacks less likely to fail, we defer all inserts and removes
// to give a chance for elements to be inserted into dom. 
// This ensures attachedCallback fires for elements that are created and 
// immediately added to dom.
var hasPolyfillMutations = (!window.MutationObserver ||
    (window.MutationObserver === window.JsMutationObserver));
scope.hasPolyfillMutations = hasPolyfillMutations;

var isPendingMutations = false;
var pendingMutations = [];
function deferMutation(fn) {
  pendingMutations.push(fn);
  if (!isPendingMutations) {
    isPendingMutations = true;
    var async = (window.Platform && window.Platform.endOfMicrotask) ||
        setTimeout;
    async(takeMutations);
  }
}

function takeMutations() {
  isPendingMutations = false;
  var $p = pendingMutations;
  for (var i=0, l=$p.length, p; (i<l) && (p=$p[i]); i++) {
    p();
  }
  pendingMutations = [];
}

function inserted(element) {
  if (hasPolyfillMutations) {
    deferMutation(function() {
      _inserted(element);
    });
  } else {
    _inserted(element);
  }
}

// TODO(sjmiles): if there are descents into trees that can never have inDocument(*) true, fix this
function _inserted(element) {
  // TODO(sjmiles): it's possible we were inserted and removed in the space
  // of one microtask, in which case we won't be 'inDocument' here
  // But there are other cases where we are testing for inserted without
  // specific knowledge of mutations, and must test 'inDocument' to determine
  // whether to call inserted
  // If we can factor these cases into separate code paths we can have
  // better diagnostics.
  // TODO(sjmiles): when logging, do work on all custom elements so we can
  // track behavior even when callbacks not defined
  //console.log('inserted: ', element.localName);
  if (element.attachedCallback || element.detachedCallback || (element.__upgraded__ && logFlags.dom)) {
    logFlags.dom && console.group('inserted:', element.localName);
    if (inDocument(element)) {
      element.__inserted = (element.__inserted || 0) + 1;
      // if we are in a 'removed' state, bluntly adjust to an 'inserted' state
      if (element.__inserted < 1) {
        element.__inserted = 1;
      }
      // if we are 'over inserted', squelch the callback
      if (element.__inserted > 1) {
        logFlags.dom && console.warn('inserted:', element.localName,
          'insert/remove count:', element.__inserted)
      } else if (element.attachedCallback) {
        logFlags.dom && console.log('inserted:', element.localName);
        element.attachedCallback();
      }
    }
    logFlags.dom && console.groupEnd();
  }
}

function removedNode(node) {
  removed(node);
  forSubtree(node, function(e) {
    removed(e);
  });
}


function removed(element) {
  if (hasPolyfillMutations) {
    deferMutation(function() {
      _removed(element);
    });
  } else {
    _removed(element);
  }
}

function _removed(element) {
  // TODO(sjmiles): temporary: do work on all custom elements so we can track
  // behavior even when callbacks not defined
  if (element.attachedCallback || element.detachedCallback || (element.__upgraded__ && logFlags.dom)) {
    logFlags.dom && console.group('removed:', element.localName);
    if (!inDocument(element)) {
      element.__inserted = (element.__inserted || 0) - 1;
      // if we are in a 'inserted' state, bluntly adjust to an 'removed' state
      if (element.__inserted > 0) {
        element.__inserted = 0;
      }
      // if we are 'over removed', squelch the callback
      if (element.__inserted < 0) {
        logFlags.dom && console.warn('removed:', element.localName,
            'insert/remove count:', element.__inserted)
      } else if (element.detachedCallback) {
        element.detachedCallback();
      }
    }
    logFlags.dom && console.groupEnd();
  }
}

function inDocument(element) {
  var p = element;
  var doc = window.ShadowDOMPolyfill &&
      window.ShadowDOMPolyfill.wrapIfNeeded(document) || document;
  while (p) {
    if (p == doc) {
      return true;
    }
    p = p.parentNode || p.host;
  }
}

function watchShadow(node) {
  if (node.shadowRoot && !node.shadowRoot.__watched) {
    logFlags.dom && console.log('watching shadow-root for: ', node.localName);
    // watch all unwatched roots...
    var root = node.shadowRoot;
    while (root) {
      watchRoot(root);
      root = root.olderShadowRoot;
    }
  }
}

function watchRoot(root) {
  if (!root.__watched) {
    observe(root);
    root.__watched = true;
  }
}

function handler(mutations) {
  //
  if (logFlags.dom) {
    var mx = mutations[0];
    if (mx && mx.type === 'childList' && mx.addedNodes) {
        if (mx.addedNodes) {
          var d = mx.addedNodes[0];
          while (d && d !== document && !d.host) {
            d = d.parentNode;
          }
          var u = d && (d.URL || d._URL || (d.host && d.host.localName)) || '';
          u = u.split('/?').shift().split('/').pop();
        }
    }
    console.group('mutations (%d) [%s]', mutations.length, u || '');
  }
  //
  mutations.forEach(function(mx) {
    //logFlags.dom && console.group('mutation');
    if (mx.type === 'childList') {
      forEach(mx.addedNodes, function(n) {
        //logFlags.dom && console.log(n.localName);
        if (!n.localName) {
          return;
        }
        // nodes added may need lifecycle management
        addedNode(n);
      });
      // removed nodes may need lifecycle management
      forEach(mx.removedNodes, function(n) {
        //logFlags.dom && console.log(n.localName);
        if (!n.localName) {
          return;
        }
        removedNode(n);
      });
    }
    //logFlags.dom && console.groupEnd();
  });
  logFlags.dom && console.groupEnd();
};

var observer = new MutationObserver(handler);

function takeRecords() {
  // TODO(sjmiles): ask Raf why we have to call handler ourselves
  handler(observer.takeRecords());
  takeMutations();
}

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

function observe(inRoot) {
  observer.observe(inRoot, {childList: true, subtree: true});
}

function observeDocument(document) {
  observe(document);
}

function upgradeDocument(document) {
  logFlags.dom && console.group('upgradeDocument: ', (document.URL || document._URL || '').split('/').pop());
  addedNode(document);
  logFlags.dom && console.groupEnd();
}

// exports

scope.watchShadow = watchShadow;
scope.upgradeAll = addedNode;
scope.upgradeSubtree = addedSubtree;

scope.observeDocument = observeDocument;
scope.upgradeDocument = upgradeDocument;

scope.takeRecords = takeRecords;

})(window.CustomElements);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function() {

// import

var IMPORT_LINK_TYPE = window.HTMLImports ? HTMLImports.IMPORT_LINK_TYPE : 'none';

// highlander object for parsing a document tree

var parser = {
  selectors: [
    'link[rel=' + IMPORT_LINK_TYPE + ']'
  ],
  map: {
    link: 'parseLink'
  },
  parse: function(inDocument) {
    if (!inDocument.__parsed) {
      // only parse once
      inDocument.__parsed = true;
      // all parsable elements in inDocument (depth-first pre-order traversal)
      var elts = inDocument.querySelectorAll(parser.selectors);
      // for each parsable node type, call the mapped parsing method
      forEach(elts, function(e) {
        parser[parser.map[e.localName]](e);
      });
      // upgrade all upgradeable static elements, anything dynamically
      // created should be caught by observer
      CustomElements.upgradeDocument(inDocument);
      // observe document for dom changes
      CustomElements.observeDocument(inDocument);
    }
  },
  parseLink: function(linkElt) {
    // imports
    if (isDocumentLink(linkElt)) {
      this.parseImport(linkElt);
    }
  },
  parseImport: function(linkElt) {
    if (linkElt.content) {
      parser.parse(linkElt.content);
    }
  }
};

function isDocumentLink(inElt) {
  return (inElt.localName === 'link'
      && inElt.getAttribute('rel') === IMPORT_LINK_TYPE);
}

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

// exports

CustomElements.parser = parser;

})();
/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope){

// bootstrap parsing
function bootstrap() {
  // parse document
  CustomElements.parser.parse(document);
  // one more pass before register is 'live'
  CustomElements.upgradeDocument(document);
  // choose async
  var async = window.Platform && Platform.endOfMicrotask ? 
    Platform.endOfMicrotask :
    setTimeout;
  async(function() {
    // set internal 'ready' flag, now document.registerElement will trigger 
    // synchronous upgrades
    CustomElements.ready = true;
    // capture blunt profiling data
    CustomElements.readyTime = Date.now();
    if (window.HTMLImports) {
      CustomElements.elapsed = CustomElements.readyTime - HTMLImports.readyTime;
    }
    // notify the system that we are bootstrapped
    document.dispatchEvent(
      new CustomEvent('WebComponentsReady', {bubbles: true})
    );
  });
}

// CustomEvent shim for IE
if (typeof window.CustomEvent !== 'function') {
  window.CustomEvent = function(inType) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent(inType, true, true);
    return e;
  };
}

// When loading at readyState complete time (or via flag), boot custom elements
// immediately.
// If relevant, HTMLImports must already be loaded.
if (document.readyState === 'complete' || scope.flags.eager) {
  bootstrap();
// When loading at readyState interactive time, bootstrap only if HTMLImports
// are not pending. Also avoid IE as the semantics of this state are unreliable.
} else if (document.readyState === 'interactive' && !window.attachEvent &&
    (!window.HTMLImports || window.HTMLImports.ready)) {
  bootstrap();
// When loading at other readyStates, wait for the appropriate DOM event to 
// bootstrap.
} else {
  var loadEvent = window.HTMLImports && !HTMLImports.ready ?
      'HTMLImportsLoaded' : 'DOMContentLoaded';
  window.addEventListener(loadEvent, bootstrap);
}

})(window.CustomElements);

(function () {

/*** Variables ***/

  var win = window,
    doc = document,
    container = doc.createElement('div'),
    noop = function(){},
    trueop = function(){ return true; },
    regexPseudoSplit = /([\w-]+(?:\([^\)]+\))?)/g,
    regexPseudoReplace = /(\w*)(?:\(([^\)]*)\))?/,
    regexDigits = /(\d+)/g,
    keypseudo = {
      action: function (pseudo, event) {
        return pseudo.value.match(regexDigits).indexOf(String(event.keyCode)) > -1 == (pseudo.name == 'keypass') || null;
      }
    },
    /*
      - The prefix object generated here is added to the xtag object as xtag.prefix later in the code
      - Prefix provides a variety of prefix variations for the browser in which your code is running
      - The 4 variations of prefix are as follows:
        * prefix.dom: the correct prefix case and form when used on DOM elements/style properties
        * prefix.lowercase: a lowercase version of the prefix for use in various user-code situations
        * prefix.css: the lowercase, dashed version of the prefix 
        * prefix.js: addresses prefixed APIs present in global and non-Element contexts
    */
    prefix = (function () {
      var styles = win.getComputedStyle(doc.documentElement, ''),
          pre = (Array.prototype.slice
            .call(styles)
            .join('')
            .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
          )[1];
      return {
        dom: pre == 'ms' ? 'MS' : pre,
        lowercase: pre,
        css: '-' + pre + '-',
        js: pre == 'ms' ? pre : pre[0].toUpperCase() + pre.substr(1)
      };
    })(),
    matchSelector = Element.prototype.matchesSelector || Element.prototype[prefix.lowercase + 'MatchesSelector'],
    mutation = win.MutationObserver || win[prefix.js + 'MutationObserver'];

/*** Functions ***/

// Utilities
  
  /*
    This is an enhanced typeof check for all types of objects. Where typeof would normaly return
    'object' for many common DOM objects (like NodeLists and HTMLCollections).
    - For example: typeOf(document.children) will correctly return 'htmlcollection'
  */
  var typeCache = {},
      typeString = typeCache.toString,
      typeRegexp = /\s([a-zA-Z]+)/;
  function typeOf(obj) {
    var type = typeString.call(obj);
    return typeCache[type] || (typeCache[type] = type.match(typeRegexp)[1].toLowerCase());
  }
  
  function clone(item, type){
    var fn = clone[type || typeOf(item)];
    return fn ? fn(item) : item;
  }
    clone.object = function(src){
      var obj = {};
      for (var key in src) obj[key] = clone(src[key]);
      return obj;
    };
    clone.array = function(src){
      var i = src.length, array = new Array(i);
      while (i--) array[i] = clone(src[i]);
      return array;
    };
  
  /*
    The toArray() method allows for conversion of any object to a true array. For types that
    cannot be converted to an array, the method returns a 1 item array containing the passed-in object.
  */
  var unsliceable = ['undefined', 'null', 'number', 'boolean', 'string', 'function'];
  function toArray(obj){
    return unsliceable.indexOf(typeOf(obj)) == -1 ?
    Array.prototype.slice.call(obj, 0) :
    [obj];
  }

// DOM

  var str = '';
  function query(element, selector){
    return (selector || str).length ? toArray(element.querySelectorAll(selector)) : [];
  }

  function parseMutations(element, mutations) {
    var diff = { added: [], removed: [] };
    mutations.forEach(function(record){
      record._mutation = true;
      for (var z in diff) {
        var type = element._records[(z == 'added') ? 'inserted' : 'removed'],
          nodes = record[z + 'Nodes'], length = nodes.length;
        for (var i = 0; i < length && diff[z].indexOf(nodes[i]) == -1; i++){
          diff[z].push(nodes[i]);
          type.forEach(function(fn){
            fn(nodes[i], record);
          });
        }
      }
    });
  }

// Mixins

  function mergeOne(source, key, current){
    var type = typeOf(current);
    if (type == 'object' && typeOf(source[key]) == 'object') xtag.merge(source[key], current);
    else source[key] = clone(current, type);
    return source;
  }

  function wrapMixin(tag, key, pseudo, value, original){
    var fn = original[key];
    if (!(key in original)) original[key] = value;
    else if (typeof original[key] == 'function') {
      if (!fn.__mixins__) fn.__mixins__ = [];
      fn.__mixins__.push(xtag.applyPseudos(pseudo, value, tag.pseudos));
    }
  }

  var uniqueMixinCount = 0;
  function mergeMixin(tag, mixin, original, mix) {
    if (mix) {
      var uniques = {};
      for (var z in original) uniques[z.split(':')[0]] = z;
      for (z in mixin) {
        wrapMixin(tag, uniques[z.split(':')[0]] || z, z, mixin[z], original);
      }
    }
    else {
      for (var zz in mixin){
        original[zz + ':__mixin__(' + (uniqueMixinCount++) + ')'] = xtag.applyPseudos(zz, mixin[zz], tag.pseudos);
      }
    }
  }

  function applyMixins(tag) {
    tag.mixins.forEach(function (name) {
      var mixin = xtag.mixins[name];
      for (var type in mixin) {
        var item = mixin[type],
            original = tag[type];
        if (!original) tag[type] = item;
        else {
          switch (type){
            case 'accessors': case 'prototype':
              for (var z in item) {
                if (!original[z]) original[z] = item[z];
                else mergeMixin(tag, item[z], original[z], true);
              }
              break;
            default: mergeMixin(tag, item, original, type != 'events');
          }
        }
      }
    });
    return tag;
  }

// Events

  function delegateAction(pseudo, event) {
    var match, target = event.target;
    if (!target.tagName) return null;
    if (xtag.matchSelector(target, pseudo.value)) match = target;
    else if (xtag.matchSelector(target, pseudo.value + ' *')) {
      var parent = target.parentNode;
      while (!match) {
        if (xtag.matchSelector(parent, pseudo.value)) match = parent;
        parent = parent.parentNode;
      }
    }
    return match ? pseudo.listener = pseudo.listener.bind(match) : null;
  }

  function touchFilter(event) {
    if (event.type.match('touch')){
      event.target.__touched__ = true;
    }
    else if (event.target.__touched__ && event.type.match('mouse')){
      delete event.target.__touched__;
      return;
    }
    return true;
  }

  function createFlowEvent(type) {
    var flow = type == 'over';
    return {
      attach: 'OverflowEvent' in win ? 'overflowchanged' : [],
      condition: function (event, custom) {
        event.flow = type;
        return event.type == (type + 'flow') ||
        ((event.orient === 0 && event.horizontalOverflow == flow) ||
        (event.orient == 1 && event.verticalOverflow == flow) ||
        (event.orient == 2 && event.horizontalOverflow == flow && event.verticalOverflow == flow));
      }
    };
  }

  function writeProperty(key, event, base, desc){
    if (desc) event[key] = base[key];
    else Object.defineProperty(event, key, {
      writable: true,
      enumerable: true,
      value: base[key]
    });
  }

  var skipProps = {};
  for (var z in doc.createEvent('CustomEvent')) skipProps[z] = 1;
  function inheritEvent(event, base){
    var desc = Object.getOwnPropertyDescriptor(event, 'target');
    for (var z in base) {
      if (!skipProps[z]) writeProperty(z, event, base, desc);
    }
    event.baseEvent = base;
  }

// Accessors

  function getArgs(attr, value){
    return {
      value: attr.boolean ? '' : value,
      method: attr.boolean && !value ? 'removeAttribute' : 'setAttribute'
    };
  }

  function modAttr(element, attr, name, value){
    var args = getArgs(attr, value);
    element[args.method](name, args.value);
  }

  function syncAttr(element, attr, name, value, method){
    var nodes = attr.property ? [element.xtag[attr.property]] : attr.selector ? xtag.query(element, attr.selector) : [],
        index = nodes.length;
    while (index--) nodes[index][method](name, value);
  }

  function updateView(element, name, value){
    if (element.__view__){
      element.__view__.updateBindingValue(element, name, value);
    }
  }

  function attachProperties(tag, prop, z, accessor, attr, name){
    var key = z.split(':'), type = key[0];
    if (type == 'get') {
      key[0] = prop;
      tag.prototype[prop].get = xtag.applyPseudos(key.join(':'), accessor[z], tag.pseudos, accessor[z]);
    }
    else if (type == 'set') {
      key[0] = prop;
      var setter = tag.prototype[prop].set = xtag.applyPseudos(key.join(':'), attr ? function(value){
        this.xtag._skipSet = true;
        if (!this.xtag._skipAttr) modAttr(this, attr, name, value);
        if (this.xtag._skipAttr && attr.skip) delete this.xtag._skipAttr;
        accessor[z].call(this, attr.boolean ? !!value : value);
        updateView(this, name, value);
        delete this.xtag._skipSet;
      } : accessor[z] ? function(value){
        accessor[z].call(this, value);
        updateView(this, name, value);
      } : null, tag.pseudos, accessor[z]);

      if (attr) attr.setter = setter;
    }
    else tag.prototype[prop][z] = accessor[z];
  }

  function parseAccessor(tag, prop){
    tag.prototype[prop] = {};
    var accessor = tag.accessors[prop],
        attr = accessor.attribute,
        name = attr && attr.name ? attr.name.toLowerCase() : prop;

    if (attr) {
      attr.key = prop;
      tag.attributes[name] = attr;
    }

    for (var z in accessor) attachProperties(tag, prop, z, accessor, attr, name);

    if (attr) {
      if (!tag.prototype[prop].get) {
        var method = (attr.boolean ? 'has' : 'get') + 'Attribute';
        tag.prototype[prop].get = function(){
          return this[method](name);
        };
      }
      if (!tag.prototype[prop].set) tag.prototype[prop].set = function(value){
        modAttr(this, attr, name, value);
        updateView(this, name, value);
      };
    }
  }

  var readyTags = {};
  function fireReady(name){
    readyTags[name] = (readyTags[name] || []).filter(function(obj){
      return (obj.tags = obj.tags.filter(function(z){
        return z != name && !xtag.tags[z];
      })).length || obj.fn();
    });
  }

/*** X-Tag Object Definition ***/

  var xtag = {
    tags: {},
    defaultOptions: {
      pseudos: [],
      mixins: [],
      events: {},
      methods: {},
      accessors: {},
      lifecycle: {},
      attributes: {},
      'prototype': {
        xtag: {
          get: function(){
            return this.__xtag__ ? this.__xtag__ : (this.__xtag__ = { data: {} });
          }
        }
      }
    },
    register: function (name, options) {
      var _name;
      if (typeof name == 'string') {
        _name = name.toLowerCase();
      } else {
        return;
      }

      // save prototype for actual object creation below
      var basePrototype = options.prototype;
      delete options.prototype;

      var tag = xtag.tags[_name] = applyMixins(xtag.merge({}, xtag.defaultOptions, options));

      for (var z in tag.events) tag.events[z] = xtag.parseEvent(z, tag.events[z]);
      for (z in tag.lifecycle) tag.lifecycle[z.split(':')[0]] = xtag.applyPseudos(z, tag.lifecycle[z], tag.pseudos, tag.lifecycle[z]);
      for (z in tag.methods) tag.prototype[z.split(':')[0]] = { value: xtag.applyPseudos(z, tag.methods[z], tag.pseudos, tag.methods[z]), enumerable: true };
      for (z in tag.accessors) parseAccessor(tag, z);

      var ready = tag.lifecycle.created || tag.lifecycle.ready;
      tag.prototype.createdCallback = {
        enumerable: true,
        value: function(){
          var element = this;
          xtag.addEvents(this, tag.events);
          tag.mixins.forEach(function(mixin){
            if (xtag.mixins[mixin].events) xtag.addEvents(element, xtag.mixins[mixin].events);
          });
          var output = ready ? ready.apply(this, arguments) : null;
          for (var name in tag.attributes) {
            var attr = tag.attributes[name],
                hasAttr = this.hasAttribute(name);
            if (hasAttr || attr.boolean) {
              this[attr.key] = attr.boolean ? hasAttr : this.getAttribute(name);
            }
          }
          tag.pseudos.forEach(function(obj){
            obj.onAdd.call(element, obj);
          });
          return output;
        }
      };
			
      var inserted = tag.lifecycle.inserted,
          removed = tag.lifecycle.removed;
      if (inserted || removed) {
        tag.prototype.attachedCallback = { value: function(){
          if (removed) this.xtag.__parentNode__ = this.parentNode;
          if (inserted) return inserted.apply(this, arguments);
        }, enumerable: true };
      }
      if (removed) {
        tag.prototype.detachedCallback = { value: function(){
          var args = toArray(arguments);
          args.unshift(this.xtag.__parentNode__);
          var output = removed.apply(this, args);
          delete this.xtag.__parentNode__;
          return output;
        }, enumerable: true };
      }
      if (tag.lifecycle.attributeChanged) tag.prototype.attributeChangedCallback = { value: tag.lifecycle.attributeChanged, enumerable: true };

      var setAttribute = tag.prototype.setAttribute || HTMLElement.prototype.setAttribute;
      tag.prototype.setAttribute = {
        writable: true,
        enumberable: true,
        value: function (name, value){
          var attr = tag.attributes[name.toLowerCase()];
          if (!this.xtag._skipAttr) setAttribute.call(this, name, attr && attr.boolean ? '' : value);
          if (attr) {
            if (attr.setter && !this.xtag._skipSet) {
              this.xtag._skipAttr = true;
              attr.setter.call(this, attr.boolean ? true : value);
            }
            value = attr.skip ? attr.boolean ? this.hasAttribute(name) : this.getAttribute(name) : value;
            syncAttr(this, attr, name, attr.boolean ? '' : value, 'setAttribute');
          }
          delete this.xtag._skipAttr;
        }
      };

      var removeAttribute = tag.prototype.removeAttribute || HTMLElement.prototype.removeAttribute;
      tag.prototype.removeAttribute = {
        writable: true,
        enumberable: true,
        value: function (name){
          var attr = tag.attributes[name.toLowerCase()];
          if (!this.xtag._skipAttr) removeAttribute.call(this, name);
          if (attr) {
            if (attr.setter && !this.xtag._skipSet) {
              this.xtag._skipAttr = true;
              attr.setter.call(this, attr.boolean ? false : undefined);
            }
            syncAttr(this, attr, name, undefined, 'removeAttribute');
          }
          delete this.xtag._skipAttr;
        }
      };

      var elementProto = basePrototype ?
            basePrototype :
            options['extends'] ?
            Object.create(doc.createElement(options['extends']).constructor).prototype :
            win.HTMLElement.prototype;

      var definition = {
        'prototype': Object.create(elementProto, tag.prototype)
      };
      if (options['extends']) {
        definition['extends'] = options['extends'];
      }
      var reg = doc.registerElement(_name, definition);
      fireReady(_name);
      return reg;
    },
    
    /*
      NEEDS MORE TESTING!
      
      Allows for async dependency resolution, fires when all passed-in elements are 
      registered and parsed
    */
    ready: function(names, fn){
      var obj = { tags: toArray(names), fn: fn };
      if (obj.tags.reduce(function(last, name){
        if (xtag.tags[name]) return last;
        (readyTags[name] = readyTags[name] || []).push(obj);
      }, true)) fn();
    },

    /* Exposed Variables */

    mixins: {},
    prefix: prefix,
    captureEvents: ['focus', 'blur', 'scroll', 'underflow', 'overflow', 'overflowchanged', 'DOMMouseScroll'],
    customEvents: {
      overflow: createFlowEvent('over'),
      underflow: createFlowEvent('under'),
      animationstart: {
        attach: [prefix.dom + 'AnimationStart']
      },
      animationend: {
        attach: [prefix.dom + 'AnimationEnd']
      },
      transitionend: {
        attach: [prefix.dom + 'TransitionEnd']
      },
      move: {
        attach: ['mousemove', 'touchmove'],
        condition: touchFilter
      },
      enter: {
        attach: ['mouseover', 'touchenter'],
        condition: touchFilter
      },
      leave: {
        attach: ['mouseout', 'touchleave'],
        condition: touchFilter
      },
      scrollwheel: {
        attach: ['DOMMouseScroll', 'mousewheel'],
        condition: function(event){
          event.delta = event.wheelDelta ? event.wheelDelta / 40 : Math.round(event.detail / 3.5 * -1);
          return true;
        }
      },
      tapstart: {
        observe: {
          mousedown: doc,
          touchstart: doc
        },
        condition: touchFilter
      },
      tapend: {
        observe: {
          mouseup: doc,
          touchend: doc
        },
        condition: touchFilter
      },
      tapmove: {
        attach: ['tapstart', 'dragend', 'touchcancel'],
        condition: function(event, custom){
          switch (event.type) {
            case 'move':  return true;
            case 'dragover':
              var last = custom.lastDrag || {};
              custom.lastDrag = event;
              return (last.pageX != event.pageX && last.pageY != event.pageY) || null;
            case 'tapstart':
              if (!custom.move) {
                custom.current = this;
                custom.move = xtag.addEvents(this, {
                  move: custom.listener,
                  dragover: custom.listener
                });
                custom.tapend = xtag.addEvent(doc, 'tapend', custom.listener);
              }
              break;
            case 'tapend': case 'dragend': case 'touchcancel':
              if (!event.touches.length) {
                if (custom.move) xtag.removeEvents(custom.current , custom.move || {});
                if (custom.tapend) xtag.removeEvent(doc, custom.tapend || {});
                delete custom.lastDrag;
                delete custom.current;
                delete custom.tapend;
                delete custom.move;
              }
          }
        }
      }
    },
    pseudos: {
      __mixin__: {},
      /*
        
        
      */
      mixins: {
        onCompiled: function(fn, pseudo){
          var mixins = pseudo.source.__mixins__;
          if (mixins) switch (pseudo.value) {
            case 'before': return function(){
              var self = this,
                  args = arguments;
              mixins.forEach(function(m){
                m.apply(self, args);
              });
              return fn.apply(self, args);
            };
            case 'after': case null: return function(){
              var self = this,
                  args = arguments;
                  returns = fn.apply(self, args);
              mixins.forEach(function(m){
                m.apply(self, args);
              });
              return returns;
            };
          }
        }
      },
      keypass: keypseudo,
      keyfail: keypseudo,
      delegate: { action: delegateAction },
      within: {
        action: delegateAction,
        onAdd: function(pseudo){
          var condition = pseudo.source.condition;
          if (condition) pseudo.source.condition = function(event, custom){
            return xtag.query(this, pseudo.value).filter(function(node){
              return node == event.target || node.contains ? node.contains(event.target) : null;
            })[0] ? condition.call(this, event, custom) : null;
          };
        }
      },
      preventable: {
        action: function (pseudo, event) {
          return !event.defaultPrevented;
        }
      }
    },

    /* UTILITIES */

    clone: clone,
    typeOf: typeOf,
    toArray: toArray,
    
    wrap: function (original, fn) {
      return function(){
        var args = arguments,
            output = original.apply(this, args);
        fn.apply(this, args);
        return output;
      };
    },
    /*
      Recursively merges one object with another. The first argument is the destination object,
      all other objects passed in as arguments are merged from right to left, conflicts are overwritten
    */
    merge: function(source, k, v){
      if (typeOf(k) == 'string') return mergeOne(source, k, v);
      for (var i = 1, l = arguments.length; i < l; i++){
        var object = arguments[i];
        for (var key in object) mergeOne(source, key, object[key]);
      }
      return source;
    },
    
    /*
      ----- This should be simplified! -----
      Generates a random ID string
    */ 
    uid: function(){
      return Math.random().toString(36).substr(2,10);
    },

    /* DOM */

    query: query,

    skipTransition: function(element, fn, bind){
      var prop = prefix.js + 'TransitionProperty';
      element.style[prop] = element.style.transitionProperty = 'none';
      var callback = fn ? fn.call(bind) : null;
      return xtag.requestFrame(function(){
        xtag.requestFrame(function(){
          element.style[prop] = element.style.transitionProperty = '';
          if (callback) xtag.requestFrame(callback);
        });
      });
    },
    
    requestFrame: (function(){
      var raf = win.requestAnimationFrame ||
                win[prefix.lowercase + 'RequestAnimationFrame'] ||
                function(fn){ return win.setTimeout(fn, 20); };
      return function(fn){ return raf(fn); };
    })(),
    
    cancelFrame: (function(){
      var cancel = win.cancelAnimationFrame ||
                   win[prefix.lowercase + 'CancelAnimationFrame'] ||
                   win.clearTimeout;
      return function(id){ return cancel(id); };  
    })(),

    matchSelector: function (element, selector) {
      return matchSelector.call(element, selector);
    },

    set: function (element, method, value) {
      element[method] = value;
      if (window.CustomElements) CustomElements.upgradeAll(element);
    },

    innerHTML: function(el, html){
      xtag.set(el, 'innerHTML', html);
    },

    hasClass: function (element, klass) {
      return element.className.split(' ').indexOf(klass.trim())>-1;
    },

    addClass: function (element, klass) {
      var list = element.className.trim().split(' ');
      klass.trim().split(' ').forEach(function (name) {
        if (!~list.indexOf(name)) list.push(name);
      });
      element.className = list.join(' ').trim();
      return element;
    },

    removeClass: function (element, klass) {
      var classes = klass.trim().split(' ');
      element.className = element.className.trim().split(' ').filter(function (name) {
        return name && !~classes.indexOf(name);
      }).join(' ');
      return element;
    },

    toggleClass: function (element, klass) {
      return xtag[xtag.hasClass(element, klass) ? 'removeClass' : 'addClass'].call(null, element, klass);
    },
    
    /*
      Runs a query on only the children of an element
    */
    queryChildren: function (element, selector) {
      var id = element.id,
        guid = element.id = id || 'x_' + xtag.uid(),
        attr = '#' + guid + ' > ',
        noParent = false;
      if (!element.parentNode){
        noParent = true;
        container.appendChild(element);
      }
      selector = attr + (selector + '').replace(',', ',' + attr, 'g');
      var result = element.parentNode.querySelectorAll(selector);
      if (!id) element.removeAttribute('id');
      if (noParent){
        container.removeChild(element);
      }
      return toArray(result);
    },
    /*
      Creates a document fragment with the content passed in - content can be
      a string of HTML, an element, or an array/collection of elements
    */
    createFragment: function(content) {
      var frag = doc.createDocumentFragment();
      if (content) {
        var div = frag.appendChild(doc.createElement('div')),
          nodes = toArray(content.nodeName ? arguments : !(div.innerHTML = content) || div.children),
          length = nodes.length,
          index = 0;
        while (index < length) frag.insertBefore(nodes[index++], div);
        frag.removeChild(div);
      }
      return frag;
    },
    
    /*
      Removes an element from the DOM for more performant node manipulation. The element
      is placed back into the DOM at the place it was taken from.
    */
    manipulate: function(element, fn){
      var next = element.nextSibling,
        parent = element.parentNode,
        frag = doc.createDocumentFragment(),
        returned = fn.call(frag.appendChild(element), frag) || element;
      if (next) parent.insertBefore(returned, next);
      else parent.appendChild(returned);
    },

    /* PSEUDOS */

    applyPseudos: function(key, fn, target, source) {
      var listener = fn,
          pseudos = {};
      if (key.match(':')) {
        var split = key.match(regexPseudoSplit),
            i = split.length;
        while (--i) {
          split[i].replace(regexPseudoReplace, function (match, name, value) {
            if (!xtag.pseudos[name]) throw "pseudo not found: " + name + " " + split;
            value = (value === '' || typeof value == 'undefined') ? null : value;
            var pseudo = pseudos[i] = Object.create(xtag.pseudos[name]);
            pseudo.key = key;
            pseudo.name = name;
            pseudo.value = value;
            pseudo['arguments'] = (value || '').split(',');
            pseudo.action = pseudo.action || trueop;
            pseudo.source = source;
            var last = listener;
            listener = function(){
              var args = toArray(arguments),
                  obj = {
                    key: key,
                    name: name,
                    value: value,
                    source: source,
                    'arguments': pseudo['arguments'],
                    listener: last
                  };
              var output = pseudo.action.apply(this, [obj].concat(args));
              if (output === null || output === false) return output;
              return obj.listener.apply(this, args);
            };
            if (target && pseudo.onAdd) {
              if (target.nodeName) pseudo.onAdd.call(target, pseudo);
              else target.push(pseudo);
            }
          });
        }
      }
      for (var z in pseudos) {
        if (pseudos[z].onCompiled) listener = pseudos[z].onCompiled(listener, pseudos[z]) || listener;
      }
      return listener;
    },

    removePseudos: function(target, pseudos){
      pseudos.forEach(function(obj){
        if (obj.onRemove) obj.onRemove.call(target, obj);
      });
    },

  /*** Events ***/

    parseEvent: function(type, fn) {
      var pseudos = type.split(':'),
          key = pseudos.shift(),
          custom = xtag.customEvents[key],
          event = xtag.merge({
            type: key,
            stack: noop,
            condition: trueop,
            attach: [],
            _attach: [],
            pseudos: '',
            _pseudos: [],
            onAdd: noop,
            onRemove: noop
          }, custom || {});
      event.attach = toArray(event.base || event.attach);
      event.chain = key + (event.pseudos.length ? ':' + event.pseudos : '') + (pseudos.length ? ':' + pseudos.join(':') : '');
      var condition = event.condition;
      event.condition = function(e){
        var t = e.touches, tt = e.targetTouches;
        return condition.apply(this, arguments);
      };
      var stack = xtag.applyPseudos(event.chain, fn, event._pseudos, event);
      event.stack = function(e){
        e.currentTarget = e.currentTarget || this;
        var t = e.touches, tt = e.targetTouches;
        var detail = e.detail || {};
        if (!detail.__stack__) return stack.apply(this, arguments);
        else if (detail.__stack__ == stack) {
          e.stopPropagation();
          e.cancelBubble = true;
          return stack.apply(this, arguments);
        }
      };
      event.listener = function(e){
        var args = toArray(arguments),
            output = event.condition.apply(this, args.concat([event]));
        if (!output) return output;
        // The second condition in this IF is to address the following Blink regression: https://code.google.com/p/chromium/issues/detail?id=367537
        // Remove this when affected browser builds with this regression fall below 5% marketshare
        if (e.type != key && (e.baseEvent && e.type != e.baseEvent.type)) {
          xtag.fireEvent(e.target, key, {
            baseEvent: e,
            detail: output !== true && (output.__stack__ = stack) ? output : { __stack__: stack }
          });
        }
        else return event.stack.apply(this, args);
      };
      event.attach.forEach(function(name) {
        event._attach.push(xtag.parseEvent(name, event.listener));
      });
      if (custom && custom.observe && !custom.__observing__) {
        custom.observer = function(e){
          var output = event.condition.apply(this, toArray(arguments).concat([custom]));
          if (!output) return output;
          xtag.fireEvent(e.target, key, {
            baseEvent: e,
            detail: output !== true ? output : {}
          });
        };
        for (var z in custom.observe) xtag.addEvent(custom.observe[z] || document, z, custom.observer, true);
        custom.__observing__ = true;
      }
      return event;
    },

    addEvent: function (element, type, fn, capture) {
      var event = typeof fn == 'function' ? xtag.parseEvent(type, fn) : fn;
      event._pseudos.forEach(function(obj){
        obj.onAdd.call(element, obj);
      });
      event._attach.forEach(function(obj) {
        xtag.addEvent(element, obj.type, obj);
      });
      event.onAdd.call(element, event, event.listener);
      element.addEventListener(event.type, event.stack, capture || xtag.captureEvents.indexOf(event.type) > -1);
      return event;
    },

    addEvents: function (element, obj) {
      var events = {};
      for (var z in obj) {
        events[z] = xtag.addEvent(element, z, obj[z]);
      }
      return events;
    },

    removeEvent: function (element, type, event) {
      event = event || type;
      event.onRemove.call(element, event, event.listener);
      xtag.removePseudos(element, event._pseudos);
      event._attach.forEach(function(obj) {
        xtag.removeEvent(element, obj);
      });
      element.removeEventListener(event.type, event.stack);
    },

    removeEvents: function(element, obj){
      for (var z in obj) xtag.removeEvent(element, obj[z]);
    },

    fireEvent: function(element, type, options, warn){
      var event = doc.createEvent('CustomEvent');
      options = options || {};
      if (warn) console.warn('fireEvent has been modified');
      event.initCustomEvent(type,
        options.bubbles !== false,
        options.cancelable !== false,
        options.detail
      );
      if (options.baseEvent) inheritEvent(event, options.baseEvent);
      try { element.dispatchEvent(event); }
      catch (e) {
        console.warn('This error may have been caused by a change in the fireEvent method', e);
      }
    },
    
    /*
      Listens for insertion or removal of nodes from a given element using 
      Mutation Observers, or Mutation Events as a fallback
    */
    addObserver: function(element, type, fn){
      if (!element._records) {
        element._records = { inserted: [], removed: [] };
        if (mutation){
          element._observer = new mutation(function(mutations) {
            parseMutations(element, mutations);
          });
          element._observer.observe(element, {
            subtree: true,
            childList: true,
            attributes: !true,
            characterData: false
          });
        }
        else ['Inserted', 'Removed'].forEach(function(type){
          element.addEventListener('DOMNode' + type, function(event){
            event._mutation = true;
            element._records[type.toLowerCase()].forEach(function(fn){
              fn(event.target, event);
            });
          }, false);
        });
      }
      if (element._records[type].indexOf(fn) == -1) element._records[type].push(fn);
    },

    removeObserver: function(element, type, fn){
      var obj = element._records;
      if (obj && fn){
        obj[type].splice(obj[type].indexOf(fn), 1);
      }
      else{
        obj[type] = [];
      }
    }

  };

/*** Universal Touch ***/

var touching = false,
    touchTarget = null;

doc.addEventListener('mousedown', function(e){
  touching = true;
  touchTarget = e.target;
}, true);

doc.addEventListener('mouseup', function(){
  touching = false;
  touchTarget = null;
}, true);

doc.addEventListener('dragend', function(){
  touching = false;
  touchTarget = null;
}, true);

var UIEventProto = {
  touches: {
    configurable: true,
    get: function(){
      return this.__touches__ ||
        (this.identifier = 0) ||
        (this.__touches__ = touching ? [this] : []);
    }
  },
  targetTouches: {
    configurable: true,
    get: function(){
      return this.__targetTouches__ || (this.__targetTouches__ =
        (touching && this.currentTarget &&
        (this.currentTarget == touchTarget ||
        (this.currentTarget.contains && this.currentTarget.contains(touchTarget)))) ? (this.identifier = 0) || [this] : []);
    }
  },
  changedTouches: {
    configurable: true,
    get: function(){
      return this.__changedTouches__ || (this.identifier = 0) || (this.__changedTouches__ = [this]);
    }
  }
};

for (z in UIEventProto){
  UIEvent.prototype[z] = UIEventProto[z];
  Object.defineProperty(UIEvent.prototype, z, UIEventProto[z]);
}


/*** Custom Event Definitions ***/

  function addTap(el, tap, e){
    if (!el.__tap__) {
      el.__tap__ = { click: e.type == 'mousedown' };
      if (el.__tap__.click) el.addEventListener('click', tap.observer);
      else {
        el.__tap__.scroll = tap.observer.bind(el);
        window.addEventListener('scroll', el.__tap__.scroll, true);
        el.addEventListener('touchmove', tap.observer);
        el.addEventListener('touchcancel', tap.observer);
        el.addEventListener('touchend', tap.observer);
      }
    }
    if (!el.__tap__.click) {
      el.__tap__.x = e.touches[0].pageX;
      el.__tap__.y = e.touches[0].pageY;
    }
  }

  function removeTap(el, tap){
    if (el.__tap__) {
      if (el.__tap__.click) el.removeEventListener('click', tap.observer);
      else {
        window.removeEventListener('scroll', el.__tap__.scroll, true);
        el.removeEventListener('touchmove', tap.observer);
        el.removeEventListener('touchcancel', tap.observer);
        el.removeEventListener('touchend', tap.observer);
      }
      delete el.__tap__;
    }
  }

  function checkTapPosition(el, tap, e){
    var touch = e.changedTouches[0],
        tol = tap.gesture.tolerance;
    if (
      touch.pageX < el.__tap__.x + tol &&
      touch.pageX > el.__tap__.x - tol &&
      touch.pageY < el.__tap__.y + tol &&
      touch.pageY > el.__tap__.y - tol
    ) return true;
  }

  xtag.customEvents.tap = {
    observe: {
      mousedown: document,
      touchstart: document
    },
    gesture: {
      tolerance: 8
    },
    condition: function(e, tap){
      var el = e.target;
      switch (e.type) {
        case 'touchstart':
          if (el.__tap__ && el.__tap__.click) removeTap(el, tap);
          addTap(el, tap, e);
          return;
        case 'mousedown':
          if (!el.__tap__) addTap(el, tap, e);
          return;
        case 'scroll':
        case 'touchcancel':
          removeTap(this, tap);
          return;
        case 'touchmove':
        case 'touchend':
          if (this.__tap__ && !checkTapPosition(this, tap, e)) {
            removeTap(this, tap);
            return;
          }
          return e.type == 'touchend' || null;
        case 'click':
          removeTap(this, tap);
          return true;
      }
    }
  };

  win.xtag = xtag;
  if (typeof define == 'function' && define.amd) define(xtag);

  doc.addEventListener('WebComponentsReady', function(){
    xtag.fireEvent(doc.body, 'DOMComponentsLoaded');
  });

})();

// Copyright 2013 Erik Arvidsson
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
(function() {

  if (window.URL && window.URL.prototype && ('href' in window.URL.prototype))
    return;

  function URL(url, base) {
    if (!url)
      throw new TypeError('Invalid argument');

    var doc = document.implementation.createHTMLDocument('');
    if (base) {
      var baseElement = doc.createElement('base');
      baseElement.href = base;
      doc.head.appendChild(baseElement);
    }
    var anchorElement = doc.createElement('a');
    anchorElement.href = url;
    doc.body.appendChild(anchorElement);

    if (anchorElement.protocol === ':' || !/:/.test(anchorElement.href))
      throw new TypeError('Invalid URL');

    Object.defineProperty(this, '_anchorElement', {value: anchorElement});
  }

  URL.prototype = {
    toString: function() {
      return this.href;
    },

    get href() {
      return this._anchorElement.href;
    },
    set href(value) {
      this._anchorElement.href = value;
    },

    get protocol() {
      return this._anchorElement.protocol;
    },
    set protocol(value) {
      this._anchorElement.protocol = value;
    },

    // NOT IMPLEMENTED
    // get username() {
    //   return this._anchorElement.username;
    // },
    // set username(value) {
    //   this._anchorElement.username = value;
    // },

    // get password() {
    //   return this._anchorElement.password;
    // },
    // set password(value) {
    //   this._anchorElement.password = value;
    // },

    // get origin() {
    //   return this._anchorElement.origin;
    // },

    get host() {
      return this._anchorElement.host;
    },
    set host(value) {
      this._anchorElement.host = value;
    },

    get hostname() {
      return this._anchorElement.hostname;
    },
    set hostname(value) {
      this._anchorElement.hostname = value;
    },

    get port() {
      return this._anchorElement.port;
    },
    set port(value) {
      this._anchorElement.port = value;
    },

    get pathname() {
      return this._anchorElement.pathname;
    },
    set pathname(value) {
      this._anchorElement.pathname = value;
    },

    get search() {
      return this._anchorElement.search;
    },
    set search(value) {
      this._anchorElement.search = value;
    },

    get hash() {
      return this._anchorElement.hash;
    },
    set hash(value) {
      this._anchorElement.hash = value;
    }
  };

  var oldURL = window.URL || window.webkitURL || window.mozURL;

  URL.createObjectURL = function(blob) {
    return oldURL.createObjectURL.apply(oldURL, arguments);
  };

  URL.revokeObjectURL = function(url) {
    return oldURL.revokeObjectURL.apply(oldURL, arguments);
  };

  Object.defineProperty(URL.prototype, 'toString', {enumerable: false});

  window.URL = URL;
})();

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
window.HTMLImports = window.HTMLImports || {flags:{}};
/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

  // imports
  var path = scope.path;
  var xhr = scope.xhr;
  var flags = scope.flags;

  // TODO(sorvell): this loader supports a dynamic list of urls
  // and an oncomplete callback that is called when the loader is done.
  // The polyfill currently does *not* need this dynamism or the onComplete
  // concept. Because of this, the loader could be simplified quite a bit.
  var Loader = function(onLoad, onComplete) {
    this.cache = {};
    this.onload = onLoad;
    this.oncomplete = onComplete;
    this.inflight = 0;
    this.pending = {};
  };

  Loader.prototype = {
    addNodes: function(nodes) {
      // number of transactions to complete
      this.inflight += nodes.length;
      // commence transactions
      for (var i=0, l=nodes.length, n; (i<l) && (n=nodes[i]); i++) {
        this.require(n);
      }
      // anything to do?
      this.checkDone();
    },
    addNode: function(node) {
      // number of transactions to complete
      this.inflight++;
      // commence transactions
      this.require(node);
      // anything to do?
      this.checkDone();
    },
    require: function(elt) {
      var url = elt.src || elt.href;
      // ensure we have a standard url that can be used
      // reliably for deduping.
      // TODO(sjmiles): ad-hoc
      elt.__nodeUrl = url;
      // deduplication
      if (!this.dedupe(url, elt)) {
        // fetch this resource
        this.fetch(url, elt);
      }
    },
    dedupe: function(url, elt) {
      if (this.pending[url]) {
        // add to list of nodes waiting for inUrl
        this.pending[url].push(elt);
        // don't need fetch
        return true;
      }
      var resource;
      if (this.cache[url]) {
        this.onload(url, elt, this.cache[url]);
        // finished this transaction
        this.tail();
        // don't need fetch
        return true;
      }
      // first node waiting for inUrl
      this.pending[url] = [elt];
      // need fetch (not a dupe)
      return false;
    },
    fetch: function(url, elt) {
      flags.load && console.log('fetch', url, elt);
      if (url.match(/^data:/)) {
        // Handle Data URI Scheme
        var pieces = url.split(',');
        var header = pieces[0];
        var body = pieces[1];
        if(header.indexOf(';base64') > -1) {
          body = atob(body);
        } else {
          body = decodeURIComponent(body);
        }
        setTimeout(function() {
            this.receive(url, elt, null, body);
        }.bind(this), 0);
      } else {
        var receiveXhr = function(err, resource, redirectedUrl) {
          this.receive(url, elt, err, resource, redirectedUrl);
        }.bind(this);
        xhr.load(url, receiveXhr);
        // TODO(sorvell): blocked on)
        // https://code.google.com/p/chromium/issues/detail?id=257221
        // xhr'ing for a document makes scripts in imports runnable; otherwise
        // they are not; however, it requires that we have doctype=html in
        // the import which is unacceptable. This is only needed on Chrome
        // to avoid the bug above.
        /*
        if (isDocumentLink(elt)) {
          xhr.loadDocument(url, receiveXhr);
        } else {
          xhr.load(url, receiveXhr);
        }
        */
      }
    },
    receive: function(url, elt, err, resource, redirectedUrl) {
      this.cache[url] = resource;
      var $p = this.pending[url];
      if ( redirectedUrl && redirectedUrl !== url ) {
        this.cache[redirectedUrl] = resource;
        $p = $p.concat(this.pending[redirectedUrl]);
      }
      for (var i=0, l=$p.length, p; (i<l) && (p=$p[i]); i++) {
        //if (!err) {
          // If url was redirected, use the redirected location so paths are
          // calculated relative to that.
          this.onload(redirectedUrl || url, p, resource);
        //}
        this.tail();
      }
      this.pending[url] = null;
      if ( redirectedUrl && redirectedUrl !== url ) {
        this.pending[redirectedUrl] = null;
      }
    },
    tail: function() {
      --this.inflight;
      this.checkDone();
    },
    checkDone: function() {
      if (!this.inflight) {
        this.oncomplete();
      }
    }
  };

  xhr = xhr || {
    async: true,
    ok: function(request) {
      return (request.status >= 200 && request.status < 300)
          || (request.status === 304)
          || (request.status === 0);
    },
    load: function(url, next, nextContext) {
      var request = new XMLHttpRequest();
      if (scope.flags.debug || scope.flags.bust) {
        url += '?' + Math.random();
      }
      request.open('GET', url, xhr.async);
      request.addEventListener('readystatechange', function(e) {
        if (request.readyState === 4) {
          // Servers redirecting an import can add a Location header to help us
          // polyfill correctly.
          var locationHeader = request.getResponseHeader("Location");
          var redirectedUrl = null;
          if (locationHeader) {
            var redirectedUrl = (locationHeader.substr( 0, 1 ) === "/")
              ? location.origin + locationHeader  // Location is a relative path
              : redirectedUrl;                    // Full path
          }
          next.call(nextContext, !xhr.ok(request) && request,
              request.response || request.responseText, redirectedUrl);
        }
      });
      request.send();
      return request;
    },
    loadDocument: function(url, next, nextContext) {
      this.load(url, next, nextContext).responseType = 'document';
    }
  };

  // exports
  scope.xhr = xhr;
  scope.Loader = Loader;

})(window.HTMLImports);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

var IMPORT_LINK_TYPE = 'import';
var flags = scope.flags;
var isIe = /Trident/.test(navigator.userAgent);
// TODO(sorvell): SD polyfill intrusion
var mainDoc = window.ShadowDOMPolyfill ? 
    window.ShadowDOMPolyfill.wrapIfNeeded(document) : document;

// importParser
// highlander object to manage parsing of imports
// parses import related elements
// and ensures proper parse order
// parse order is enforced by crawling the tree and monitoring which elements
// have been parsed; async parsing is also supported.

// highlander object for parsing a document tree
var importParser = {
  // parse selectors for main document elements
  documentSelectors: 'link[rel=' + IMPORT_LINK_TYPE + ']',
  // parse selectors for import document elements
  importsSelectors: [
    'link[rel=' + IMPORT_LINK_TYPE + ']',
    'link[rel=stylesheet]',
    'style',
    'script:not([type])',
    'script[type="text/javascript"]'
  ].join(','),
  map: {
    link: 'parseLink',
    script: 'parseScript',
    style: 'parseStyle'
  },
  // try to parse the next import in the tree
  parseNext: function() {
    var next = this.nextToParse();
    if (next) {
      this.parse(next);
    }
  },
  parse: function(elt) {
    if (this.isParsed(elt)) {
      flags.parse && console.log('[%s] is already parsed', elt.localName);
      return;
    }
    var fn = this[this.map[elt.localName]];
    if (fn) {
      this.markParsing(elt);
      fn.call(this, elt);
    }
  },
  // only 1 element may be parsed at a time; parsing is async so each
  // parsing implementation must inform the system that parsing is complete
  // via markParsingComplete.
  // To prompt the system to parse the next element, parseNext should then be
  // called.
  // Note, parseNext used to be included at the end of markParsingComplete, but
  // we must not do this so that, for example, we can (1) mark parsing complete 
  // then (2) fire an import load event, and then (3) parse the next resource.
  markParsing: function(elt) {
    flags.parse && console.log('parsing', elt);
    this.parsingElement = elt;
  },
  markParsingComplete: function(elt) {
    elt.__importParsed = true;
    if (elt.__importElement) {
      elt.__importElement.__importParsed = true;
    }
    this.parsingElement = null;
    flags.parse && console.log('completed', elt);
  },
  invalidateParse: function(doc) {
    if (doc && doc.__importLink) {
      doc.__importParsed = doc.__importLink.__importParsed = false;
      this.parseSoon();
    }
  },
  parseSoon: function() {
    if (this._parseSoon) {
      cancelAnimationFrame(this._parseDelay);
    }
    var parser = this;
    this._parseSoon = requestAnimationFrame(function() {
      parser.parseNext();
    });
  },
  parseImport: function(elt) {
    // TODO(sorvell): consider if there's a better way to do this;
    // expose an imports parsing hook; this is needed, for example, by the
    // CustomElements polyfill.
    if (HTMLImports.__importsParsingHook) {
      HTMLImports.__importsParsingHook(elt);
    }
    elt.import.__importParsed = true;
    this.markParsingComplete(elt);
    // fire load event
    if (elt.__resource) {
      elt.dispatchEvent(new CustomEvent('load', {bubbles: false}));    
    } else {
      elt.dispatchEvent(new CustomEvent('error', {bubbles: false}));
    }
    // TODO(sorvell): workaround for Safari addEventListener not working
    // for elements not in the main document.
    if (elt.__pending) {
      var fn;
      while (elt.__pending.length) {
        fn = elt.__pending.shift();
        if (fn) {
          fn({target: elt});
        }
      }
    }
    this.parseNext();
  },
  parseLink: function(linkElt) {
    if (nodeIsImport(linkElt)) {
      this.parseImport(linkElt);
    } else {
      // make href absolute
      linkElt.href = linkElt.href;
      this.parseGeneric(linkElt);
    }
  },
  parseStyle: function(elt) {
    // TODO(sorvell): style element load event can just not fire so clone styles
    var src = elt;
    elt = cloneStyle(elt);
    elt.__importElement = src;
    this.parseGeneric(elt);
  },
  parseGeneric: function(elt) {
    this.trackElement(elt);
    document.head.appendChild(elt);
  },
  // tracks when a loadable element has loaded
  trackElement: function(elt, callback) {
    var self = this;
    var done = function(e) {
      if (callback) {
        callback(e);
      }
      self.markParsingComplete(elt);
      self.parseNext();
    };
    // NOTE:Android Browser lt 4.4 does not fire load event,fire directly is a good solution
     
	elt.addEventListener('load', done);
	elt.addEventListener('error', done);	
    if (elt.rel == "stylesheet") {
		(function(fn) {
			function _cssIsLoaded(cssStylesheet) {
				var cssLoaded = 0;
				try {
					if (cssStylesheet.sheet && cssStylesheet.sheet.cssRules.length > 0)
						cssLoaded = 1;
					else if (cssStylesheet.styleSheet && cssStylesheet.styleSheet.cssText.length > 0)
						cssLoaded = 1;
					else if (cssStylesheet.innerHTML && cssStylesheet.innerHTML.length > 0)
						cssLoaded = 1;
				} catch(ex) {
				}

				if (cssLoaded) {
					fn(new CustomEvent('load', {
						bubbles : false
					}));
					// your css is loaded! Do work!
					// I'd recommend having listeners subscribe to cssLoaded event,
					// and then here you can emit the event (ie. EventManager.emit('cssLoaded');
				} else {
					// I'm using underscore library, but setTimeout would work too
					// You basically just need to call the function again in say, 50 ms
					setTimeout(function() {
						_cssIsLoaded(cssStylesheet);
					}, 50);
				}

			}

			_cssIsLoaded(elt);
		})(done);
	}
    // NOTE: IE does not fire "load" event for styles that have already loaded
    // This is in violation of the spec, so we try our hardest to work around it
    if (isIe && elt.localName === 'style') {
      var fakeLoad = false;
      // If there's not @import in the textContent, assume it has loaded
      if (elt.textContent.indexOf('@import') == -1) {
        fakeLoad = true;
      // if we have a sheet, we have been parsed
      } else if (elt.sheet) {
        fakeLoad = true;
        var csr = elt.sheet.cssRules;
        var len = csr ? csr.length : 0;
        // search the rules for @import's
        for (var i = 0, r; (i < len) && (r = csr[i]); i++) {
          if (r.type === CSSRule.IMPORT_RULE) {
            // if every @import has resolved, fake the load
            fakeLoad = fakeLoad && Boolean(r.styleSheet);
          }
        }
      }
      // dispatch a fake load event and continue parsing
      if (fakeLoad) {
        done(new CustomEvent('load', {bubbles: false}));
      }
    }
  },
  // NOTE: execute scripts by injecting them and watching for the load/error
  // event. Inline scripts are handled via dataURL's because browsers tend to
  // provide correct parsing errors in this case. If this has any compatibility
  // issues, we can switch to injecting the inline script with textContent.
  // Scripts with dataURL's do not appear to generate load events and therefore
  // we assume they execute synchronously.
  parseScript: function(scriptElt) {
    var script = document.createElement('script');
    script.__importElement = scriptElt;
    script.src = scriptElt.src ? scriptElt.src : 
        generateScriptDataUrl(scriptElt);
    scope.currentScript = scriptElt;
    this.trackElement(script, function(e) {
      script.parentNode.removeChild(script);
      scope.currentScript = null;  
    });
    document.head.appendChild(script);
  },
  // determine the next element in the tree which should be parsed
  nextToParse: function() {
    return !this.parsingElement && this.nextToParseInDoc(mainDoc);
  },
  nextToParseInDoc: function(doc, link) {
    var nodes = doc.querySelectorAll(this.parseSelectorsForNode(doc));
    for (var i=0, l=nodes.length, p=0, n; (i<l) && (n=nodes[i]); i++) {
      if (!this.isParsed(n)) {
        if (this.hasResource(n)) {
          return nodeIsImport(n) ? this.nextToParseInDoc(n.import, n) : n;
        } else {
          return;
        }
      }
    }
    // all nodes have been parsed, ready to parse import, if any
    return link;
  },
  // return the set of parse selectors relevant for this node.
  parseSelectorsForNode: function(node) {
    var doc = node.ownerDocument || node;
    return doc === mainDoc ? this.documentSelectors : this.importsSelectors;
  },
  isParsed: function(node) {
    return node.__importParsed;
  },
  hasResource: function(node) {
    if (nodeIsImport(node) && !node.import) {
      return false;
    }
    return true;
  }
};

function nodeIsImport(elt) {
  return (elt.localName === 'link') && (elt.rel === IMPORT_LINK_TYPE);
}

function generateScriptDataUrl(script) {
  var scriptContent = generateScriptContent(script), b64;
  try {
    b64 = btoa(scriptContent);
  } catch(e) {
    b64 = btoa(unescape(encodeURIComponent(scriptContent)));
    console.warn('Script contained non-latin characters that were forced ' +
      'to latin. Some characters may be wrong.', script);
  }
  return 'data:text/javascript;base64,' + b64;
}

function generateScriptContent(script) {
  return script.textContent + generateSourceMapHint(script);
}

// calculate source map hint
function generateSourceMapHint(script) {
  var moniker = script.__nodeUrl;
  if (!moniker) {
    moniker = script.ownerDocument.baseURI;
    // there could be more than one script this url
    var tag = '[' + Math.floor((Math.random()+1)*1000) + ']';
    // TODO(sjmiles): Polymer hack, should be pluggable if we need to allow 
    // this sort of thing
    var matches = script.textContent.match(/Polymer\(['"]([^'"]*)/);
    tag = matches && matches[1] || tag;
    // tag the moniker
    moniker += '/' + tag + '.js';
  }
  return '\n//# sourceURL=' + moniker + '\n';
}

// style/stylesheet handling

// clone style with proper path resolution for main document
// NOTE: styles are the only elements that require direct path fixup.
function cloneStyle(style) {
  var clone = style.ownerDocument.createElement('style');
  clone.textContent = style.textContent;
  path.resolveUrlsInStyle(clone);
  return clone;
}

// path fixup: style elements in imports must be made relative to the main 
// document. We fixup url's in url() and @import.
var CSS_URL_REGEXP = /(url\()([^)]*)(\))/g;
var CSS_IMPORT_REGEXP = /(@import[\s]+(?!url\())([^;]*)(;)/g;

var path = {
  resolveUrlsInStyle: function(style) {
    var doc = style.ownerDocument;
    var resolver = doc.createElement('a');
    style.textContent = this.resolveUrlsInCssText(style.textContent, resolver);
    return style;  
  },
  resolveUrlsInCssText: function(cssText, urlObj) {
    var r = this.replaceUrls(cssText, urlObj, CSS_URL_REGEXP);
    r = this.replaceUrls(r, urlObj, CSS_IMPORT_REGEXP);
    return r;
  },
  replaceUrls: function(text, urlObj, regexp) {
    return text.replace(regexp, function(m, pre, url, post) {
      var urlPath = url.replace(/["']/g, '');
      urlObj.href = urlPath;
      urlPath = urlObj.href;
      return pre + '\'' + urlPath + '\'' + post;
    });    
  }
}

// exports
scope.parser = importParser;
scope.path = path;
scope.isIE = isIe;

})(HTMLImports);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

var hasNative = ('import' in document.createElement('link'));
var useNative = hasNative;
var flags = scope.flags;
var IMPORT_LINK_TYPE = 'import';

// TODO(sorvell): SD polyfill intrusion
var mainDoc = window.ShadowDOMPolyfill ? 
    ShadowDOMPolyfill.wrapIfNeeded(document) : document;

if (!useNative) {

  // imports
  var xhr = scope.xhr;
  var Loader = scope.Loader;
  var parser = scope.parser;

  // importer
  // highlander object to manage loading of imports

  // for any document, importer:
  // - loads any linked import documents (with deduping)

  var importer = {
    documents: {},
    // nodes to load in the mian document
    documentPreloadSelectors: 'link[rel=' + IMPORT_LINK_TYPE + ']',
    // nodes to load in imports
    importsPreloadSelectors: [
      'link[rel=' + IMPORT_LINK_TYPE + ']'
    ].join(','),
    loadNode: function(node) {
      importLoader.addNode(node);
    },
    // load all loadable elements within the parent element
    loadSubtree: function(parent) {
      var nodes = this.marshalNodes(parent);
      // add these nodes to loader's queue
      importLoader.addNodes(nodes);
    },
    marshalNodes: function(parent) {
      // all preloadable nodes in inDocument
      return parent.querySelectorAll(this.loadSelectorsForNode(parent));
    },
    // find the proper set of load selectors for a given node
    loadSelectorsForNode: function(node) {
      var doc = node.ownerDocument || node;
      return doc === mainDoc ? this.documentPreloadSelectors :
          this.importsPreloadSelectors;
    },
    loaded: function(url, elt, resource) {
      flags.load && console.log('loaded', url, elt);
      // store generic resource
      // TODO(sorvell): fails for nodes inside <template>.content
      // see https://code.google.com/p/chromium/issues/detail?id=249381.
      elt.__resource = resource;
      if (isDocumentLink(elt)) {
        var doc = this.documents[url];
        // if we've never seen a document at this url
        if (!doc) {
          // generate an HTMLDocument from data
          doc = makeDocument(resource, url);
          doc.__importLink = elt;
          // TODO(sorvell): we cannot use MO to detect parsed nodes because
          // SD polyfill does not report these as mutations.
          this.bootDocument(doc);
          // cache document
          this.documents[url] = doc;
        }
        // don't store import record until we're actually loaded
        // store document resource
        elt.import = doc;
      }
      parser.parseNext();
    },
    bootDocument: function(doc) {
      this.loadSubtree(doc);
      this.observe(doc);
      parser.parseNext();
    },
    loadedAll: function() {
      parser.parseNext();
    }
  };

  // loader singleton
  var importLoader = new Loader(importer.loaded.bind(importer), 
      importer.loadedAll.bind(importer));

  function isDocumentLink(elt) {
    return isLinkRel(elt, IMPORT_LINK_TYPE);
  }

  function isLinkRel(elt, rel) {
    return elt.localName === 'link' && elt.getAttribute('rel') === rel;
  }

  function isScript(elt) {
    return elt.localName === 'script';
  }

  function makeDocument(resource, url) {
    // create a new HTML document
    var doc = resource;
    if (!(doc instanceof Document)) {
      doc = document.implementation.createHTMLDocument(IMPORT_LINK_TYPE);
    }
    // cache the new document's source url
    doc._URL = url;
    // establish a relative path via <base>
    var base = doc.createElement('base');
    base.setAttribute('href', url);
    // add baseURI support to browsers (IE) that lack it.
    if (!doc.baseURI) {
      doc.baseURI = url;
    }
    // ensure UTF-8 charset
    var meta = doc.createElement('meta');
    meta.setAttribute('charset', 'utf-8');

    doc.head.appendChild(meta);
    doc.head.appendChild(base);
    // install HTML last as it may trigger CustomElement upgrades
    // TODO(sjmiles): problem wrt to template boostrapping below,
    // template bootstrapping must (?) come before element upgrade
    // but we cannot bootstrap templates until they are in a document
    // which is too late
    if (!(resource instanceof Document)) {
      // install html
      doc.body.innerHTML = resource;
    }
    // TODO(sorvell): ideally this code is not aware of Template polyfill,
    // but for now the polyfill needs help to bootstrap these templates
    if (window.HTMLTemplateElement && HTMLTemplateElement.bootstrap) {
      HTMLTemplateElement.bootstrap(doc);
    }
    return doc;
  }
} else {
  // do nothing if using native imports
  var importer = {};
}

// NOTE: We cannot polyfill document.currentScript because it's not possible
// both to override and maintain the ability to capture the native value;
// therefore we choose to expose _currentScript both when native imports
// and the polyfill are in use.
var currentScriptDescriptor = {
  get: function() {
    return HTMLImports.currentScript || document.currentScript;
  },
  configurable: true
};

Object.defineProperty(document, '_currentScript', currentScriptDescriptor);
Object.defineProperty(mainDoc, '_currentScript', currentScriptDescriptor);

// Polyfill document.baseURI for browsers without it.
if (!document.baseURI) {
  var baseURIDescriptor = {
    get: function() {
      return window.location.href;
    },
    configurable: true
  };

  Object.defineProperty(document, 'baseURI', baseURIDescriptor);
  Object.defineProperty(mainDoc, 'baseURI', baseURIDescriptor);
}

// call a callback when all HTMLImports in the document at call (or at least
//  document ready) time have loaded.
// 1. ensure the document is in a ready state (has dom), then 
// 2. watch for loading of imports and call callback when done
function whenImportsReady(callback, doc) {
  doc = doc || mainDoc;
  // if document is loading, wait and try again
  whenDocumentReady(function() {
    watchImportsLoad(callback, doc);
  }, doc);
}

// call the callback when the document is in a ready state (has dom)
var requiredReadyState = HTMLImports.isIE ? 'complete' : 'interactive';
var READY_EVENT = 'readystatechange';
function isDocumentReady(doc) {
  return (doc.readyState === 'complete' ||
      doc.readyState === requiredReadyState);
}

// call <callback> when we ensure the document is in a ready state
function whenDocumentReady(callback, doc) {
  if (!isDocumentReady(doc)) {
    var checkReady = function() {
      if (doc.readyState === 'complete' || 
          doc.readyState === requiredReadyState) {
        doc.removeEventListener(READY_EVENT, checkReady);
        whenDocumentReady(callback, doc);
      }
    }
    doc.addEventListener(READY_EVENT, checkReady);
  } else if (callback) {
    callback();
  }
}

// call <callback> when we ensure all imports have loaded
function watchImportsLoad(callback, doc) {
  var imports = doc.querySelectorAll('link[rel=import]');
  var loaded = 0, l = imports.length;
  function checkDone(d) { 
    if (loaded == l) {
      callback && callback();
    }
  }
  function loadedImport(e) {
    loaded++;
    checkDone();
  }
  if (l) {
    for (var i=0, imp; (i<l) && (imp=imports[i]); i++) {
      if (isImportLoaded(imp)) {
        loadedImport.call(imp);
      } else {
        imp.addEventListener('load', loadedImport);
        imp.addEventListener('error', loadedImport);
      }
    }
  } else {
    checkDone();
  }
}

function isImportLoaded(link) {
  return useNative ? (link.import && (link.import.readyState !== 'loading')) || link.__loaded :
      link.__importParsed;
}

// TODO(sorvell): install a mutation observer to see if HTMLImports have loaded
// this is a workaround for https://www.w3.org/Bugs/Public/show_bug.cgi?id=25007
// and should be removed when this bug is addressed.
if (useNative) {
  new MutationObserver(function(mxns) {
    for (var i=0, l=mxns.length, m; (i < l) && (m=mxns[i]); i++) {
      if (m.addedNodes) {
        handleImports(m.addedNodes);
      }
    }
  }).observe(document.head, {childList: true});

  function handleImports(nodes) {
    for (var i=0, l=nodes.length, n; (i<l) && (n=nodes[i]); i++) {
      if (isImport(n)) {
        handleImport(n);  
      }
    }
  }

  function isImport(element) {
    return element.localName === 'link' && element.rel === 'import';
  }

  function handleImport(element) {
    var loaded = element.import;
    if (loaded) {
      markTargetLoaded({target: element});
    } else {
      element.addEventListener('load', markTargetLoaded);
      element.addEventListener('error', markTargetLoaded);
    }
  }

  function markTargetLoaded(event) {
    event.target.__loaded = true;
  }

}

// exports
scope.hasNative = hasNative;
scope.useNative = useNative;
scope.importer = importer;
scope.whenImportsReady = whenImportsReady;
scope.IMPORT_LINK_TYPE = IMPORT_LINK_TYPE;
scope.isImportLoaded = isImportLoaded;
scope.importLoader = importLoader;

})(window.HTMLImports);

 /*
Copyright 2013 The Polymer Authors. All rights reserved.
Use of this source code is governed by a BSD-style
license that can be found in the LICENSE file.
*/

(function(scope){

var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;
var importSelector = 'link[rel=' + IMPORT_LINK_TYPE + ']';
var importer = scope.importer;
var parser = scope.parser;

// we track mutations for addedNodes, looking for imports
function handler(mutations) {
  for (var i=0, l=mutations.length, m; (i<l) && (m=mutations[i]); i++) {
    if (m.type === 'childList' && m.addedNodes.length) {
      addedNodes(m.addedNodes);
    }
  }
}

// find loadable elements and add them to the importer
function addedNodes(nodes) {
  var owner;
  for (var i=0, l=nodes.length, n; (i<l) && (n=nodes[i]); i++) {
    owner = owner || n.ownerDocument;
    if (shouldLoadNode(n)) {
      importer.loadNode(n);
    }
    if (n.children && n.children.length) {
      addedNodes(n.children);
    }
  }
  // TODO(sorvell): This is not the right approach here. We shouldn't need to
  // invalidate parsing when an element is added. Disabling this code 
  // until a better approach is found.
  /*
  if (owner) {
    parser.invalidateParse(owner);
  }
  */
}

function shouldLoadNode(node) {
  return (node.nodeType === 1) && matches.call(node,
      importer.loadSelectorsForNode(node));
}

// x-plat matches
var matches = HTMLElement.prototype.matches || 
    HTMLElement.prototype.matchesSelector || 
    HTMLElement.prototype.webkitMatchesSelector ||
    HTMLElement.prototype.mozMatchesSelector ||
    HTMLElement.prototype.msMatchesSelector;

var observer = new MutationObserver(handler);

// observe the given root for loadable elements
function observe(root) {
  observer.observe(root, {childList: true, subtree: true});
}

// exports
// TODO(sorvell): factor so can put on scope
scope.observe = observe;
importer.observe = observe;

})(HTMLImports);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(){

// bootstrap

// IE shim for CustomEvent
if (typeof window.CustomEvent !== 'function') {
  window.CustomEvent = function(inType, dictionary) {
     var e = document.createEvent('HTMLEvents');
     e.initEvent(inType,
        dictionary.bubbles === false ? false : true,
        dictionary.cancelable === false ? false : true,
        dictionary.detail);
     return e;
  };
}

// TODO(sorvell): SD polyfill intrusion
var doc = window.ShadowDOMPolyfill ? 
    window.ShadowDOMPolyfill.wrapIfNeeded(document) : document;

// Fire the 'HTMLImportsLoaded' event when imports in document at load time 
// have loaded. This event is required to simulate the script blocking 
// behavior of native imports. A main document script that needs to be sure
// imports have loaded should wait for this event.
HTMLImports.whenImportsReady(function() {
  HTMLImports.ready = true;
  HTMLImports.readyTime = new Date().getTime();
  doc.dispatchEvent(
    new CustomEvent('HTMLImportsLoaded', {bubbles: true})
  );
});


// no need to bootstrap the polyfill when native imports is available.
if (!HTMLImports.useNative) {
  function bootstrap() {
    HTMLImports.importer.bootDocument(doc);
  }
    
  // TODO(sorvell): SD polyfill does *not* generate mutations for nodes added
  // by the parser. For this reason, we must wait until the dom exists to 
  // bootstrap.
  if (document.readyState === 'complete' ||
      (document.readyState === 'interactive' && !window.attachEvent)) {
    bootstrap();
  } else {
    document.addEventListener('DOMContentLoaded', bootstrap);
  }
}

})();

/**
 * @fileoverview fox命名空间
 */

(function(env) {

	if (env.fox) {
		return;
	}

	var vendor = env.xtag;

	var fox = env.fox = function() {
		return fox.fn && fox.fn.apply(this, arguments);
	};

	fox.fn = function(tagName, options, parent) {
		return fox.fn.register(tagName, options);
	};

})(this);

rivets.binders['background-image'] = function(el, value) {
	el.style["backgroundImage"] = "url(" + value + ")";
};

rivets.binders['class'] = function(el, value) {
	
	if(el._rivetCls){
		$(el).removeClass(el._rivetCls);
	}
	$(el).addClass(value);
	
	el._rivetCls = value;
	
}; 
(function( env ) {

    var undefined;

    var fox = env.fox;
    var vendor = env.xtag;

    fox.mixin = function(target, source) {
        for (var key in source) {

            if (source[key] !== undefined) {
                target[key] = source[key];
            }

        }
    };


    fox.query = function(el, selector) {
        return vendor.query(el, selector);
    }

    fox.queryChildren = function(el, selector) {
        return vendor.queryChildren(el, selector);
    }

    fox.bind = function(fn, context) {

        if (typeof fn.bind === 'function') {
            return fn.bind(context);
        }

        return function() {
            return fn.apply(context, arguments);
        };
    }

    fox.fireEvent = function(el, type, data) {
        return vendor.fireEvent(el, type, data);
    }

    fox.addEvent = function(el, event, callback) {
        return vendor.addEvent(el, event, callback);
    }

    fox.addEvents = function(el, events) {
        return vendor.addEvents(el, events);
    }

    fox.toArray = function(arrayLikeObject) {
        return Array.prototype.slice.call(arrayLikeObject);
    }

})(this);

(function( env ) {

    var fox = env.fox;

    fox.debug = true;

    fox.log = function(msg, type) {
        if (!fox.debug || !('console' in env)) {
            return;
        }

        console.log(msg);
    };

})(this);

(function( env ) {

    var undefined;

    var fox = env.fox;

    fox.fn.extendTag = function (tagName, options, parent) {
        var originCreated;
        var lifecycle = options.lifecycle || (options.lifecycle = {});
        var parentInst = document.createElement(parent);
        var proto = parentInst.__proto__ || Object.getPrototypeOf(parentInst);

        // change prototype
        options.prototype = proto;

        if (lifecycle.created) {
            originCreated = lifecycle.created;
        }

        options.lifecycle.created = function() {
            //take parent's created callback as constructor
            proto.createdCallback.apply(this, arguments);

            // $super
            this.$super = proto;

            originCreated && originCreated.apply(this, arguments);
        }
    };

})(this);

(function(env) {

	var undefined;

	var fox = env.fox;

	function getTplAndAttribute(el) {
		
		var tpl = el.querySelector('tpl');
		var meta = {
			tmpl: null,
			attributes: [],
			extends: null
		};

		if (tpl) {
			meta['tmpl'] = tpl;
		}

		meta['extends'] =  el.getAttribute('extends');

		var attributes = el.getAttribute('attributes');
		meta['attributes'] = attributes && attributes.split(' ') || [];

		return meta;
	}
	
	function getImportLinks(doc,arr){
	 	var links = doc.querySelectorAll('link[rel="import"]');
	 	for(var i = 0;i<links.length;i++){
	 		var link = links[i];
	 		arr.push(link);
	 		getImportLinks(link.import,arr);
	 	}
	}

    // TODO: 目前只解析以 <link rel="import"/> 方式载入的标签定义，需要增加对于 inline 以及 innerHTML 的解析
	function getOwnTplAndAttribute(elementName) {
		var links = [];
		getImportLinks(document,links);
		// var links = document.querySelectorAll('link[rel="import"]');
		
		var foxuiEl;

		for (var i = 0; i < links.length; i++) {
			var link = links[i];
			var foxui = link.import.querySelector(
                'fox-element[name="' + elementName + '"]');

			if (foxui) {
				foxuiEl = foxui;
				break;
			}
		}

		var result = {};

		if (foxuiEl) {
			result = getTplAndAttribute(foxuiEl);

		}

		return result;
	}

	var registerArr = [];

	function register(elementName, option) {
		window.addEventListener('HTMLImportsLoaded', function(e) {
			if (registerArr.indexOf(elementName) == -1) {
				_register(elementName, option);
				registerArr.push(elementName);
			}
	        else {
	            throw new Error( elementName + ' already defined.' );
	        }
		},true);


	}

	function _register(elementName, option) {

		var own = getOwnTplAndAttribute(elementName);

        option = option || {};

        if (!option.lifecycle) {
            option.lifecycle = {};
        }

        // 扩展数据源支持
        fox.fn.datasource(option);

		own['extends'] &&  fox.fn.extendTag(elementName, option, own['extends']);

		option.accessors = option.accessors || {};


		own['attributes'] && own['attributes'].forEach(function(v) {
			option.accessors[v] = {
				attribute : true
			}
		});

        var originCreated = option.lifecycle.created;

        var originAttrChange = option.lifecycle.attributeChanged;
		
        option.lifecycle.created = function() {
            var self = this;

            if(own['tmpl']){
            	
            	var $tmpl = $(own['tmpl']).clone(true);
           
           		$tmpl['rivets'] = rivets.bind($tmpl.get(0), this);
           
            	
            	var $children = $(this).children();
            	
                $('content', $tmpl).replaceWith($children);
                
                
                
                $(this).empty();
                
				$('fox-tmpl',$tmpl).each(function(){
					rivets.bind(this, this);
				});
				
                var _$ = {};

                $('[id]', $tmpl).each(function() {
                    _$[$(this).attr('id')] = this;
                });
                this.$ = _$;
                $(this).append($tmpl.children());
            }
            
            
 			

            originCreated && originCreated.apply(this, arguments);
        };

        option.lifecycle.attributeChanged = function(attr, oldVal, newVal) {
        	var attrChangeFn = option.lifecycle[attr+'Changed'];
        	attrChangeFn&&attrChangeFn.call(this,oldVal, newVal);
        	originAttrChange && originAttrChange.apply(this, arguments);
        }

		xtag.register(elementName, option);
	}


	fox.fn.register = register;
})(this);

/**
 * 单页导航和多页导航处理
 *
 * A 标签上的属性：
 *
 * disable-pjax：如果有该属性表示禁止使用 ajax 导航功能；
 * transition: 页面切换效果
 * title: 页面标题
 * fox-push-mode:
 *     stack: always push new page
 *     single: reuse existed page with the same href
 *
 * TODO:
 * 1. 当页面导航到N页并直接刷新会导致前进、后退的判断失效
 * 因为浏览器的 state 记录和 stacks 的已经不同步的
 * 可能的解决方案是借助 sessionStorage 进行 stacks 的备份和恢复
 *
 * 2. 在 ios7 safari 中，可以通过swipe来前进后退，触发 popstate，但是会出现页面抖动。
 * 这个和 popstate 中的动画处理有关，目前未找到解决方案，原因是无法识别是点击按钮还是手势进行导航。
 * 可能的解决方案是记录用户最近touchmove结束时间，并在popstate时进行判断，如果识别为 swipe 则停止动画
 */
(function(env){
    var fox = env.fox;
    var $ = env.$;
    var stacks = [];
    var pageIDMap = {};
    var id = 0;
    var backward = false;
    var mainPage = '.main-page';
    var indexTitle = document.title;

    // 处理问题2
    var lastTouchMoveTime;
    // 阈值太大会有副作用（例如上下滑动后点击链接会导致无动画效果），酌情调整
    // 阈值太小会导致失效
    var swipeDetectThreashold = 400;

    function delegate() {
        var targets = 'a[href]';
        var me = this;

        $(document).on('click', targets, function(e){

            if (this.hasAttribute('disable-pjax')) {
                return;
            }

            e.preventDefault();

            var href = this.getAttribute('href');
            var title = this.getAttribute('title');
            var transition = this.getAttribute('transition');
            var pushMode = this.getAttribute('fox-push-mode');

            if (href) {
                me.navigate(href, title, transition, pushMode);
            }
        });
    }

    function clearPage(page) {
        if (page) {
            !page._anchor_ && page.parentNode.removeChild(page);
        }
    }

    function onPopState(e) {

        // current state already turns to new page
        // stacks still stay in last status
        var state = history.state || e.state;
        var outData;
        var inPage;
        var outPage;

        // 处理问题2
        // var animation = true;
        var animation = nav.animation &&
            (!lastTouchMoveTime ||((Date.now() - lastTouchMoveTime) > swipeDetectThreashold)) ? true : false;

        var previousData = stacks[stacks.length -2];

        // back to index page or previous page
        if (!state || (previousData && (previousData.href === state.href))) {
            backward = true;
            outData = stacks.pop();

            // swtich
            outPage = outData ? outData.page : null;

            // index page
            if (!state) {
                inPage = $(mainPage)[0];
            }
            else {
                inPage = previousData.page;
            }

            document.title = indexTitle;
        }
        else {
            backward = false;
            outData = stacks[stacks.length-1];
            outPage = (outData && outData.page) || $(mainPage)[0];
            inPage = preparePageDom(state.href, state.transition, state.title, state.pushMode);

            stacks.push({href: state.href, page: inPage});

            state.title && (document.title = state.title);
        }

        if (outPage) {

            outPage.transition = outPage.transition || nav.defaultTransition;

            // only remove the out page in backward direction
            if (backward && (!animation || outPage.transition === 'display')) {
                clearPage(outPage);
            }
            else {
                // backward and animate
                if (backward) {
                    function transitionEnd(){
                        outPage.removeEventListener('transitionend', transitionEnd, false);
                        outPage.removeEventListener('webkitTransitionEnd', transitionEnd, false);
                        clearPage(outPage);
                    }
                    outPage.addEventListener('transitionend', transitionEnd, false);
                    outPage.addEventListener('webkitTransitionEnd', transitionEnd, false);
                }

                outPage.hide(animation, backward);
            }
        }

        if (inPage) {
            inPage.transition = inPage.transition || nav.defaultTransition;
            inPage.show(animation, backward);
        }
    }

    function preparePageDom(href, transition, title, pushMode) {
        var page;
        transition = transition || nav.defaultTransition;

        // anchor
        if (href.indexOf('#') === 0) {

            // take href as page's id
            page = $(href)[0];

            if (!page) {
                return;
            }

            page._anchor_ = true;
        }
        // reuse page or create new page
        else {

            if (pushMode === 'single') {
                var pageId = pageIDMap[href];
                page = fox.query(document, 'fox-page[fox-page-id="' + pageId + '"]')[0];
            }

            if (!page) {
                page = document.createElement('fox-page');
                page.class = 'transition-out';

                pageIDMap[href] = (++id);
                page.setAttribute('fox-page-id', id);

                page.innerHTML =
                    '<fox-toolbar title="' + (title || '') + '">' +
                        // '<fox-icon icon="icon-left-nav" class="left" onclick="history.back();">' +
                        // '</fox-icon>' +
                        '<fox-icon icon="icon-spin5" class="right animate-spin">' +
                        '</fox-icon>' +
                    '</fox-toolbar>' +
                    '<fox-page-content></fox-page-content>';
                document.body.appendChild(page);

                new Linker(href, page);
            }

        }

        // set default transition
        // The order is : page's transition > link's transition > default transition
        if (transition && !page.transition) {
            page.transition = transition;
        }

        return page;
    }

    // Nav core code
    //===========================
    var nav = fox.navigator = {
        // disable navigator
        disabled: false,

        // global config - use animation
        animation: true,

        // global config - default transition effect
        defaultTransition: 'display',

        start: function() {

            if (this.disabled || this.started) {
                return;
            }

            // clear state on startup
            history.replaceState();

            this.started = true;

            window.addEventListener('popstate', function(e) {
                onPopState(e);
            }, false);

            delegate.apply(this);

            // init state only at hash mode
            if (location.hash) {
                var state = history.state;

                if (state) {
                    var inPage = preparePageDom(state.href, state.transition, state.title, state.pushMode);
                    var outPage = $(mainPage)[0];

                    stacks.push({href: state.href, page: inPage});
                    outPage && outPage.hide();
                    inPage && inPage.show();
                    state.title && (document.title = state.title);
                }
            }
        },

        navigate: function(href, title, transition, pushMode) {

            if( history.state && history.state.href === href) {
                return;
            }

            var inPage = preparePageDom(href, transition, title, pushMode);
            var outPage;

            // query current page
            if (!stacks.length) {
                // index page
                outPage = $(mainPage)[0];
            }
            else {
                outPage = stacks[stacks.length-1].page;
            }

            if (outPage) {
                outPage.transition = outPage.transition || nav.defaultTransition;
                outPage.hide(nav.animation);
            }

            // push next state
            stacks.push({href: href, page: inPage});

            if (inPage) {
                inPage.transition = inPage.transition || nav.defaultTransition;
                inPage.show(nav.animation);
            }

            history.pushState({
                    href:href,
                    transition: transition,
                    title: title,
                    pushMode: pushMode
                },
                title,
                href
            );

            title && (document.title = title);

            // onPopState();
        }
    };

    // To load, parse and insert the linking page
    // =========================================

    // resolve relative path to absolute path
    function resolvePath(relPath, curPath) {
        var url = location;

        // TODO:
        // window.URL is not supported well in mobile, replace with polyfill
        if (curPath) {
            url = new (window.URL || window.webkitURL)(curPath);
        }

        // ignore absolute path
        if (/^(http\:|https\:)/.test(relPath)) {
            return relPath;
        }

        var host = url.hostname;
        var paths = url.pathname.split('/');
        var relPaths = relPath.split('/');
        var protocol = url.protocol;

        paths.pop();

        while(relPaths.length) {
            var part = relPaths.shift();

            if (part === '..') {
                paths.pop();
            }
            else if(part && part !== '.') {
                paths.push(part);
            }
        }

        return protocol + '//' + host + paths.join('/');
    }

    /**
     * 默认规则：在使用 ajax 导航的情况下，一个页面应该只有一个 fox-page
     */
    function parsePage(pagePath, content) {
        var head;
        var body;
        var bodyHTML;
        var pageHTML;
        var title;

        // existed sources
        var existedScripts = fox.query(document, 'script[src]');
        var existedScriptPaths = [];

        existedScripts.forEach(function(script){
            existedScriptPaths.push(resolvePath(script.src, pagePath));
        });

        // TODO:
        // add recursively query
        var existedImports = fox.query(document, 'link[rel=import]');
        var existedImportPaths = [];

        existedImports.forEach(function(link){
            existedImportPaths.push(resolvePath(link.href, pagePath));
        });

        // TODO:
        // add inline style parse
        var existedStyles = fox.query(document, 'link[rel=stylesheet]');
        var existedStylePaths = [];

        existedStyles.forEach(function(link){
            existedStylePaths.push(resolvePath(link.href, pagePath));
        });

        // source in content
        function linkRegexp(type) {
            return new RegExp('<link[^>]*? rel=(?:\'|")' + type + '(?:\'|")[^>]*? href=(?:\'|")(.+?)(?:\'|")[^>]*?>', 'g');
        }

        var rImport = linkRegexp('import');
        // var rStyle = linkRegexp('stylesheet');

        // 清除重复的tag import，防止重复加载
        content = content.replace(rImport, function(match, href) {
            var path = resolvePath(href, pagePath);

            if (existedImportPaths.indexOf(path) > -1) {
                return '';
            }
            else {
                return match;
            }
        });

        //scripts in content
        var scripts = [];

        //styles in content
        var styles = [];

        var rPage = /(<fox-page[^>]*>)([\s\S.]*)(<\/fox-page>)/i;

        if (/<html/i.test(content)) {
            head = document.createElement('div');
            body = document.createElement('div');
            bodyHTML = content.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0];
            head.innerHTML = content.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0];

        // Page fragment
        } else {
            head = body = document.createElement('div');
            bodyHTML = content;
        }

        pageHTML = (bodyHTML.match(rPage)||[])[2];

        // 仅将 fox-page 之外的内容放入临时 div 查找
        // 因为 fox-page 的渲染成本比较高
        body.innerHTML = bodyHTML.replace(rPage, function(match, start, html, end) {
            return start + end;
        });

        scripts = scripts.concat(fox.query(head, 'script'));
        scripts = scripts.concat(fox.query(body, 'script'));

        styles = styles.concat(fox.query(head, 'link[rel="stylesheet"]'));
        styles = styles.concat(fox.query(body, 'link[rel="stylesheet"]'));

        var scriptsToLoad = [];

        scripts.forEach(function(script) {
            if ((!script.type || (script.type.toLowerCase() == 'text/javascript'))) {
                if (script.src
                    && existedScriptPaths.indexOf(resolvePath(script.src, pagePath)) === -1 ) {
                    scriptsToLoad.push(script);
                }
                else if (!script.src) {
                    scriptsToLoad.push(script);
                }
            }
        });

        var stylesToLoad = [];

        styles.forEach(function(style) {
            if (style.href
                && existedStylePaths.indexOf(resolvePath(style.href, pagePath)) === -1 ) {
                stylesToLoad.push(style);
            }
        });

        // parse and set title
        title = head.querySelector('title');
        var text = 'innerText' in title ? 'innerText' : 'textContent';
        title = title && title[text].trim();

        return {
            title: title,
            scripts: scriptsToLoad,
            styles: stylesToLoad,
            head: head,
            body: body,
            page: pageHTML
        }
    }

    function Linker(href, placeholder, timeout) {

        if (!href || !placeholder) {
            return;
        }

        this.placeholder = placeholder;
        this.timeout = timeout;
        this.href = resolvePath(href);

        this.request(href);
    }

    Linker.prototype = (function(){

        return {

            resetXHR: function(href) {

                var xhr = this.xhr;

                if (xhr && xhr.readyState < 4) {
                  xhr.onreadystatechange = function(){};
                  xhr.abort();
                }
                else {
                    xhr = this.xhr = new XMLHttpRequest();
                    xhr.open('GET', href, true);
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                }
            },

            request: function(href) {
                this.resetXHR(href);

                var xhr = this.xhr;
                var me = this;

                xhr.onreadystatechange = function () {

                    if (me._timeout) {
                        clearTimeout(me._timeout);
                    }

                    if (xhr.readyState === 4) {
                        xhr.status === 200 ? me.success() : me.failure();
                    }
                };

                if (this.timeout) {
                    this._timeout = setTimeout(function() {
                        xhr.abort('timeout');
                    }, this.timeout);
                }

                xhr.send();
            },

            success: function() {
                // parse response
                var page;
                var pageHTML;
                var responseText = this.xhr.responseText;
                var me = this;

                if (!responseText) {
                    return
                }

                var pageData = parsePage(this.href, responseText);

                if (pageData) {
                    pageData.title && (document.title = pageData.title);

                    // load styles in need
                    if (pageData.styles.length) {
                        pageData.styles.forEach(function(style){
                            if (style.href) {
                                var s = document.createElement('link');
                                s.rel = 'stylesheet';
                                s.href = resolvePath(style.href, me.href);;
                                document.head.appendChild(s);
                            }
                        });
                    }

                    // replace placeholder
                    pageHTML = pageData.page;
                    page = pageData.body.querySelector('fox-page');

                    if (page && me.placeholder.parentNode) {
                        me.placeholder.innerHTML = pageHTML;

                        // copy attributes
                        fox.toArray(page.attributes).forEach(function(attr) {
                            if (attr.name !== 'class') {
                                me.placeholder.setAttribute(attr.name, attr.value);
                            }
                        });

                        fox.toArray(page.classList).forEach(function(cls){
                            if (('.' + cls) !== mainPage) {
                                me.placeholder.classList.add(cls);
                            }
                        });
                    }

                    // load script in need
                    if (pageData.scripts.length) {
                        pageData.scripts.forEach(function(script){
                            if (!script.src) {
                                ( window.execScript || function( data ) {
                                    window[ 'eval' ].call( window, data );
                                } )( script.textContent );
                            }
                            else {
                                var s = document.createElement('script');
                                s.src = resolvePath(script.src, me.href);
                                document.head.appendChild(s);
                            }
                        });
                    }
                }
            },

            failure: function() {
                // TODO
            }
        };
    })();


    // TODO:
    // 存在隐患，如果这段JS在事件触发之后执行的话将导致代码不会运行，应该统一注册方法并检测Imports状态
    document.addEventListener('HTMLImportsLoaded', function(){
        nav.start();

        // 处理问题2
        // TODO: 目前只监听 touchmove，可以精确到 swipe 手势并且从边框开始滑动
        document.addEventListener('touchmove', function(){
            lastTouchMoveTime = Date.now();
        }, false);
    }, false);
})(this);

/**
 * ## 为所有非数据源组件添加数据源功能
 *
 * ### data setter/getter (property)
 *
 * 所有非数据源组件都包括 data 属性，data 属性变化时会尝试调用组件的以下方法：
 *
 * * datasourceChanged: 组件在此方法中可以针对数据源变更进行处理
 * * datasourceFiler: 将次方法返回的数据作为最终的数据源，可以自行设定过滤规则
 *
 * ### 关联数据源组件
 *
 * 可以将组件关联对应的数据源组件，当数据源发生变化时会将最新的数据同步到关联组件上。
 *
 * #### sourceSelector (attribute)
 *
 * 通过该属性可以设定组件关联的数据源组件，有以下两种类型
 *
 * * 选择符：为 CSS Selector，例如 #movieData
 * * 全局数据：以 @ 开头，会从全局数据中获取，例如 @data.products
 *
 * #### 内嵌数据源
 *
 * 例如：
 * <fox-my>
 *     <fox-json></fox-json>
 * </fox-my>
 */

(function( env ) {

    var fox = env.fox;
    var dataTags = ['fox-json', 'fox-ajax'];
    var dataContainerTags = ['fox-model'];
    var callback = 'datasourceChanged';
    var dataFilter = 'datasourceFilter';

    /**
     * 数据源声明的三种场景：
     * 优先级为：1,2 > 3
     * 1.
     * <fox-element sourceSelector="fox-json"></fox-element>
     *
     * 2.
     * <fox-element sourceSelector="@data.items"></fox-element>
     * <script>
     * var data = {
     *     items: []
     * };
     * </script>
     *
     * 3.
     * <fox-element>
     *     <fox-json></fox-json>
     * </fox-element>
     */
    function parseDataSource() {
        var ss = this.sourceselector;
        var isGlobalData = ss && (ss.indexOf('@') === 0);
        var targetDom = ss && !isGlobalData;
        var me = this;

        function setData(data) {
            var oldVal = this.data;
            this.data = this[dataFilter] ? this[dataFilter](data) : data;
            this[callback] && this[callback](this.data, oldVal);
        }

        // clear listener
        if (this._callbackTargetDataTag) {
            document.removeEventListener(
                'data-change', this._callbackTargetDataTag, false);
        }

        if (this._callbackInnerDataTag) {
            this.removeEventListener(
                'data-change', this._callbackInnerDataTag, false);
        }

        // 全局数据是立即读取的，因此要求数据存在于组件创建之前
        if (isGlobalData) {
            setData.call(this, eval(ss.substring(1)));
        }
        else if(targetDom) {

            if (!this._callbackTargetDataTag) {

                this._callbackTargetDataTag = fox.bind(function(e){

                    // layzy query: 可以不依赖数据源结点的生成时机
                    var targets = fox.toArray(
                        document.querySelectorAll(this.sourceselector)
                    );

                    if (targets.indexOf(e.target) > -1) {
                        setData.call(this, e.detail.newVal);
                    }
                }, this);
            }

            // 当数据结点已创建完成时(只取第一个数据源结点)
            var dataEl = fox.query(document, ss)[0];

            if (dataEl && dataEl.data) {
                setData.call(this, dataEl.data);
            }

            // 当数据结点未创建或者后续数据变更时(实际上允许多个数据源，但和初始时不一致)
            document.addEventListener('data-change', this._callbackTargetDataTag, false);
        }

        // 监听内部 data-change(过滤掉非直接子结点数据源元素)
        else {
            // 元素创建顺序决定于元素文件的载入顺序，因此在创建时内部结点的状态是不确定的

            // 当数据结点已创建完成时(只取第一个数据源结点)
            var dataEl = fox.queryChildren(this, (dataTags.concat(dataContainerTags)).join())[0];

            if (dataEl && dataEl.data) {
                setData.call(this, dataEl.data);
            }

            if (!this._callbackInnerDataTag) {

                this._callbackInnerDataTag = fox.bind(function(e){

                    if (e.target.parentNode === this) {
                        setData.call(this, e.detail.newVal);
                    }

                }, this);
            }

            // 当数据结点未创建或者后续数据变更时(实际上允许多个数据源，但和初始时不一致)
            this.addEventListener('data-change', this._callbackInnerDataTag, false);
        }
    }

    // 将 data 注册为setter/getter
    // 这里的setter/getter 对 fox-template 无效
    // 因为模板会重新在 fox-template 上注册 sett/getter
    // 当前的会被覆盖
    // 因此更换回调调用方式为手动调用
    /*
    function dataSetterGetter(options){
        options.accessors = options.accessors || {};

        options.accessors.data = {
            get: function(){
                return this._data_;
            },
            set: function(data){
                var oldVal = this._data_;
                this._data_ = this[dataFilter] ? this[dataFilter](data) : data;
                this[callback] && this[callback](this._data_, oldVal);
            }
        };
    }
    */

    fox.fn.datasource = function (options) {
        var originCreated;
        var lifecycle = options.lifecycle || (options.lifecycle = {});

        if (lifecycle.created) {
            originCreated = lifecycle.created;
        }

        // dataSetterGetter(options);

        options.accessors = options.accessors || {};

        options.accessors.sourceselector = {
            attribute: true
        };

        lifecycle.sourceselectorChanged = function() {
            if (dataTags.indexOf(this.tagName) === -1) {
                parseDataSource.call(this);
            }
        }

        options.lifecycle.created = function() {
            if (dataTags.indexOf(this.tagName) === -1) {
                parseDataSource.call(this);
            }

            originCreated && originCreated.apply(this, arguments);
        }
    };

})(this);
(function(){
    var Utils = {
        getArrayMostValue : function(arr, type){
            return Math[type].apply({}, arr);
        },
        C : function(ele){
            return document.createElement(ele);
        },
        setCss : function(eles, attr, value){
            for (var i = eles.length - 1; i >= 0; i--) {
                eles[i].style[attr] = value;
            };
        },
        getStyle : function(obj, attr){
            return getComputedStyle(obj, true)[attr];
        },
        setStyle : function(obj, attrs){
            for(var i in attrs){
                obj.style[i] = attrs[i];
            }
        },
        createEle : function(ele, style, className, innerHTML, appendTo){
            var e = this.C(ele);
            this.setStyle(e, style);
            className && (e.className = className);
            (innerHTML !== undefined) && (e.innerHTML = innerHTML);
            appendTo && appendTo.appendChild(e);
            return e;
        },
        mergeObj : function(){
            var result = {};
            for (var i = 0, l = arguments.length; i < l; i++) {
                var obj = arguments[i];
                for(var attr in obj){
                    result[attr] = obj[attr];
                }
            }
            return result;
        },
        addStyleSheets : function(className, style) {
            var tmp = document.styleSheets;
            var c = tmp[tmp.length - 1];
            c.insertRule(className + " { "+style+" }", c.cssRules.length);
        },
        defaultColors : ['#5A4440', '#539EA0', '#C29333', '#AC9FA2', '#A35347', '#6C8B79'],
        timeStamp : +new Date
    };

    if(!window.Charts){
        window.Charts = {};
    }

    window.Charts.Utils = Utils;
})();(function(){
    var Utils = Charts.Utils,
        addStyleSheets = Utils.addStyleSheets,
        defaultColors = Utils.defaultColors,
        timeStamp = Utils.timeStamp;

    var log10 = function(a){
        return Math.log(a)/Math.log(10);
    };


    if(document.styleSheets.length == 0){
        document.getElementsByTagName('head')[0].appendChild(Utils.C('style'));
    }

    addStyleSheets('.coorY' + timeStamp, 'position: absolute;text-align: right;font-size: 10px;left:-63px;width: 60px;');
    addStyleSheets('.coorX' + timeStamp, 'font-size: 10px;text-align: center;position:absolute;bottom: -18px;white-space:nowrap;');
    addStyleSheets('.legend'       +timeStamp, 'bottom: -50px;font-size: 10px;padding: 4px;border-radius: 2px;border: #AAA 1px solid;');
    addStyleSheets('.legend-color' +timeStamp, 'border-radius: 2px;margin-right: 2px;display: inline-block;width: 10px;height: 10px;');
    addStyleSheets('.legend-name'  +timeStamp, 'margin-right: 10px;');

    var BLBase = function(){
        
    };

    BLBase.prototype = Utils.mergeObj(BLBase.prototype, {
        setBaseProperties : function(data){
            this.data = data;
            this.container = data.container;
            this.coordinate = Utils.C('canvas');
            this.coorCTX = null;
            this.plotCTX = null;
            this.commonAttr = {};
            this.seriesDataLength = data.series[0].data.length;
        },
        getSeriesMostValue : function(series, type){
            var arr = [];
            for(var i = 0; i < series.length; i++){
                arr.push(Math[type].apply({}, series[i].data));
            }
            return Math[type].apply({}, arr);
        },
        isOnStep : function(step, i, l){
            return onStep = !step || (step && i % step == 0) || (i==l-1);
        },
        setSeriesValueToPixel : function(){
            var commonAttr = this.commonAttr,
                data = this.data,
                series = data.series,
                serie,
                Y,
                YArr,
                step = data.xAxis.step;

            commonAttr.yAxis = [];

            for(var i = 0; i < series.length; i++){
                serie = series[i];
                YArr = [];
                var l = this.seriesDataLength;
                for(var j = 0; j < l; j++){
                    Y = ((serie.data[j]-commonAttr.minBound)/commonAttr.rangeY) * commonAttr.containerHeight;
                    YArr.push(Y);
                }
                commonAttr.yAxis.push(YArr);
            }
        },
        addCanvas : function(canvas, container){
            var w = this.commonAttr.containerWidth+20, h = this.commonAttr.containerHeight+20;
            canvas.width = w*2;
            canvas.height = h*2;
            canvas.style.cssText = "position:absolute;left:-10px;top:-10px;width:"+w+"px;height:"+h+"px";
            container.appendChild(canvas);
            ctx = canvas.getContext("2d");
            ctx.translate(20, 20);
            return ctx;
        },

        setBaseComponents : function(){
            var data = this.data,
                tmpWidthDelta = 40,
                paddingLeft = 30;

            if(data.yAxis && data.yAxis.labelVisible === false){
                tmpWidthDelta = 0;
                paddingLeft = 0;
            }

            var innerContainer = this.innerContainer = Utils.createEle('div', {
                position : 'relative',
                width : (this.container.clientWidth - tmpWidthDelta) + 'px',
                height : (this.container.clientHeight - 30) + 'px',
                margin: '6px 10px 0px '+ paddingLeft +'px',
                fontFamily: 'Arial'
            }, '', '', this.container);

            this.commonAttr.containerWidth = parseInt(this.innerContainer.clientWidth);
            this.commonAttr.containerHeight = parseInt(this.innerContainer.clientHeight);
            
            var posStyle = Utils.getStyle(innerContainer, 'position');

            if(["relative", "absolute"].indexOf(posStyle) < 0){
                innerContainer.style.position = "relative";
            }

            // 坐标
            this.coorCTX = this.addCanvas(this.coordinate, innerContainer);
        
            this.renderCoordinate();
            this.setSeriesValueToPixel();
            if(this.data.series.length > 1) this.renderLegend();
        },
        renderCoordX : function(){
            var commonAttr = this.commonAttr,
                data = this.data,
                container = this.innerContainer,
                coorCTX = this.coorCTX;

            if(data.xAxis){
                var categories = data.xAxis.categories, xAxis = data.xAxis;
                var l = categories.length, unit = commonAttr.containerWidth/l, X, label, xArr = [], step = data.xAxis.step;

                var hasLines = xAxis.tickVisible !== false;

                hasLines && coorCTX.beginPath();
                var halfStep = unit/2;
                for (var i = 0; i < l; i++){
                    X = unit*i + halfStep;
                    xArr.push(X);

                    var onStep = this.isOnStep(step, i, l);

                    if(hasLines && onStep){
                        coorCTX.moveTo(X*2, 0);
                        coorCTX.lineTo(X*2, commonAttr.containerHeight*2);
                    }

                    if(onStep){
                        label = Utils.createEle('div', {
                            color : xAxis.fontColor ? xAxis.fontColor : '#999'
                        }, 'coorX'+timeStamp, categories[i], container);

                        var leftPos = Math.max(0, Math.min(X - label.offsetWidth/2, commonAttr.containerWidth-label.offsetWidth));
                        label.style.left = leftPos + 'px'; 
                    }

                };
                
                if(hasLines){
                    coorCTX.strokeStyle = xAxis.lineColor || "#f2f2f2";
                    coorCTX.lineWidth = xAxis.lineWidth || 1;  
                    coorCTX.lineCap = "round";  
                    coorCTX.stroke();
                }
            }
            commonAttr.xAxis = xArr||[];
            commonAttr.xInterval = xArr ? xArr[1] - xArr[0] : 0;
        },
        getYAxisAttrs : function(min, max){
            var range = (max - min) || Math.abs(max);
            var tickCount = 4;
            var unroundedTickSize = range/(tickCount-1);
            // var exp = Math.ceil(Utils.log10(unroundedTickSize)-1);//得到数量级, 如32345，即exp=10^4
            var exp = parseInt(log10(unroundedTickSize));
            var pow10x = Math.pow(10, exp);

            var tmp = unroundedTickSize / pow10x;
            var roundedTickRange;
            if(tmp>2&&tmp<=2.5){
                roundedTickRange = 2.5 * pow10x;
            }else if(tmp>7&&tmp<=7.5){
                roundedTickRange = 7.5 * pow10x;
                tickCount += 1;
            }else{
                roundedTickRange = Math.ceil(tmp) * pow10x;
            }

            var newLowerBound = roundedTickRange * (Math.round(min/roundedTickRange)-1);
            var newUpperBound = roundedTickRange * Math.round(1 + max/roundedTickRange);

            return {
                'min' : newLowerBound,
                'max' : newUpperBound,
                'tickRange' : roundedTickRange,
                'tickCount' : parseInt((newUpperBound - newLowerBound)/roundedTickRange)
            };
        },
        renderCoordY : function(){
            var commonAttr = this.commonAttr,
                data = this.data,
                container = this.innerContainer,
                coorCTX = this.coorCTX;

            if(data.series && data.series.length > 0){
                var yAxis = data.yAxis;
                var hasLines = !yAxis || (yAxis.tickVisible !== false);

                var max = this.getSeriesMostValue(data.series, 'max');
                var min = this.getSeriesMostValue(data.series, 'min');
                commonAttr.min = min;
                commonAttr.max = max;

                var yAxisAttrs = this.getYAxisAttrs(min, max);
                var minBound = yAxisAttrs.min;
                var maxBound = yAxisAttrs.max;

                var tickCount = yAxisAttrs.tickCount;

                var pxStep = yAxisAttrs.tickRange/(maxBound - minBound)*commonAttr.containerHeight;

                commonAttr.minBound = minBound;
                commonAttr.maxBound = maxBound;

                var Y;
                hasLines && coorCTX.beginPath();
                for (var i = 0; i <= tickCount; i++){
                    Y = pxStep * i;
                    if(hasLines){
                        coorCTX.moveTo(0, Y*2);
                        coorCTX.lineTo(commonAttr.containerWidth*2, Y*2);
                    }
                    if(!yAxis || (yAxis && yAxis.labelVisible!==false)){
                        var val = minBound + i * yAxisAttrs.tickRange;
                        var innerHTML = (val+'').indexOf('.')>0 ? val.toFixed(2): val;

                        Utils.createEle('div', {
                            bottom : (Y-8)+'px',
                            color : yAxis && yAxis.fontColor || '#999',
                        }, 'coorY'+timeStamp, innerHTML, container);
                    }
                };

                if(hasLines){
                    coorCTX.strokeStyle = yAxis && yAxis.lineColor || "#f2f2f2";  
                    coorCTX.lineWidth = yAxis && yAxis.lineWidth || 1; 
                    coorCTX.stroke();
                }

                commonAttr.rangeY = maxBound - minBound;
            }
        },
        renderCoordinate : function(){
            this.renderCoordX();
            this.renderCoordY();
        },
        renderLegend : function(){
            var data = this.data,
                series = data.series,
                l = series.length,
                color,
                html = '',
                legend = Utils.C('div');

            legend.style.position = "absolute";
            legend.className = "legend" + timeStamp;

            for(var i=0; i<l; i++){
                color = series[i].color || defaultColors[i];
                html += '<span class="legend-color'+timeStamp+'" style="background-color:' + color + '"></span><span class="legend-name'+timeStamp+'">' + series[i].name + '</span>';
            }

            legend.innerHTML = html;
            this.innerContainer.appendChild(legend);
        },
        showIndicator : function(x, y, startIndex, isRefresh){
            var commonAttr = this.commonAttr,
                data = this.data;

            if(x < 0 || x >= commonAttr.containerWidth){
                return;
            }

            var interval = commonAttr.xInterval, posX, posY, halfStep = interval/2;
            var index = startIndex || parseInt(x/interval);

            index = Math.max(0, Math.min(this.seriesDataLength-1, index));//规定index范围

            if(this.indicatorLastIndex == index && !isRefresh){
                return;
            }else{
                this.indicatorLastIndex = index;
            }

            // 吸附
            var posX = index * interval + halfStep;

            this.indicator.style.left = posX-this.indicator.offsetWidth/2 + 'px';

            this.onShowIndicator && this.onShowIndicator(posX, index, isRefresh);
        },
        bindAction : function(element){
            var data = this.data,
                startX,
                startY,
                self = this;

            element.addEventListener('touchmove', function(e){
                e.stopPropagation();
                var touch = e.touches[0], container = this.parentNode;
                var x = touch.pageX - container.offsetLeft;
                var y = touch.pageY - container.offsetTop;

                var rate = Math.abs(y-startY)/Math.abs(x-startX);

                if(rate < 2){
                    e.preventDefault();
                    first = false;
                }
                self.showIndicator(x, y);
            });

            element.addEventListener('touchstart', function(e){
                e.stopPropagation();
                var touch = e.touches[0], container = this.parentNode;
                var x = touch.pageX - container.offsetLeft;
                var y = touch.pageY - container.offsetTop;

                startX = x;
                startY = y;
                
                self.showIndicator(x, y);
            });
        },
    });

    window.Charts.BLBase = BLBase;
})();(function(){
    var Utils = Charts.Utils,
        BLBase = Charts.BLBase,
        defaultColors = Utils.defaultColors,
        addStyleSheets = Utils.addStyleSheets,
        timeStamp = Utils.timeStamp;

        addStyleSheets('.init-anim'  +timeStamp, 'transition:width 1s;-moz-transition:width 1s;-webkit-transition: width 1s;-o-transition:width 1s;');
        addStyleSheets('.round-hover'+timeStamp, 'background-repeat: no-repeat;position: absolute;width: 16px;height: 16px;border-radius: 100px;border: #3f9a41 3px solid;');
        addStyleSheets('.round-hover'+timeStamp+':before', 'display: block;content : "";border: #b7d3f0 2px solid;width: 6px;height: 6px;border-radius: 100px;margin: 3px;');
        addStyleSheets('.round-dot'  +timeStamp, 'position:absolute;border:#b7d3f0 2px solid;width:6px;height:6px;background:#e5f2ff;border-radius:100px;z-index:2');
        addStyleSheets('.round-min'  +timeStamp, 'position:absolute;border:#b7d3f0 2px solid;width:14px;height:14px;background:#e5f2fe;border-radius:100px;z-index:2');
        addStyleSheets('.round-max'  +timeStamp, 'position:absolute;border:#f2c4c1 2px solid;width:14px;height:14px;background:#fde5e3;border-radius:100px;z-index:2');
        addStyleSheets('.round-min'  +timeStamp+':before, .round-max'+timeStamp+':before', 'display: block;content : "";width: 10px;height: 10px;margin:2px;border-radius: 100px;');
        addStyleSheets('.round-min'  +timeStamp+':before', 'background: #3a82c9');
        addStyleSheets('.round-max'  +timeStamp+':before', 'background: #cd332d');
        addStyleSheets('.value-label'+timeStamp, 'position: absolute;text-align: center;font-size: 12px;color : #555;min-width:20px;white-space:nowrap;');
        addStyleSheets('.value-label'+timeStamp+'.min, .value-label'+timeStamp+'.max', 'font-size: 12px;color: #FFF;padding: 0px 7px;border-radius: 4px;');
        addStyleSheets('.value-label'+timeStamp+'.max', 'background: #d7372b;');
        addStyleSheets('.value-label'+timeStamp+'.min', 'background: #3d8ee0;');
        addStyleSheets('.value-label'+timeStamp+'.max .arrow-max', 'position: absolute;width: 0px;height: 0px;border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #d7372b;');
        addStyleSheets('.value-label'+timeStamp+'.min .arrow-min', 'position: absolute;width: 0px;height: 0px;border-left: 5px solid transparent;border-right: 5px solid transparent;border-bottom: 5px solid #3d8ee0;');
        addStyleSheets('.indicator'  +timeStamp, 'position:absolute;width: 0;height: 100%;border-left: #7cbb7e 1px dashed;border-right: #7cbb7e 1px dashed;');
        addStyleSheets('.elements-container'+timeStamp, 'position:absolute;left:0;top:0;width:100%;height:100%;');
        addStyleSheets('.plot-container'+timeStamp, 'position:absolute;overflow:hidden;width:0;left:-10px;top:-10px;');
        addStyleSheets('.guide'+timeStamp, 'position:absolute;top:1px;opacity:0.5;border-top: 8px solid transparent;border-bottom: 8px solid transparent;-webkit-animation: guide 0.8s infinite');


    var Line = function(data){
        if(!data.container) return;

        this.setBaseProperties(data);

        this.plot = Utils.C('canvas');
        this.plotContainer = null;
        this.indicator = Utils.C('div');
        this.elementsContainer = Utils.C('div');//圆点、标签等
        this.hoverRounds = [];
        this.indicatorLastIndex = null;

        this.tmpELement;

        this.refresh();
    }

    Line.prototype = new BLBase();

    Line.prototype = Utils.mergeObj(Line.prototype, {
        refresh : function(data){
            var data = data || this.data;

            this.clear();
            this.setBaseComponents();
            this.setComponents();

            this.initAnim();//生成动画

            if(data.onhover && data.onhover.callback){
                this.bindAction(this.elementsContainer);
                var start = data.onhover.start === undefined? 10000 : data.onhover.start;
                var index = this.indicatorLastIndex === null ? start : this.indicatorLastIndex;
                this.showIndicator(0, 0, index, true);
            }
        },
        setComponents : function(){
            var data = this.data;
            // 折线容器
            var plotContainer = this.plotContainer = Utils.createEle('div', {
                height: this.commonAttr.containerHeight+20+'px',
            }, 'plot-container'+timeStamp);

            // 折线画布
            this.plotCTX = this.addCanvas(this.plot, plotContainer, this);
            Utils.setStyle(this.plot, {
                left : "0",
                top : "0"
            });

            this.innerContainer.appendChild(plotContainer);

            this.elementsContainer.className = "elements-container"+timeStamp;
            this.elementsContainer.appendChild(this.indicator);
            this.innerContainer.appendChild(this.elementsContainer);
            // 生成动画
            if(data.initAnim) plotContainer.className += ' init-anim'+timeStamp;
            // 画折线
            this.renderPlots();
            if(data.series.length > 1) renderLegend(container, data);


            // 指示线
            this.addHoverRound();
            this.indicator.className = 'indicator'+timeStamp;
            Utils.setStyle(this.indicator, data.indicator||{});  
        },
        moveIndicator : function(param){
            if('moveTo' in param){
                showIndicator(0, 0, param.moveTo);
            }else if('moveBy'in param){
                showIndicator(0, 0, components.indicatorLastIndex + param.moveBy);
            }
        },
        addHoverRound : function(){
            var data = this.data;
            var l = data.series.length;
            var tmp;
            for(var i = 0; i < l; i++) {
                tmp = Utils.createEle('div', {
                    // display : "none",
                    "z-index" : "1"
                }, data.roundDot&&data.roundDot.hover?'':"round-hover"+timeStamp);
                if(i == 0 && data.guide){
                    var border = 'right', pos = 'left';
                    if(data.onhover && data.onhover.start < this.seriesDataLength-1){
                        border = 'left';
                        pos = 'right';
                    }
                    Utils.addStyleSheets('@-webkit-keyframes guide', '0%{'+pos+':-12px;opacity:0;}100%{'+pos+':-18px;opacity:0.8;}');
                    tmp.innerHTML = '<div class="guide'+timeStamp+'" style="border-'+border+': 8px solid rgb(63, 154, 65);"></div>';
                }
                this.hoverRounds.push(tmp);
                this.elementsContainer.appendChild(tmp);
            }
        },
        setMostLabelStyle : function(style, label, x, y){
            var s = Utils.mergeObj(style, label);
            s.left = x - parseInt(label.width)/2 + 'px';
            return s;
        },
        putValueLabel : function(value, x, y, type){
            var commonAttr = this.commonAttr,
                data = this.data,
                content = value,
                arrow = '',
                className = 'value-label'+timeStamp+' ' + type;

            if(!this.tmpELement){
                this.tmpELement = Utils.C('div');
                document.body.appendChild(this.tmpELement);
            }
            var tmpELement = this.tmpELement;
            tmpELement.className = className;
            
            tmpELement.innerHTML = content;
            tmpELement.style.display = 'block';
            // tmpELement.style.lineHeight = '20px';
            var width = tmpELement.offsetWidth;
            var height = tmpELement.offsetHeight;
            var arrowX = tmpELement.clientWidth/2-5;
            var arrowY = tmpELement.clientHeight;
            tmpELement.style.display = 'none';

            var deltaH = 0;
            if(type == 'above' || type == 'max'){
                deltaH = - height;
            }

            var halfWidth = width/2, arrowTmp = 0, adjust = 3;
            var leftPos = halfWidth;
            if(x < halfWidth){
                leftPos = -adjust;
                arrowTmp = x - halfWidth + adjust;
            }else if(commonAttr.containerWidth - x < halfWidth){
                leftPos = commonAttr.containerWidth - width + adjust;
                arrowTmp = x - (commonAttr.containerWidth - halfWidth) - adjust;
            }else{
                leftPos = x - halfWidth;
            }

            if((type == "min" && !(data.valueLabel && data.valueLabel.min)) || (type == "max" && !(data.valueLabel && data.valueLabel.max))){
                var h = type == "min" ? "top" : "bottom";
                content += '<div class="arrow-' + type + '" style="left:' + (arrowX + arrowTmp) + 'px;' + h + ':-4px;"></div>';
            }

            var style = {
                position: 'absolute',
                top: y + deltaH + 'px',
                left: leftPos + 'px',
                "z-index" : "3"
            };

            if(type == "min" && data.valueLabel && data.valueLabel.min){
                style = setMostLabelStyle(style, data.valueLabel.min, x, y);
                className = '';
            }else if(type == "max" && data.valueLabel && data.valueLabel.max){
                style = setMostLabelStyle(style, data.valueLabel.max, x, y);
                className = '';
            }else if(data.valueLabel && data.valueLabel.label){
                style = setMostLabelStyle(style, data.valueLabel.label, x, y);
                className = '';
            }

            var div = Utils.createEle('div', style, className, content);

            return div;
        },
        setDotStyle : function(dot){
            return Utils.mergeObj({position : 'absolute', 'z-index' : 2}, dot);
        },
        setMostValueDotObj : function(dotObj, mostType){
            var data = this.data;
            !dotObj ? (dotObj = Utils.C('div')) : dotObj.style.cssText = '';
            if(data.roundDot && data.roundDot[mostType]){
                Utils.setStyle(dotObj, this.setDotStyle(data.roundDot[mostType]));
            }else{
                dotObj.className = 'round-' + mostType+timeStamp;
            }
            
            return dotObj;
        },
        renderRoundDot : function(val, pX, pY, lastMost){
            var commonAttr = this.commonAttr, data = this.data;
            var roundDot = data.roundDot;
            var type = (roundDot && roundDot.type) || 'x', most = roundDot && roundDot.most || 'both', dotObj = null;
            var w = h = 0;
            if(type == 'all' || (type == 'x' && onStep)){
                var dot = roundDot && roundDot.dot;
                if(dot){
                    dotObj = Utils.createEle('div', setDotStyle(dot));
                }else{
                    dotObj = Utils.createEle('div', {}, 'round-dot'+timeStamp);
                }
            }

            // if((most == 'min' || most == 'both') && val == commonAttr.min && lastMost == 'min'){
            //     dotObj = this.setMostValueDotObj(dotObj, 'min');
            // }else if((most == 'max' || most == 'both') && val == commonAttr.max && lastMost == 'max'){
            //     dotObj = this.setMostValueDotObj(dotObj, 'max');
            // }

            if(dotObj){
                this.elementsContainer.appendChild(dotObj);
                w = dotObj.offsetWidth;
                h = dotObj.offsetHeight;
                Utils.setStyle(dotObj, {
                    left : pX-w/2 +'px',
                    top : pY-h/2 +'px'
                });
            }
        },
        renderLabel : function(val, pX, pY, pos, lastMost){
            var commonAttr = this.commonAttr, data = this.data;
            var valueLabel = data.valueLabel;
            var type = valueLabel && valueLabel.type || 'all';
            var most = valueLabel && valueLabel.most || 'both';
            if(type){
                var lbl;
                var halfRound = h/2;
                if(type == 'all' || (type == 'x' && onStep)){
                    if(pos){//above
                        lbl = this.putValueLabel(val, pX, pY-halfRound, 'above');
                    }else{//below
                        lbl = this.putValueLabel(val, pX, pY+halfRound, 'below');
                    }
                }

                // if((most == 'min' || most == 'both') && val == commonAttr.min && lastMost == 'min'){
                //     lbl = this.putValueLabel(val, pX, pY+halfRound+5, 'min');
                // }else if((most == 'max' || most == 'both') && val == commonAttr.max && lastMost == 'max'){
                //     lbl = this.putValueLabel(val, pX, pY-halfRound-5, 'max');
                // }

                lbl && this.elementsContainer.appendChild(lbl);
            }
        },
        isLastMost : function(val, arr, i){
            if(val == this.commonAttr.min){
                for (var j = i+1; j < arr.length; j++) {
                    if(arr[j] == val) return null;
                }
                return 'min';
            }

            if(val == this.commonAttr.max){
                for (var j = i+1; j < arr.length; j++) {
                    if(arr[j] == val) return null;
                }
                return 'max';
            }
        },
        renderPlots : function(){
            var commonAttr = this.commonAttr,
                data = this.data,
                plotCTX = this.plotCTX,
                series = data.series,
                serie,
                YArr,
                yAxis = commonAttr.yAxis,
                PI = Math.PI*2,
                step = data.xAxis.step;

            for(var i = 0; i < series.length; i++){
                serie = series[i];
                plotCTX.beginPath();

                YArr = yAxis[i];

                // 折线
                plotCTX.moveTo(commonAttr.xAxis[0]*2, (commonAttr.containerHeight-YArr[0])*2);
                var l = this.seriesDataLength;
                for(var j = 0; j < l; j++){
                    if(j > 0){
                        this.plotCTX.lineTo(commonAttr.xAxis[j]*2, (commonAttr.containerHeight-YArr[j])*2);
                    }

                    var onStep = this.isOnStep(step, j, l);
                    var pX = commonAttr.xAxis[j], pY = commonAttr.containerHeight-YArr[j];
                    val = serie.data[j];
                    var tmp = this.isLastMost(val, serie.data, j);
                    // 圆点
                    this.renderRoundDot(val, pX, pY, tmp);

                    // 值标签
                    pos = (j==0 || val >= serie.data[j-1]);
                    this.renderLabel(val, pX, pY, pos, tmp);

                }
                plotCTX.strokeStyle = serie.color || defaultColors[i];
                plotCTX.lineWidth = 4; 
                plotCTX.stroke();

                // 渐变颜色
                plotCTX.lineTo(commonAttr.xAxis[j-1]*2, commonAttr.containerHeight*2);
                plotCTX.lineTo(commonAttr.xInterval, commonAttr.containerHeight*2);
                plotCTX.closePath();
                plotCTX.save();
                var gradient = plotCTX.createLinearGradient(0, 0, 0, commonAttr.containerHeight);   //创建一个线性渐变
                gradient.addColorStop(0.3, "rgba(216,235,255,0.4)");
                gradient.addColorStop(1, "rgba(244,249,255,0.4)");
                plotCTX.fillStyle = gradient;
                plotCTX.fill();
                plotCTX.restore();
            }
        },
        onShowIndicator : function(posX, index, isRefresh){
            var commonAttr = this.commonAttr,
                data = this.data;

            if(data.guide && !this.showedGuide && !isRefresh){
                this.showedGuide = true;
            }

            if(this.showedGuide){
                this.hoverRounds[0].innerHTML = '';
            }
            // posY
            var l = commonAttr.yAxis.length;
            var yValArr = [];
            var round, hoverRounds = this.hoverRounds;;
            if(data.roundDot && data.roundDot.hover){
                var hover = data.roundDot.hover;
                var w = parseInt(hover.width), h = parseInt(hover.height);
                for(var j = 0; j < l; j++) {
                    round = hoverRounds[j];
                    yValArr.push({
                        name : data.series[j].name,
                        data : data.series[j].data[index]
                    });
                    Utils.setStyle(round, Utils.mergeObj({
                        position : 'absolute',
                        top : (commonAttr.containerHeight-commonAttr.yAxis[j][index])-h/2 + 'px',
                        left : posX-w/2 + 'px'
                    }, hover));
                }
            }else{
                for(var j = 0; j < l; j++) {
                    round = hoverRounds[j];
                    yValArr.push({
                        name : data.series[j].name,
                        data : data.series[j].data[index]
                    });
                    Utils.setStyle(round, {
                        position : "absolute",
                        top : commonAttr.containerHeight-commonAttr.yAxis[j][index]-round.offsetHeight/2 + 'px',
                        left : posX-round.offsetWidth/2 + 'px',
                        backgroundColor : '#FFF'
                    });
                }
            }


            var xVal = data.xAxis.categories[index];

            commonAttr.hoverVal = {x: xVal, yArr : yValArr};
            // 回调
            data.onhover && data.onhover.callback && data.onhover.callback(xVal, index, yValArr);
        },

        initAnim : function(){
            this.plotContainer.style.width = this.commonAttr.containerWidth+20+'px';
        },

        clear : function(){
            this.container.innerHTML = '';
            this.plotContainer && (this.plotContainer.innerHTML = '');
            this.elementsContainer && (this.elementsContainer.innerHTML = '');
            this.hoverRounds = [];
        }
    });


    window.Charts.Line = Line;
})();/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @version 1.0.2
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 */

/*jslint browser:true, node:true*/
/*global define, Event, Node*/


/**
 * Instantiate fast-clicking listeners on the specified layer.
 *
 * @constructor
 * @param {Element} layer The layer to listen on
 * @param {Object} options The options to override the defaults
 */
function FastClick(layer, options) {
	'use strict';
	var oldOnClick;

	options = options || {};

	/**
	 * Whether a click is currently being tracked.
	 *
	 * @type boolean
	 */
	this.trackingClick = false;


	/**
	 * Timestamp for when click tracking started.
	 *
	 * @type number
	 */
	this.trackingClickStart = 0;


	/**
	 * The element being tracked for a click.
	 *
	 * @type EventTarget
	 */
	this.targetElement = null;


	/**
	 * X-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartX = 0;


	/**
	 * Y-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartY = 0;


	/**
	 * ID of the last touch, retrieved from Touch.identifier.
	 *
	 * @type number
	 */
	this.lastTouchIdentifier = 0;


	/**
	 * Touchmove boundary, beyond which a click will be cancelled.
	 *
	 * @type number
	 */
	this.touchBoundary = options.touchBoundary || 10;


	/**
	 * The FastClick layer.
	 *
	 * @type Element
	 */
	this.layer = layer;

	/**
	 * The minimum time between tap(touchstart and touchend) events
	 *
	 * @type number
	 */
	this.tapDelay = options.tapDelay || 200;

	if (FastClick.notNeeded(layer)) {
		return;
	}

	// Some old versions of Android don't have Function.prototype.bind
	function bind(method, context) {
		return function() { return method.apply(context, arguments); };
	}


	var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
	var context = this;
	for (var i = 0, l = methods.length; i < l; i++) {
		context[methods[i]] = bind(context[methods[i]], context);
	}

	// Set up event handlers as required
	if (deviceIsAndroid) {
		layer.addEventListener('mouseover', this.onMouse, true);
		layer.addEventListener('mousedown', this.onMouse, true);
		layer.addEventListener('mouseup', this.onMouse, true);
	}

	layer.addEventListener('click', this.onClick, true);
	layer.addEventListener('touchstart', this.onTouchStart, false);
	layer.addEventListener('touchmove', this.onTouchMove, false);
	layer.addEventListener('touchend', this.onTouchEnd, false);
	layer.addEventListener('touchcancel', this.onTouchCancel, false);

	// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
	// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
	// layer when they are cancelled.
	if (!Event.prototype.stopImmediatePropagation) {
		layer.removeEventListener = function(type, callback, capture) {
			var rmv = Node.prototype.removeEventListener;
			if (type === 'click') {
				rmv.call(layer, type, callback.hijacked || callback, capture);
			} else {
				rmv.call(layer, type, callback, capture);
			}
		};

		layer.addEventListener = function(type, callback, capture) {
			var adv = Node.prototype.addEventListener;
			if (type === 'click') {
				adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
					if (!event.propagationStopped) {
						callback(event);
					}
				}), capture);
			} else {
				adv.call(layer, type, callback, capture);
			}
		};
	}

	// If a handler is already declared in the element's onclick attribute, it will be fired before
	// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
	// adding it as listener.
	if (typeof layer.onclick === 'function') {

		// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
		// - the old one won't work if passed to addEventListener directly.
		oldOnClick = layer.onclick;
		layer.addEventListener('click', function(event) {
			oldOnClick(event);
		}, false);
		layer.onclick = null;
	}
}


/**
 * Android requires exceptions.
 *
 * @type boolean
 */
var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;


/**
 * iOS requires exceptions.
 *
 * @type boolean
 */
var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);


/**
 * iOS 4 requires an exception for select elements.
 *
 * @type boolean
 */
var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


/**
 * iOS 6.0(+?) requires the target element to be manually derived
 *
 * @type boolean
 */
var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);

/**
 * BlackBerry requires exceptions.
 *
 * @type boolean
 */
var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

/**
 * Determine whether a given element requires a native click.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element needs a native click
 */
FastClick.prototype.needsClick = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {

	// Don't send a synthetic click to disabled inputs (issue #62)
	case 'button':
	case 'select':
	case 'textarea':
		if (target.disabled) {
			return true;
		}

		break;
	case 'input':

		// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
		if ((deviceIsIOS && target.type === 'file') || target.disabled) {
			return true;
		}

		break;
	case 'label':
	case 'video':
		return true;
	}

	return (/\bneedsclick\b/).test(target.className);
};


/**
 * Determine whether a given element requires a call to focus to simulate click into element.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
 */
FastClick.prototype.needsFocus = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {
	case 'textarea':
		return true;
	case 'select':
		return !deviceIsAndroid;
	case 'input':
		switch (target.type) {
		case 'button':
		case 'checkbox':
		case 'file':
		case 'image':
		case 'radio':
		case 'submit':
			return false;
		}

		// No point in attempting to focus disabled inputs
		return !target.disabled && !target.readOnly;
	default:
		return (/\bneedsfocus\b/).test(target.className);
	}
};


/**
 * Send a click event to the specified element.
 *
 * @param {EventTarget|Element} targetElement
 * @param {Event} event
 */
FastClick.prototype.sendClick = function(targetElement, event) {
	'use strict';
	var clickEvent, touch;

	// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
	if (document.activeElement && document.activeElement !== targetElement) {
		document.activeElement.blur();
	}

	touch = event.changedTouches[0];

	// Synthesise a click event, with an extra attribute so it can be tracked
	clickEvent = document.createEvent('MouseEvents');
	clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
	clickEvent.forwardedTouchEvent = true;
	targetElement.dispatchEvent(clickEvent);
};

FastClick.prototype.determineEventType = function(targetElement) {
	'use strict';

	//Issue #159: Android Chrome Select Box does not open with a synthetic click event
	if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
		return 'mousedown';
	}

	return 'click';
};


/**
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.focus = function(targetElement) {
	'use strict';
	var length;

	// Issue #160: on iOS 7, some input elements (e.g. date datetime) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
	if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time') {
		length = targetElement.value.length;
		targetElement.setSelectionRange(length, length);
	} else {
		targetElement.focus();
	}
};


/**
 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
 *
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.updateScrollParent = function(targetElement) {
	'use strict';
	var scrollParent, parentElement;

	scrollParent = targetElement.fastClickScrollParent;

	// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
	// target element was moved to another parent.
	if (!scrollParent || !scrollParent.contains(targetElement)) {
		parentElement = targetElement;
		do {
			if (parentElement.scrollHeight > parentElement.offsetHeight) {
				scrollParent = parentElement;
				targetElement.fastClickScrollParent = parentElement;
				break;
			}

			parentElement = parentElement.parentElement;
		} while (parentElement);
	}

	// Always update the scroll top tracker if possible.
	if (scrollParent) {
		scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
	}
};


/**
 * @param {EventTarget} targetElement
 * @returns {Element|EventTarget}
 */
FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
	'use strict';

	// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
	if (eventTarget.nodeType === Node.TEXT_NODE) {
		return eventTarget.parentNode;
	}

	return eventTarget;
};


/**
 * On touch start, record the position and scroll offset.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchStart = function(event) {
	'use strict';
	var targetElement, touch, selection;

	// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
	if (event.targetTouches.length > 1) {
		return true;
	}

	targetElement = this.getTargetElementFromEventTarget(event.target);
	touch = event.targetTouches[0];

	if (deviceIsIOS) {

		// Only trusted events will deselect text on iOS (issue #49)
		selection = window.getSelection();
		if (selection.rangeCount && !selection.isCollapsed) {
			return true;
		}

		if (!deviceIsIOS4) {

			// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
			// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
			// with the same identifier as the touch event that previously triggered the click that triggered the alert.
			// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
			// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
			if (touch.identifier === this.lastTouchIdentifier) {
				event.preventDefault();
				return false;
			}

			this.lastTouchIdentifier = touch.identifier;

			// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
			// 1) the user does a fling scroll on the scrollable layer
			// 2) the user stops the fling scroll with another tap
			// then the event.target of the last 'touchend' event will be the element that was under the user's finger
			// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
			// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
			this.updateScrollParent(targetElement);
		}
	}

	this.trackingClick = true;
	this.trackingClickStart = event.timeStamp;
	this.targetElement = targetElement;

	this.touchStartX = touch.pageX;
	this.touchStartY = touch.pageY;

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
		event.preventDefault();
	}

	return true;
};


/**
 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.touchHasMoved = function(event) {
	'use strict';
	var touch = event.changedTouches[0], boundary = this.touchBoundary;

	if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
		return true;
	}

	return false;
};


/**
 * Update the last position.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchMove = function(event) {
	'use strict';
	if (!this.trackingClick) {
		return true;
	}

	// If the touch has moved, cancel the click tracking
	if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
		this.trackingClick = false;
		this.targetElement = null;
	}

	return true;
};


/**
 * Attempt to find the labelled control for the given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelElement
 * @returns {Element|null}
 */
FastClick.prototype.findControl = function(labelElement) {
	'use strict';

	// Fast path for newer browsers supporting the HTML5 control attribute
	if (labelElement.control !== undefined) {
		return labelElement.control;
	}

	// All browsers under test that support touch events also support the HTML5 htmlFor attribute
	if (labelElement.htmlFor) {
		return document.getElementById(labelElement.htmlFor);
	}

	// If no for attribute exists, attempt to retrieve the first labellable descendant element
	// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
	return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


/**
 * On touch end, determine whether to send a click event at once.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchEnd = function(event) {
	'use strict';
	var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

	if (!this.trackingClick) {
		return true;
	}

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
		this.cancelNextClick = true;
		return true;
	}

	// Reset to prevent wrong click cancel on input (issue #156).
	this.cancelNextClick = false;

	this.lastClickTime = event.timeStamp;

	trackingClickStart = this.trackingClickStart;
	this.trackingClick = false;
	this.trackingClickStart = 0;

	// On some iOS devices, the targetElement supplied with the event is invalid if the layer
	// is performing a transition or scroll, and has to be re-detected manually. Note that
	// for this to function correctly, it must be called *after* the event target is checked!
	// See issue #57; also filed as rdar://13048589 .
	if (deviceIsIOSWithBadTarget) {
		touch = event.changedTouches[0];

		// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
		targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
		targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
	}

	targetTagName = targetElement.tagName.toLowerCase();
	if (targetTagName === 'label') {
		forElement = this.findControl(targetElement);
		if (forElement) {
			this.focus(targetElement);
			if (deviceIsAndroid) {
				return false;
			}

			targetElement = forElement;
		}
	} else if (this.needsFocus(targetElement)) {

		// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
		// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
		if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
			this.targetElement = null;
			return false;
		}

		this.focus(targetElement);
		this.sendClick(targetElement, event);

		// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
		// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
		if (!deviceIsIOS || targetTagName !== 'select') {
			this.targetElement = null;
			event.preventDefault();
		}

		return false;
	}

	if (deviceIsIOS && !deviceIsIOS4) {

		// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
		// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
		scrollParent = targetElement.fastClickScrollParent;
		if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
			return true;
		}
	}

	// Prevent the actual click from going though - unless the target node is marked as requiring
	// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
	if (!this.needsClick(targetElement)) {
		event.preventDefault();
		this.sendClick(targetElement, event);
	}

	return false;
};


/**
 * On touch cancel, stop tracking the click.
 *
 * @returns {void}
 */
FastClick.prototype.onTouchCancel = function() {
	'use strict';
	this.trackingClick = false;
	this.targetElement = null;
};


/**
 * Determine mouse events which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onMouse = function(event) {
	'use strict';

	// If a target element was never set (because a touch event was never fired) allow the event
	if (!this.targetElement) {
		return true;
	}

	if (event.forwardedTouchEvent) {
		return true;
	}

	// Programmatically generated events targeting a specific element should be permitted
	if (!event.cancelable) {
		return true;
	}

	// Derive and check the target element to see whether the mouse event needs to be permitted;
	// unless explicitly enabled, prevent non-touch click events from triggering actions,
	// to prevent ghost/doubleclicks.
	if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

		// Prevent any user-added listeners declared on FastClick element from being fired.
		if (event.stopImmediatePropagation) {
			event.stopImmediatePropagation();
		} else {

			// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
			event.propagationStopped = true;
		}

		// Cancel the event
		event.stopPropagation();
		event.preventDefault();

		return false;
	}

	// If the mouse event is permitted, return true for the action to go through.
	return true;
};


/**
 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
 * an actual click which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onClick = function(event) {
	'use strict';
	var permitted;

	// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
	if (this.trackingClick) {
		this.targetElement = null;
		this.trackingClick = false;
		return true;
	}

	// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
	if (event.target.type === 'submit' && event.detail === 0) {
		return true;
	}

	permitted = this.onMouse(event);

	// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
	if (!permitted) {
		this.targetElement = null;
	}

	// If clicks are permitted, return true for the action to go through.
	return permitted;
};


/**
 * Remove all FastClick's event listeners.
 *
 * @returns {void}
 */
FastClick.prototype.destroy = function() {
	'use strict';
	var layer = this.layer;

	if (deviceIsAndroid) {
		layer.removeEventListener('mouseover', this.onMouse, true);
		layer.removeEventListener('mousedown', this.onMouse, true);
		layer.removeEventListener('mouseup', this.onMouse, true);
	}

	layer.removeEventListener('click', this.onClick, true);
	layer.removeEventListener('touchstart', this.onTouchStart, false);
	layer.removeEventListener('touchmove', this.onTouchMove, false);
	layer.removeEventListener('touchend', this.onTouchEnd, false);
	layer.removeEventListener('touchcancel', this.onTouchCancel, false);
};


/**
 * Check whether FastClick is needed.
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.notNeeded = function(layer) {
	'use strict';
	var metaViewport;
	var chromeVersion;
	var blackberryVersion;

	// Devices that don't support touch don't need FastClick
	if (typeof window.ontouchstart === 'undefined') {
		return true;
	}

	// Chrome version - zero for other browsers
	chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

	if (chromeVersion) {

		if (deviceIsAndroid) {
			metaViewport = document.querySelector('meta[name=viewport]');

			if (metaViewport) {
				// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
				if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
					return true;
				}
				// Chrome 32 and above with width=device-width or less don't need FastClick
				if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
					return true;
				}
			}

		// Chrome desktop doesn't need FastClick (issue #15)
		} else {
			return true;
		}
	}

	if (deviceIsBlackBerry10) {
		blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);
		
		// BlackBerry 10.3+ does not require Fastclick library.
		// https://github.com/ftlabs/fastclick/issues/251
		if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
			metaViewport = document.querySelector('meta[name=viewport]');

			if (metaViewport) {
				// user-scalable=no eliminates click delay.
				if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
					return true;
				}
				// width=device-width (or less than device-width) eliminates click delay.
				if (document.documentElement.scrollWidth <= window.outerWidth) {
					return true;
				}
			}
		}
	}
	
	// IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)
	if (layer.style.msTouchAction === 'none') {
		return true;
	}

	return false;
};


/**
 * Factory method for creating a FastClick object
 *
 * @param {Element} layer The layer to listen on
 * @param {Object} options The options to override the defaults
 */
FastClick.attach = function(layer, options) {
	'use strict';
	return new FastClick(layer, options);
};


if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {

	// AMD. Register as an anonymous module.
	define(function() {
		'use strict';
		return FastClick;
	});
} else if (typeof module !== 'undefined' && module.exports) {
	module.exports = FastClick.attach;
	module.exports.FastClick = FastClick;
} else {
	window.FastClick = FastClick;
}
(function() {
	var aa, aK = aa = aK || {
		version : "1.3.4"
	};
	aK.guid = "$BAIDU$";
	window[aK.guid] = window[aK.guid] || {};
	aK.object = aK.object || {};
	aK.extend = aK.object.extend = function(aW, T) {
		for (var aV in T) {
			if (T.hasOwnProperty(aV)) {
				aW[aV] = T[aV]
			}
		}
		return aW
	};
	aK.dom = aK.dom || {};
	aK.dom.g = function(T) {
		if ("string" == typeof T || T instanceof String) {
			return document.getElementById(T)
		} else {
			if (T && T.nodeName && (T.nodeType == 1 || T.nodeType == 9)) {
				return T
			}
		}
		return null
	};
	aK.g = aK.G = aK.dom.g;
	aK.dom.hide = function(T) {
		T = aK.dom.g(T);
		T.style.display = "none";
		return T
	};
	aK.hide = aK.dom.hide;
	aK.lang = aK.lang || {};
	aK.lang.isString = function(T) {
		return "[object String]" == Object.prototype.toString.call(T)
	};
	aK.isString = aK.lang.isString;
	aK.dom._g = function(T) {
		if (aK.lang.isString(T)) {
			return document.getElementById(T)
		}
		return T
	};
	aK._g = aK.dom._g;
	aK.dom.contains = function(T, aV) {
		var aW = aK.dom._g;
		T = aW(T);
		aV = aW(aV);
		return T.contains ? T != aV && T.contains(aV) : !!(T.compareDocumentPosition(aV) & 16)
	};
	aK.browser = aK.browser || {};
	aK.dom._NAME_ATTRS = (function() {
		var T = {
			cellpadding : "cellPadding",
			cellspacing : "cellSpacing",
			colspan : "colSpan",
			rowspan : "rowSpan",
			valign : "vAlign",
			usemap : "useMap",
			frameborder : "frameBorder"
		};
		T.htmlFor = "for";
		T.className = "class";
		return T
	})();
	aK.dom.setAttr = function(aV, T, aW) {
		aV = aK.dom.g(aV);
		if ("style" == T) {
			aV.style.cssText = aW
		} else {
			T = aK.dom._NAME_ATTRS[T] || T;
			aV.setAttribute(T, aW)
		}
		return aV
	};
	aK.setAttr = aK.dom.setAttr;
	aK.dom.setAttrs = function(aW, T) {
		aW = aK.dom.g(aW);
		for (var aV in T) {
			aK.dom.setAttr(aW, aV, T[aV])
		}
		return aW
	};
	aK.setAttrs = aK.dom.setAttrs;
	aK.string = aK.string || {};
	aK.dom.removeClass = function(aZ, a0) {
		aZ = aK.dom.g(aZ);
		var aX = aZ.className.split(/\s+/), a1 = a0.split(/\s+/), aV, T = a1.length, aW, aY = 0;
		for (; aY < T; ++aY) {
			for ( aW = 0, aV = aX.length; aW < aV; ++aW) {
				if (aX[aW] == a1[aY]) {
					aX.splice(aW, 1);
					break
				}
			}
		}
		aZ.className = aX.join(" ");
		return aZ
	};
	aK.removeClass = aK.dom.removeClass;
	aK.dom.insertHTML = function(aX, T, aW) {
		aX = aK.dom.g(aX);
		var aV, aY;
		if (aX.insertAdjacentHTML) {
			aX.insertAdjacentHTML(T, aW)
		} else {
			aV = aX.ownerDocument.createRange();
			T = T.toUpperCase();
			if (T == "AFTERBEGIN" || T == "BEFOREEND") {
				aV.selectNodeContents(aX);
				aV.collapse(T == "AFTERBEGIN")
			} else {
				aY = T == "BEFOREBEGIN";
				aV[aY?"setStartBefore":"setEndAfter"](aX);
				aV.collapse(aY)
			}
			aV.insertNode(aV.createContextualFragment(aW))
		}
		return aX
	};
	aK.insertHTML = aK.dom.insertHTML;
	aK.dom.show = function(T) {
		T = aK.dom.g(T);
		T.style.display = "";
		return T
	};
	aK.show = aK.dom.show;
	aK.dom.getDocument = function(T) {
		T = aK.dom.g(T);
		return T.nodeType == 9 ? T : T.ownerDocument || T.document
	};
	aK.dom.addClass = function(aZ, a0) {
		aZ = aK.dom.g(aZ);
		var aV = a0.split(/\s+/), T = aZ.className, aY = " " + T + " ", aX = 0, aW = aV.length;
		for (; aX < aW; aX++) {
			if (aY.indexOf(" " + aV[aX] + " ") < 0) {
				T += " " + aV[aX]
			}
		}
		aZ.className = T;
		return aZ
	};
	aK.addClass = aK.dom.addClass;
	aK.dom._styleFixer = aK.dom._styleFixer || {};
	aK.dom._styleFilter = aK.dom._styleFilter || [];
	aK.dom._styleFilter.filter = function(aV, aY, aZ) {
		for (var T = 0, aX = aK.dom._styleFilter, aW; aW = aX[T]; T++) {
			if ( aW = aW[aZ]) {
				aY = aW(aV, aY)
			}
		}
		return aY
	};
	aK.string.toCamelCase = function(T) {
		if (T.indexOf("-") < 0 && T.indexOf("_") < 0) {
			return T
		}
		return T.replace(/[-_][^-_]/g, function(aV) {
			return aV.charAt(1).toUpperCase()
		})
	};
	aK.dom.getStyle = function(aW, aV) {
		var aZ = aK.dom;
		aW = aZ.g(aW);
		aV = aK.string.toCamelCase(aV);
		var aY = aW.style[aV];
		if (!aY) {
			var T = aZ._styleFixer[aV], aX = aW.currentStyle || getComputedStyle(aW, null);
			aY = T && T.get ? T.get(aW, aX) : aX[T || aV]
		}
		if ( T = aZ._styleFilter) {
			aY = T.filter(aV, aY, "get")
		}
		return aY
	};
	aK.getStyle = aK.dom.getStyle;
	if (/opera\/(\d+\.\d)/i.test(navigator.userAgent)) {
		aK.browser.opera = +RegExp["\x241"]
	}
	aK.browser.isWebkit = /webkit/i.test(navigator.userAgent);
	aK.browser.isGecko = /gecko/i.test(navigator.userAgent) && !/like gecko/i.test(navigator.userAgent);
	aK.browser.isStrict = document.compatMode == "CSS1Compat";
	aK.dom.getPosition = function(T) {
		T = aK.dom.g(T);
		var a3 = aK.dom.getDocument(T), aX = aK.browser, a0 = aK.dom.getStyle, aW = aX.isGecko > 0 && a3.getBoxObjectFor && a0(T, "position") == "absolute" && (T.style.top === "" || T.style.left === ""), a1 = {
			left : 0,
			top : 0
		}, aZ = (aX.ie && !aX.isStrict) ? a3.body : a3.documentElement, a4, aV;
		if (T == aZ) {
			return a1
		}
		if (T.getBoundingClientRect) {
			aV = T.getBoundingClientRect();
			a1.left = Math.floor(aV.left) + Math.max(a3.documentElement.scrollLeft, a3.body.scrollLeft);
			a1.top = Math.floor(aV.top) + Math.max(a3.documentElement.scrollTop, a3.body.scrollTop);
			a1.left -= a3.documentElement.clientLeft;
			a1.top -= a3.documentElement.clientTop;
			var a2 = a3.body, a5 = parseInt(a0(a2, "borderLeftWidth")), aY = parseInt(a0(a2, "borderTopWidth"));
			if (aX.ie && !aX.isStrict) {
				a1.left -= isNaN(a5) ? 2 : a5;
				a1.top -= isNaN(aY) ? 2 : aY
			}
		} else {
			a4 = T;
			do {
				a1.left += a4.offsetLeft;
				a1.top += a4.offsetTop;
				if (aX.isWebkit > 0 && a0(a4, "position") == "fixed") {
					a1.left += a3.body.scrollLeft;
					a1.top += a3.body.scrollTop;
					break
				}
				a4 = a4.offsetParent
			} while(a4&&a4!=T);
			if (aX.opera > 0 || (aX.isWebkit > 0 && a0(T, "position") == "absolute")) {
				a1.top -= a3.body.offsetTop
			}
			a4 = T.offsetParent;
			while (a4 && a4 != a3.body) {
				a1.left -= a4.scrollLeft;
				if (!aX.opera || a4.tagName != "TR") {
					a1.top -= a4.scrollTop
				}
				a4 = a4.offsetParent
			}
		}
		return a1
	};
	if (/firefox\/(\d+\.\d)/i.test(navigator.userAgent)) {
		aK.browser.firefox = +RegExp["\x241"]
	}
	(function() {
		var T = navigator.userAgent;
		if (/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(T) && !/chrome/i.test(T)) {
			aK.browser.safari = +(RegExp["\x241"] || RegExp["\x242"])
		}
	})();
	if (/chrome\/(\d+\.\d)/i.test(navigator.userAgent)) {
		aK.browser.chrome = +RegExp["\x241"]
	}
	aK.array = aK.array || {};
	aK.array.each = function(aZ, aX) {
		var aW, aY, aV, T = aZ.length;
		if ("function" == typeof aX) {
			for ( aV = 0; aV < T; aV++) {
				aY = aZ[aV];
				aW = aX.call(aZ, aY, aV);
				if (aW === false) {
					break
				}
			}
		}
		return aZ
	};
	aK.each = aK.array.each;
	aK.lang.guid = function() {
		return "TANGRAM__" + (window[aK.guid]._counter++).toString(36)
	};
	window[aK.guid]._counter = window[aK.guid]._counter || 1;
	window[aK.guid]._instances = window[aK.guid]._instances || {};
	aK.lang.isFunction = function(T) {
		return "[object Function]" == Object.prototype.toString.call(T)
	};
	aK.lang.Class = function(T) {
		this.guid = T || aK.lang.guid();
		window[aK.guid]._instances[this.guid] = this
	};
	window[aK.guid]._instances = window[aK.guid]._instances || {};
	aK.lang.Class.prototype.dispose = function() {
		delete window[aK.guid]._instances[this.guid];
		for (var T in this) {
			if (!aK.lang.isFunction(this[T])) {
				delete this[T]
			}
		}
		this.disposed = true
	};
	aK.lang.Class.prototype.toString = function() {
		return "[object " + (this._className || "Object") + "]"
	};
	aK.lang.Event = function(T, aV) {
		this.type = T;
		this.returnValue = true;
		this.target = aV || null;
		this.currentTarget = null
	};
	aK.lang.Class.prototype.addEventListener = function(aX, aW, aV) {
		if (!aK.lang.isFunction(aW)) {
			return
		}
		!this.__listeners && (this.__listeners = {});
		var T = this.__listeners, aY;
		if ( typeof aV == "string" && aV) {
			if (/[^\w\-]/.test(aV)) {
				throw ("nonstandard key:" + aV)
			} else {
				aW.hashCode = aV;
				aY = aV
			}
		}
		aX.indexOf("on") != 0 && ( aX = "on" + aX);
		typeof T[aX] != "object" && (T[aX] = {});
		aY = aY || aK.lang.guid();
		aW.hashCode = aY;
		T[aX][aY] = aW
	};
	aK.lang.Class.prototype.removeEventListener = function(aW, aV) {
		if (aK.lang.isFunction(aV)) {
			aV = aV.hashCode
		} else {
			if (!aK.lang.isString(aV)) {
				return
			}
		}
		!this.__listeners && (this.__listeners = {});
		aW.indexOf("on") != 0 && ( aW = "on" + aW);
		var T = this.__listeners;
		if (!T[aW]) {
			return
		}
		T[aW][aV] &&
		delete T[aW][aV]
	};
	aK.lang.Class.prototype.dispatchEvent = function(aX, T) {
		if (aK.lang.isString(aX)) {
			aX = new aK.lang.Event(aX)
		}
		!this.__listeners && (this.__listeners = {});
		T = T || {};
		for (var aW in T) {
			aX[aW] = T[aW]
		}
		var aW, aV = this.__listeners, aY = aX.type;
		aX.target = aX.target || this;
		aX.currentTarget = this;
		aY.indexOf("on") != 0 && ( aY = "on" + aY);
		aK.lang.isFunction(this[aY]) && this[aY].apply(this, arguments);
		if ( typeof aV[aY] == "object") {
			for (aW in aV[aY]) {
				aV[aY][aW].apply(this, arguments)
			}
		}
		return aX.returnValue
	};
	aK.lang.inherits = function(a0, aY, aX) {
		var aW, aZ, T = a0.prototype, aV = new Function();
		aV.prototype = aY.prototype;
		aZ = a0.prototype = new aV();
		for (aW in T) {
			aZ[aW] = T[aW]
		}
		a0.prototype.constructor = a0;
		a0.superClass = aY.prototype;
		if ("string" == typeof aX) {
			aZ._className = aX
		}
	};
	aK.inherits = aK.lang.inherits;
	aK.lang.instance = function(T) {
		return window[aK.guid]._instances[T] || null
	};
	aK.platform = aK.platform || {};
	aK.platform.isAndroid = /android/i.test(navigator.userAgent);
	if (/android (\d+\.\d)/i.test(navigator.userAgent)) {
		aK.platform.android = aK.android = RegExp["\x241"]
	}
	aK.platform.isIpad = /ipad/i.test(navigator.userAgent);
	aK.platform.isIphone = /iphone/i.test(navigator.userAgent);
	aK.platform.iosVersion = /iphone os (\d)\_/i.test(navigator.userAgent) ? +RegExp["\x241"] : 0;
	aK.lang.Event.prototype.inherit = function(aW) {
		var aV = this;
		this.domEvent = aW = window.event || aW;
		aV.clientX = aW.clientX || aW.pageX;
		aV.clientY = aW.clientY || aW.pageY;
		aV.offsetX = aW.offsetX || aW.layerX;
		aV.offsetY = aW.offsetY || aW.layerY;
		aV.screenX = aW.screenX;
		aV.screenY = aW.screenY;
		aV.ctrlKey = aW.ctrlKey || aW.metaKey;
		aV.shiftKey = aW.shiftKey;
		aV.altKey = aW.altKey;
		if (aW.touches) {
			aV.touches = [];
			for (var T = 0; T < aW.touches.length; T++) {
				aV.touches.push({
					clientX : aW.touches[T].clientX,
					clientY : aW.touches[T].clientY,
					screenX : aW.touches[T].screenX,
					screenY : aW.touches[T].screenY,
					pageX : aW.touches[T].pageX,
					pageY : aW.touches[T].pageY,
					target : aW.touches[T].target,
					identifier : aW.touches[T].identifier
				})
			}
		}
		if (aW.changedTouches) {
			aV.changedTouches = [];
			for (var T = 0; T < aW.changedTouches.length; T++) {
				aV.changedTouches.push({
					clientX : aW.changedTouches[T].clientX,
					clientY : aW.changedTouches[T].clientY,
					screenX : aW.changedTouches[T].screenX,
					screenY : aW.changedTouches[T].screenY,
					pageX : aW.changedTouches[T].pageX,
					pageY : aW.changedTouches[T].pageY,
					target : aW.changedTouches[T].target,
					identifier : aW.changedTouches[T].identifier
				})
			}
		}
		if (aW.targetTouches) {
			aV.targetTouches = [];
			for (var T = 0; T < aW.targetTouches.length; T++) {
				aV.targetTouches.push({
					clientX : aW.targetTouches[T].clientX,
					clientY : aW.targetTouches[T].clientY,
					screenX : aW.targetTouches[T].screenX,
					screenY : aW.targetTouches[T].screenY,
					pageX : aW.targetTouches[T].pageX,
					pageY : aW.targetTouches[T].pageY,
					target : aW.targetTouches[T].target,
					identifier : aW.targetTouches[T].identifier
				})
			}
		}
		aV.rotation = aW.rotation;
		aV.scale = aW.scale;
		return aV
	};
	aK.lang.decontrol = function(aV) {
		var T = window[aK.guid];
		T._instances && (
		delete T._instances[aV])
	};
	aK.event = {};
	aK.on = aK.event.on = function(aW, aV, T) {
		if (!( aW = aK.g(aW))) {
			return aW
		}
		aV = aV.replace(/^on/, "");
		if (aW.addEventListener) {
			aW.addEventListener(aV, T, false)
		} else {
			if (aW.attachEvent) {
				aW.attachEvent("on" + aV, T)
			}
		}
		return aW
	};
	aK.un = aK.event.un = function(aW, aV, T) {
		if (!( aW = aK.g(aW))) {
			return aW
		}
		aV = aV.replace(/^on/, "");
		if (aW.removeEventListener) {
			aW.removeEventListener(aV, T, false)
		} else {
			if (aW.detachEvent) {
				aW.detachEvent("on" + aV, T)
			}
		}
		return aW
	};
	aK.dom.hasClass = function(aW, aV) {
		if (!aW || !aW.className || typeof aW.className != "string") {
			return false
		}
		var T = -1;
		try {
			T = aW.className == aV || aW.className.indexOf(aV)
		} catch(aX) {
			return false
		}
		return T > -1
	};
	window.BMap = window.BMap || {};
	window.BMap._register = [];
	window.BMap.register = function(T) {
		this._register.push(T)
	};
	BMap._streetViewRegister = [];
	BMap.streetViewRegister = function(T) {
		this._streetViewRegister.push(T)
	};
	function z(aX, aZ) {
		aX = aK.g(aX);
		if (!aX) {
			return
		}
		var aY = this;
		aK.lang.Class.call(aY);
		aY.config = {
			clickInterval : 200,
			enableDragging : true,
			enableDblclickZoom : true,
			enableMouseDown : true,
			enablePinchToZoom : true,
			enableAutoResize : true,
			fps : 25,
			actionDuration : 450,
			minZoom : 3,
			maxZoom : 18,
			mapType : new aO("地图", aE, {
				tips : "显示普通地图",
				mapInstance : this
			}),
			enableInertialDragging : false,
			drawer : BMAP_SYS_DRAWER,
			drawMargin : 100,
			enableHighResolution : false,
			devicePixelRatio : window.devicePixelRatio || 2,
			vectorMapLevel : 3,
			fixCenterWhenPinch : false,
			fixCenterWhenResize : false,
			trafficStatus : false
		};
		aK.extend(aY.config, aZ || {});
		if (aY.config.devicePixelRatio > 2) {
			aY.config.devicePixelRatio = 2
		}
		aY.container = aX;
		aY._setStyle(aX);
		aX.unselectable = "on";
		aX.innerHTML = "";
		aX.appendChild(aY.render());
		var aV = aY.getSize();
		aY.width = aV.width;
		aY.height = aV.height;
		aY.offsetX = 0;
		aY.offsetY = 0;
		aY.platform = aX.firstChild;
		aY.preWebkitTransform = "";
		aY.maskLayer = aY.platform.firstChild;
		aY.maskLayer.style.width = aY.width + "px";
		aY.maskLayer.style.height = aY.height + "px";
		aY._panes = {};
		aY.centerPoint = new f(0, 0);
		aY.mercatorCenter = new f(0, 0);
		aY.zoomLevel = 1;
		aY.lastLevel = 0;
		aY.defaultZoomLevel = null;
		aY.defaultCenter = null;
		aY._hotspots = {};
		aY.currentOperation = 0;
		aZ = aZ || {};
		var a0 = aY.mapType = aY.config.mapType;
		aY.projection = a0.getProjection();
		var T = aY.config;
		T.userMinZoom = aZ.minZoom;
		T.userMaxZoom = aZ.maxZoom;
		aY._checkZoom();
		aY.temp = {
			operating : false,
			arrow : 0,
			lastDomMoveTime : 0,
			lastLoadTileTime : 0,
			lastMovingTime : 0,
			canKeyboard : false,
			registerIndex : -1,
			curSpots : []
		};
		for (var aW = 0; aW < BMap._register.length; aW++) {
			BMap._register[aW](aY)
		}
		aY.temp.registerIndex = aW;
		aY._bind();
		ar.load("map", function() {
			aY._draw()
		});
		ar.load("opmb", function() {
			aY._asyncRegister()
		});
		aX = null;
		aY.enableLoadTiles = true;
		aY._viewTiles = []
	}
	aK.lang.inherits(z, aK.lang.Class, "Map");
	aK.extend(z.prototype, {
		render : function() {
			var T = r("div");
			var aX = T.style;
			aX.overflow = "visible";
			aX.position = "absolute";
			aX.zIndex = "0";
			aX.top = aX.left = "0px";
			var aV = r("div", {
				"class" : "BMap_mask"
			});
			var aW = aV.style;
			aW.position = "absolute";
			aW.top = aW.left = "0px";
			aW.zIndex = "9";
			aW.overflow = "hidden";
			aW.WebkitUserSelect = "none";
			T.appendChild(aV);
			return T
		},
		_setStyle : function(aV) {
			var T = aV.style;
			T.overflow = "hidden";
			if (ap(aV).position != "absolute") {
				T.position = "relative";
				T.zIndex = 0
			}
			T.backgroundColor = "#F5F3F0";
			T.color = "#000";
			T.textAlign = "left"
		},
		_bind : function() {
			var T = this;
			T._watchSize = function() {
				var aV = T.getSize();
				if (T.width != aV.width || T.height != aV.height) {
					var aY = new X(T.width, T.height);
					var aZ = new ay("onbeforeresize");
					aZ.size = aY;
					T.dispatchEvent(aZ);
					if (!T.config.fixCenterWhenResize) {
						T._updateCenterPoint((aV.width - T.width) / 2, (aV.height - T.height) / 2)
					}
					T.maskLayer.style.width = (T.width = aV.width) + "px";
					T.maskLayer.style.height = (T.height = aV.height) + "px";
					var aW = new ay("onresize");
					aW.size = aV;
					T.dispatchEvent(aW)
				}
				var aX = T.platform.style.WebkitTransform;
				if (T.preWebkitTransform != "") {
					if (T.preWebkitTransform == aX) {
						aX = T.platform.style.WebkitTransform = ""
					}
				}
				T.preWebkitTransform = aX
			};
			if (T.config.enableAutoResize) {
				T.temp.autoResizeTimer = setInterval(T._watchSize, 1000)
			}
		},
		_updateCenterPoint : function(aZ, a0, aY, aX) {
			var aW = this.getMapType().getZoomUnits(this.getZoom());
			var aV = true;
			if (aY) {
				this.centerPoint = new f(aY.lng, aY.lat);
				aV = false
			}
			var T = (aY && aX) ? aY : this.mercatorCenter;
			if (T) {
				this.mercatorCenter = new f(T.lng + aZ * aW, T.lat - a0 * aW);
				if (this.mercatorCenter && aV) {
					this.centerPoint = this.mercatorCenter
				}
			}
		},
		zoomTo : function(aX, aV) {
			if (!K(aX)) {
				return
			}
			aX = this._getProperZoom(aX).zoom;
			if (aX == this.zoomLevel) {
				return
			}
			this.lastLevel = this.zoomLevel;
			this.zoomLevel = aX;
			var aW;
			if (aV) {
				aW = aV
			}
			if (aW) {
				var T = this.pointToPixel(aW, this.lastLevel);
				this._updateCenterPoint(this.width / 2 - T.x, this.height / 2 - T.y, aW, true)
			}
			this.dispatchEvent(new ay("onzoomstart"));
			this.dispatchEvent(new ay("onzoomstartcode"))
		},
		setZoom : function(T) {
			this.zoomTo(T)
		},
		zoomIn : function(T) {
			this.zoomTo(this.zoomLevel + 1, T)
		},
		zoomOut : function(T) {
			this.zoomTo(this.zoomLevel - 1, T)
		},
		panTo : function(T, aV) {
			if (!( T instanceof f)) {
				return
			}
			this.mercatorCenter = T;
			if (T) {
				this.centerPoint = new f(T.lng, T.lat)
			} else {
				this.centerPoint = this.mercatorCenter
			}
		},
		panBy : function(aV, T) {
			aV = Math.round(aV) || 0;
			T = Math.round(T) || 0;
			this._updateCenterPoint(-aV, -T)
		},
		addControl : function(T) {
			if (T && ax(T._i)) {
				T._i(this);
				this.dispatchEvent(new ay("onaddcontrol", T))
			}
		},
		removeControl : function(T) {
			if (T && ax(T.remove)) {
				T.remove();
				this.dispatchEvent(new ay("onremovecontrol", T))
			}
		},
		addOverlay : function(T) {
			if (T && ax(T._i)) {
				T._i(this);
				this.dispatchEvent(new ay("onaddoverlay", T))
			}
		},
		removeOverlay : function(T) {
			if (T && ax(T.remove)) {
				T.remove();
				this.dispatchEvent(new ay("onremoveoverlay", T))
			}
		},
		clearOverlays : function() {
			this.dispatchEvent(new ay("onclearoverlays"))
		},
		addTileLayer : function(T) {
			if (T) {
				this.dispatchEvent(new ay("onaddtilelayer", T))
			}
		},
		removeTileLayer : function(T) {
			if (T) {
				this.dispatchEvent(new ay("onremovetilelayer", T))
			}
		},
		setCenter : function(T) {
			if (T.equals(this.centerPoint)) {
				return
			}
			this.panTo(T, {
				noAnimation : true
			})
		},
		centerAndZoom : function(T, a2) {
			var aY = this;
			if (!( T instanceof f) || !a2) {
				return
			}
			a2 = aY._getProperZoom(a2).zoom;
			if (T.equals(aY.getCenter()) && a2 === aY.getZoom()) {
				return
			}
			aY.lastLevel = aY.zoomLevel || a2;
			aY.zoomLevel = a2;
			var a0 = aY.centerPoint;
			aY.centerPoint = new f(T.lng, T.lat);
			aY.mercatorCenter = aY.centerPoint;
			aY.defaultZoomLevel = aY.defaultZoomLevel || aY.zoomLevel;
			aY.defaultCenter = aY.defaultCenter || aY.centerPoint;
			var aX = new ay("onload");
			var aW = new ay("onloadcode");
			aX.point = new f(T.lng, T.lat);
			aX.pixel = aY.pointToPixel(aY.centerPoint, aY.zoomLevel);
			aX.zoom = a2;
			if (!aY.loaded) {
				aY.loaded = true;
				aY.dispatchEvent(aX)
			}
			aY.dispatchEvent(aW);
			var a1 = new ay("onmoveend");
			a1._eventSrc = "centerAndZoom";
			if (!a0.equals(aY.centerPoint)) {
				aY.dispatchEvent(a1)
			}
			if (aY.lastLevel != aY.zoomLevel) {
				var aZ = new ay("onzoomend");
				aZ._eventSrc = "centerAndZoom";
				aY.dispatchEvent(aZ)
			}
			var aV = new ay("centerandzoom");
			aY.dispatchEvent(aV)
		},
		reset : function() {
			this.centerAndZoom(this.defaultCenter, this.defaultZoomLevel, true)
		},
		enableDragging : function() {
			this.config.enableDragging = true
		},
		disableDragging : function() {
			this.config.enableDragging = false
		},
		enableInertialDragging : function() {
			this.config.enableInertialDragging = true
		},
		disableInertialDragging : function() {
			this.config.enableInertialDragging = false
		},
		enableDoubleClickZoom : function() {
			this.config.enableDblclickZoom = true
		},
		disableDoubleClickZoom : function() {
			this.config.enableDblclickZoom = false
		},
		enablePinchToZoom : function() {
			this.config.enablePinchToZoom = true
		},
		disablePinchToZoom : function() {
			this.config.enablePinchToZoom = false
		},
		enableAutoResize : function() {
			this.config.enableAutoResize = true;
			this._watchSize();
			if (!this.temp.autoResizeTimer) {
				this.temp.autoResizeTimer = setInterval(this._watchSize, 1000)
			}
		},
		disableAutoResize : function() {
			this.config.enableAutoResize = false;
			if (this.temp.autoResizeTimer) {
				clearInterval(this.temp.autoResizeTimer);
				this.temp.autoResizeTimer = null
			}
		},
		getSize : function() {
			return new X(this.container.clientWidth, this.container.clientHeight)
		},
		getCenter : function() {
			return this.centerPoint
		},
		getZoom : function() {
			return this.zoomLevel
		},
		checkResize : function() {
			this._watchSize()
		},
		_getProperZoom : function(aW) {
			var aV = this.config.minZoom, T = this.config.maxZoom, aX = false;
			if (aW < aV) {
				aX = true;
				aW = aV
			}
			if (aW > T) {
				aX = true;
				aW = T
			}
			return {
				zoom : aW,
				exceeded : aX
			}
		},
		getContainer : function() {
			return this.container
		},
		pointToPixel : function(T, aV) {
			aV = aV || this.getZoom();
			return this.projection.pointToPixel(T, aV, this.mercatorCenter, this.getSize())
		},
		pixelToPoint : function(T, aV) {
			aV = aV || this.getZoom();
			return this.projection.pixelToPoint(T, aV, this.mercatorCenter, this.getSize())
		},
		pointToOverlayPixel : function(T, aW) {
			if (!T) {
				return
			}
			var aX = new f(T.lng, T.lat);
			var aV = this.pointToPixel(aX, aW);
			aV.x -= this.offsetX;
			aV.y -= this.offsetY;
			return aV
		},
		overlayPixelToPoint : function(T, aW) {
			if (!T) {
				return
			}
			var aV = new aP(T.x, T.y);
			aV.x += this.offsetX;
			aV.y += this.offsetY;
			return this.pixelToPoint(aV, aW)
		},
		getBounds : function() {
			if (!this.isLoaded()) {
				return new u()
			}
			var aY = this.getSize();
			this.width = aY.width;
			this.height = aY.height;
			var aV = arguments[0] || {}, aX = aV.margins || [0, 0, 0, 0], T = aV.zoom || null, aZ = this.pixelToPoint({
				x : aX[3],
				y : this.height - aX[2]
			}, T), aW = this.pixelToPoint({
				x : this.width - aX[1],
				y : aX[0]
			}, T);
			return new u(aZ, aW)
		},
		isLoaded : function() {
			return !!this.loaded
		},
		_getBestLevel : function(aV, aW) {
			var aZ = this.getMapType();
			var a1 = aW.margins || [10, 10, 10, 10], aY = aW.zoomFactor || 0, a2 = a1[1] + a1[3], a0 = a1[0] + a1[2], T = aZ.getMinZoom(), a4 = aZ.getMaxZoom();
			for (var aX = a4; aX >= T; aX--) {
				var a3 = this.getMapType().getZoomUnits(aX);
				if (aV.toSpan().lng / a3 < this.width - a2 && aV.toSpan().lat / a3 < this.height - a0) {
					break
				}
			}
			aX += aY;
			if (aX < T) {
				aX = T
			}
			if (aX > a4) {
				aX = a4
			}
			return aX
		},
		getViewport : function(a3, aV) {
			var a7 = {
				center : this.getCenter(),
				zoom : this.getZoom()
			};
			if (!a3 || !a3 instanceof u && a3.length == 0 || a3 instanceof u && a3.isEmpty()) {
				return a7
			}
			var a5 = [];
			if ( a3 instanceof u) {
				a5.push(a3.getNorthEast());
				a5.push(a3.getSouthWest())
			} else {
				a5 = a3.slice(0)
			}
			aV = aV || {};
			var aZ = [];
			for (var a0 = 0, aY = a5.length; a0 < aY; a0++) {
				aZ.push(a5[a0])
			}
			var aW = new u();
			for (var a0 = aZ.length - 1; a0 >= 0; a0--) {
				aW.extend(aZ[a0])
			}
			if (aW.isEmpty()) {
				return a7
			}
			var T = aW.getCenter();
			var a6 = this._getBestLevel(aW, aV);
			if (aV.margins) {
				var a2 = aV.margins, a1 = (a2[1] - a2[3]) / 2, a4 = (a2[0] - a2[2]) / 2, aX = this.getMapType().getZoomUnits(a6);
				T.lng = T.lng + aX * a1;
				T.lat = T.lat + aX * a4
			}
			return {
				center : T,
				zoom : a6
			}
		},
		setViewport : function(aV, aY) {
			var T;
			if (aV && aV.center) {
				T = aV
			} else {
				T = this.getViewport(aV, aY)
			}
			aY = aY || {};
			var aW = aY.delay || 200;
			if (T.zoom == this.zoomLevel && aY.enableAnimation != false) {
				var aX = this;
				setTimeout(function() {
					aX.panTo(T.center, {
						duration : 210
					})
				}, aW)
			} else {
				this.centerAndZoom(T.center, T.zoom)
			}
		},
		getPanes : function() {
			return this._panes
		},
		getOverlays : function() {
			var aX = [], aY = this._overlays, aW = this._customOverlays;
			if (aY) {
				for (var aV in aY) {
					if (aY[aV] instanceof aG) {
						aX.push(aY[aV])
					}
				}
			}
			if (aW) {
				for (var aV = 0, T = aW.length; aV < T; aV++) {
					aX.push(aW[aV])
				}
			}
			return aX
		},
		getMapType : function() {
			return this.mapType
		},
		_asyncRegister : function() {
			for (var T = this.temp.registerIndex; T < BMap._register.length; T++) {
				BMap._register[T](this)
			}
			this.temp.registerIndex = T
		},
		highResolutionEnabled : function() {
			return this.config.enableHighResolution && window.devicePixelRatio > 1
		},
		enableHighResolution : function() {
			this.config.enableHighResolution = true
		},
		disableHighResolution : function() {
			this.config.enableHighResolution = false
		},
		addHotspot : function(aV) {
			if ( aV instanceof L) {
				this._hotspots[aV.guid] = aV;
				aV.initialize(this)
			}
			var T = this;
			ar.load("hotspot", function() {
				T._asyncRegister()
			})
		},
		removeHotspot : function(T) {
			if (this._hotspots[T.guid]) {
				delete this._hotspots[T.guid]
			}
		},
		clearHotspots : function() {
			this._hotspots = {}
		},
		_checkZoom : function() {
			var aV = this.mapType.getMinZoom();
			var aW = this.mapType.getMaxZoom();
			var T = this.config;
			T.minZoom = T.userMinZoom || aV;
			T.maxZoom = T.userMaxZoom || aW;
			if (T.minZoom < aV) {
				T.minZoom = aV
			}
			if (T.maxZoom > aW) {
				T.maxZoom = aW
			}
		},
		setMinZoom : function(T) {
			if (T > this.config.maxZoom) {
				T = this.config.maxZoom
			}
			this.config.userMinZoom = T;
			this._updateZoom()
		},
		setMaxZoom : function(T) {
			if (T < this.config.minZoom) {
				T = this.config.minZoom
			}
			this.config.userMaxZoom = T;
			this._updateZoom()
		},
		_updateZoom : function() {
			this._checkZoom();
			var T = this.config;
			if (this.zoomLevel < T.minZoom) {
				this.setZoom(T.minZoom)
			} else {
				if (this.zoomLevel > T.maxZoom) {
					this.setZoom(T.maxZoom)
				}
			}
			var aV = new ay("onzoomspanchange");
			aV.minZoom = T.minZoom;
			aV.maxZoom = T.maxZoom;
			this.dispatchEvent(aV)
		},
		getViewTiles : function() {
			return this._viewTiles
		},
		vectorMapEnabled : function() {
			return this.config.vectorMapLevel != 99
		},
		setTrafficOn : function() {
			this.config.trafficStatus = true;
			this.tileMgr.setRasterTrafficStatus();
			this.tileMgr.setVectorTrafficStatus()
		},
		setTrafficOff : function() {
			this.config.trafficStatus = false;
			this.tileMgr.setRasterTrafficStatus();
			this.tileMgr.setVectorTrafficStatus()
		},
		showOverlayContainer : function() {
			if (this.overlayDiv) {
				this.overlayDiv.style.visibility = ""
			}
		},
		hideOverlayContainer : function() {
			if (this.overlayDiv) {
				this.overlayDiv.style.visibility = "hidden"
			}
		}
	});
	window.BMAP_SYS_DRAWER = 0;
	window.BMAP_SVG_DRAWER = 1;
	window.BMAP_CANVAS_DRAWER = 3;
	(function() {
		window.asyncMdlVer = {
			control : "kjxkph",
			hotspot : "ur1vb5",
			map : "flwz1b",
			marker : "yyz1tt",
			opmb : "uddwgi",
			poly : "btdsoc",
			vector : "jmdnwe",
			streetview : "uvpdao",
			layer : "azr2hf"
		};
		window.chkVersion = function(T) {
			try {
				var aV = window.localStorage;
				if (!aV) {
					return false
				}
				return aV[T] && aV[T].length > 0
			} catch(aW) {
				return false
			}
		};
		window.saveVersion = function(T, a0, aY) {
			try {
				var aW = window.localStorage;
				if (aW) {
					for (var aV = aW.length, aX = aV - 1; aX >= 0; aX--) {
						var a1 = aW.key(aX);
						if (a1.indexOf(aY) > -1) {
							aW.removeItem(a1)
						}
					}
					aW.setItem(T, a0)
				}
			} catch(aZ) {
			}
		};
		window.getVersion = function(T) {
			try {
				var aV = window.localStorage;
				if (!aV) {
					return ""
				}
				return aV.getItem(T)
			} catch(aW) {
				return ""
			}
		}
	})();
	function aL(aX) {
		var T = {
			duration : 1000,
			fps : 30,
			delay : 0,
			transition : h.linear,
			onStop : function() {
			}
		};
		this._anis = [];
		if (aX) {
			for (var aV in aX) {
				T[aV] = aX[aV]
			}
		}
		this._opts = T;
		if (K(T.delay)) {
			var aW = this;
			setTimeout(function() {
				aW.start()
			}, T.delay)
		} else {
			if (T.delay != aL.INFINITE) {
				this.start()
			}
		}
	}
	aL.INFINITE = "INFINITE";
	aL.prototype.start = function() {
		this._beginTime = y();
		this._endTime = this._beginTime + this._opts.duration;
		this._launch()
	};
	aL.prototype.add = function(T) {
		this._anis.push(T)
	};
	aL.prototype._launch = function() {
		var aW = this;
		var T = y();
		if (T >= aW._endTime) {
			if (ax(aW._opts.render)) {
				aW._opts.render(aW._opts.transition(1))
			}
			if (ax(aW._opts.finish)) {
				aW._opts.finish()
			}
			if (aW._anis.length > 0) {
				var aV = aW._anis[0];
				aV._anis = [].concat(aW._anis.slice(1));
				aV.start()
			}
			return
		}
		aW.schedule = aW._opts.transition((T - aW._beginTime) / aW._opts.duration);
		if (ax(aW._opts.render)) {
			aW._opts.render(aW.schedule)
		}
		if (!aW.terminative) {
			aW._timer = setTimeout(function() {
				aW._launch()
			}, 1000 / aW._opts.fps)
		}
	};
	aL.prototype.stop = function(aV) {
		this.terminative = true;
		for (var T = 0; T < this._anis.length; T++) {
			this._anis[T].stop();
			this._anis[T] = null
		}
		this._anis.length = 0;
		if (this._timer) {
			clearTimeout(this._timer);
			this._timer = null
		}
		this._opts.onStop(this.schedule);
		if (aV) {
			this._endTime = this._beginTime;
			this._launch()
		}
	};
	aL.prototype.cancel = function() {
		if (this._timer) {
			clearTimeout(this._timer)
		}
		this._endTime = this._beginTime;
		this.schedule = 0
	};
	aL.prototype.setFinishCallback = function(T) {
		if (this._anis.length > 0) {
			this._anis[this._anis.length - 1]._opts.finish = T
		} else {
			this._opts.finish = T
		}
	};
	var h = {
		linear : function(T) {
			return T
		},
		reverse : function(T) {
			return 1 - T
		},
		easeInQuad : function(T) {
			return T * T
		},
		easeInCubic : function(T) {
			return Math.pow(T, 3)
		},
		easeOutQuad : function(T) {
			return -(T * (T - 2))
		},
		easeOutCubic : function(T) {
			return Math.pow((T - 1), 3) + 1
		},
		easeInOutQuad : function(T) {
			if (T < 0.5) {
				return T * T * 2
			} else {
				return -2 * (T - 2) * T - 1
			}
			return
		},
		easeInOutCubic : function(T) {
			if (T < 0.5) {
				return Math.pow(T, 3) * 4
			} else {
				return Math.pow(T - 1, 3) * 4 + 1
			}
		},
		easeInOutSine : function(T) {
			return (1 - Math.cos(Math.PI * T)) / 2
		}
	};
	h["ease-in"] = h.easeInQuad;
	h["ease-out"] = h.easeOutQuad;
	var aT = {
		imgPath : "http://map.baidu.com/res_mobile2/images/"
	};
	function aU(aW, T) {
		var aV = aW.style;
		aV.left = T[0] + "px";
		aV.top = T[1] + "px"
	}

	function n(T) {
		T.style.MozUserSelect = "none"
	}

	function q(T) {
		return T && T.parentNode && T.parentNode.nodeType != 11
	}

	function Y(aV, T) {
		aK.dom.insertHTML(aV, "beforeEnd", T);
		return aV.lastChild
	}

	function x(T) {
		var aV = {
			left : 0,
			top : 0
		};
		while (T && T.offsetParent) {
			aV.left += T.offsetLeft;
			aV.top += T.offsetTop;
			T = T.offsetParent
		}
		return aV
	}

	function ag(T) {
		var T = window.event || T;
		T.stopPropagation ? T.stopPropagation() : T.cancelBubble = true
	}

	function A(T) {
		var T = window.event || T;
		T.preventDefault ? T.preventDefault() : T.returnValue = false;
		return false
	}

	function aB(T) {
		ag(T);
		return A(T)
	}

	function I() {
		var T = document.documentElement, aV = document.body;
		if (T && (T.scrollTop || T.scrollLeft)) {
			return [T.scrollTop, T.scrollLeft]
		} else {
			if (aV) {
				return [aV.scrollTop, aV.scrollLeft]
			} else {
				return [0, 0]
			}
		}
	}

	function s(aV, T) {
		if (!aV || !T) {
			return
		}
		return Math.round(Math.sqrt(Math.pow(aV.x - T.x, 2) + Math.pow(aV.y - T.y, 2)))
	}

	function r(aV, T, aW) {
		var aX = document.createElement(aV);
		if (aW) {
			aX = document.createElementNS(aW, aV)
		}
		return aK.dom.setAttrs(aX, T || {})
	}

	function ap(T) {
		if (T.currentStyle) {
			return T.currentStyle
		} else {
			if (T.ownerDocument && T.ownerDocument.defaultView) {
				return T.ownerDocument.defaultView.getComputedStyle(T, null)
			}
		}
	}

	function ax(T) {
		return typeof T == "function"
	}

	function K(T) {
		return typeof T == "number"
	}

	function aI(T) {
		return typeof T == "string"
	}

	function ah(T) {
		return typeof T != "undefined"
	}

	function D(T) {
		return typeof T == "object"
	}

	function d(T) {
		return "[object Array]" == Object.prototype.toString.call(T)
	}

	function j() {
		if ( typeof j.result != "boolean") {
			j.result = !!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.1")
		}
		return j.result
	}

	function Z() {
		if ( typeof Z.result != "boolean") {
			Z.result = !!r("canvas").getContext
		}
		return Z.result
	}

	function aq(T) {
		return T * Math.PI / 180
	}

	var ay = aK.lang.Event;
	function au() {
		return !!(aK.platform.isIphone || aK.platform.isIpad || aK.platform.isAndroid)
	}

	function y() {
		return (new Date).getTime()
	}

	function g() {
		if (aK.platform.isAndroid && parseFloat(aK.platform.android) > 2.3) {
			return true
		}
		return false
	}

	var aN = {
		request : function(aV) {
			var T = r("script", {
				src : aV,
				type : "text/javascript",
				charset : "utf-8"
			});
			T.addEventListener("load", function(aX) {
				var aW = aX.target;
				aW.parentNode.removeChild(aW)
			}, false);
			document.getElementsByTagName("head")[0].appendChild(T);
			T = null
		}
	};
	window.sendReqNo = 0;
	function ar() {
	}
	aK.object.extend(ar, {
		Request : {
			INITIAL : -1,
			WAITING : 0,
			COMPLETED : 1
		},
		getDependency : function() {
			return {
				poly : ["marker"],
				layer : ["vector"]
			}
		},
		Config : {
			_baseUrl : "http://map.baidu.com/mobile/?qt=getMobileModules&v=2&"
		},
		delayFlag : false,
		ModuleTree : {
			_modules : {},
			_arrMdls : []
		},
		load : function(aW, aY, aV) {
			var T = this.getModule(aW);
			if (T._status == this.Request.COMPLETED) {
				if (aV) {
					aY()
				}
				return
			} else {
				if (T._status == this.Request.INITIAL) {
					this.combine(aW);
					this.pushUniqueMdl(aW);
					var aX = this;
					if (aX.delayFlag == false) {
						aX.delayFlag = true;
						window.setTimeout(function() {
							var a5 = aX.ModuleTree._arrMdls.slice(0);
							var a7 = [];
							for (var a1 = 0, a0 = a5.length; a1 < a0; a1++) {
								var a6 = a5[a1], aZ = window.asyncMdlVer[a6], a3 = "async_" + a6 + "_" + aZ;
								if (!window.chkVersion(a3)) {
									a5[a5[a1]] = "";
									a7.push(a6 + "_" + aZ)
								} else {
									a5[a5[a1]] = window.getVersion(a3)
								}
							}
							if (a7.length == 0) {
								for (var a1 = 0, a0 = a5.length; a1 < a0; a1++) {
									var a8 = a5[a1], a3 = "async_" + a8 + "_" + window.asyncMdlVer[a8], a4 = window.getVersion(a3);
									ar.run(a8, a4)
								}
							} else {
								var a2 = aX.Config._baseUrl + "mod=" + a7.join(",") + "&sendReqNo=" + window.sendReqNo + "&cbk=_jsload";
								aN.request(a2);
								window["sendReqNo" + window.sendReqNo] = a5;
								window.sendReqNo++
							}
							aX.delayFlag = false;
							aX.ModuleTree._arrMdls.length = 0
						}, 1)
					}
					T._status = this.Request.WAITING
				}
				T._callbacks.push(aY)
			}
		},
		combine : function(T) {
			var aW = this.getDependency();
			if (T && aW[T]) {
				var aW = aW[T];
				for (var aV = 0; aV < aW.length; aV++) {
					this.combine(aW[aV]);
					if (!this.ModuleTree._modules[aW[aV]]) {
						this.pushUniqueMdl(aW[aV])
					}
				}
			}
		},
		pushUniqueMdl : function(aX) {
			var T = this.ModuleTree._arrMdls;
			for (var aW = 0, aV = T.length; aW < aV; aW++) {
				if (T[aW] == aX) {
					return
				}
			}
			T.push(aX)
		},
		getModule : function(aV) {
			var T;
			if (!this.ModuleTree._modules[aV]) {
				this.ModuleTree._modules[aV] = {};
				this.ModuleTree._modules[aV]._status = this.Request.INITIAL;
				this.ModuleTree._modules[aV]._callbacks = []
			}
			T = this.ModuleTree._modules[aV];
			return T
		},
		run : function(aX, a0) {
			var aV = "async_" + aX + "_" + window.asyncMdlVer[aX], aZ = "async_" + aX;
			if (!window.chkVersion(aV)) {
				window.saveVersion(aV, a0, aZ)
			}
			var aW = this.getModule(aX);
			try {
				eval(a0)
			} catch(a1) {
				return
			}
			aW._status = this.Request.COMPLETED;
			for (var aY = 0, T = aW._callbacks.length; aY < T; aY++) {
				aW._callbacks[aY]()
			}
			aW._callbacks.length = 0
		}
	});
	window._jsload = function(aZ, a1, a0) {
		var T = window["sendReqNo" + a0], aW = aZ.split("_")[0];
		T[aW] = a1;
		var aY = true;
		for (var aX = 0, aV = T.length; aX < aV; aX++) {
			if (T[T[aX]].length <= 0) {
				aY = false;
				break
			}
		}
		if (aY) {
			for (var aX = 0, aV = T.length; aX < aV; aX++) {
				var aZ = T[aX], a1 = T[aZ];
				ar.run(aZ, a1)
			}
			T.length = 0;
			delete window["sendReqNo" + a0]
		}
	};
	function aP(T, aV) {
		this.x = T || 0;
		this.y = aV || 0
	}
	aP.prototype.equals = function(T) {
		return T && T.x == this.x && T.y == this.y
	};
	function X(aV, T) {
		this.width = aV || 0;
		this.height = T || 0
	}
	X.prototype.equals = function(T) {
		return T && this.width == T.width && this.height == T.height
	};
	function L(T, aV) {
		if (!T) {
			return
		}
		this._position = T;
		this.guid = "spot" + (L.guid++);
		aV = aV || {};
		this._text = aV.text || "";
		this._offsets = aV.offsets ? aV.offsets.slice(0) : [5, 5, 5, 5];
		this._userData = aV.userData || null;
		this._minZoom = aV.minZoom || null;
		this._maxZoom = aV.maxZoom || null
	}
	L.guid = 0;
	aK.extend(L.prototype, {
		initialize : function(T) {
			if (this._minZoom == null) {
				this._minZoom = T.config.minZoom
			}
			if (this._maxZoom == null) {
				this._maxZoom = T.config.maxZoom
			}
		},
		setPosition : function(T) {
			if ( T instanceof f) {
				this._position = T
			}
		},
		getPosition : function() {
			return this._position
		},
		setText : function(T) {
			this._text = T
		},
		getText : function() {
			return this._text
		},
		setUserData : function(T) {
			this._userData = T
		},
		getUserData : function() {
			return this._userData
		}
	});
	function O() {
		this._map = null;
		this._container
		this._type = "control";
		this._visible = true
	}
	aK.lang.inherits(O, aK.lang.Class, "Control");
	aK.extend(O.prototype, {
		initialize : function(T) {
			this._map = T;
			if (this._container) {
				T.container.appendChild(this._container);
				return this._container
			}
			return
		},
		_i : function(T) {
			if (!this._container && this.initialize && ax(this.initialize)) {
				this._container = this.initialize(T)
			}
			this._opts = this._opts || {
				printable : false
			};
			this._setStyle();
			this._setPosition();
			if (this._container) {
				this._container._jsobj = this
			}
		},
		_setStyle : function() {
			var aV = this._container;
			if (aV) {
				var T = aV.style;
				T.position = "absolute";
				T.zIndex = this._container.style.zIndex || "10";
				T.MozUserSelect = "none";
				T.WebkitTextSizeAdjust = "none";
				if (!this._opts.printable) {
					aK.dom.addClass(aV, "BMap_noprint")
				}
			}
		},
		remove : function() {
			this._map = null;
			if (!this._container) {
				return
			}
			this._container.parentNode && this._container.parentNode.removeChild(this._container);
			this._container._jsobj = null;
			this._container = null
		},
		_render : function() {
			this._container = Y(this._map.container, "<div unselectable='on'></div>");
			if (this._visible == false) {
				aK.dom.hide(this._container)
			}
			return this._container
		},
		_setPosition : function() {
			this.setAnchor(this._opts.anchor)
		},
		setAnchor : function(aX) {
			if (this.anchorFixed || !K(aX) || isNaN(aX) || aX < BMAP_ANCHOR_TOP_LEFT || aX > BMAP_ANCHOR_BOTTOM_RIGHT) {
				aX = this.defaultAnchor
			}
			this._opts = this._opts || {
				printable : false
			};
			this._opts.offset = this._opts.offset || this.defaultOffset;
			var aW = this._opts.anchor;
			this._opts.anchor = aX;
			if (!this._container) {
				return
			}
			var aZ = this._container;
			var T = this._opts.offset.width;
			var aY = this._opts.offset.height;
			if (this instanceof R) {
				if (this._map && this._map.highResolutionEnabled()) {
					aZ.childNodes[1].style.height = "2px";
					aZ.childNodes[2].style.height = "4px";
					aZ.childNodes[3].style.height = "4px";
					aZ.style.height = "19px"
				}
			}
			aZ.firstChild.style.cssText = "font-size:11px;line-height:18px;";
			aZ.style.left = aZ.style.top = aZ.style.right = aZ.style.bottom = "auto";
			switch(aX) {
				case BMAP_ANCHOR_TOP_LEFT:
					aZ.style.top = aY + "px";
					aZ.style.left = T + "px";
					break;
				case BMAP_ANCHOR_TOP_RIGHT:
					aZ.style.top = aY + "px";
					aZ.style.right = T + "px";
					break;
				case BMAP_ANCHOR_BOTTOM_LEFT:
					aZ.style.bottom = aY + "px";
					aZ.style.left = T + "px";
					break;
				case BMAP_ANCHOR_BOTTOM_RIGHT:
					aZ.style.bottom = aY + "px";
					aZ.style.right = T + "px";
					break;
				default:
					break
			}
			var aV = ["TL", "TR", "BL", "BR"];
			aK.dom.removeClass(this._container, "anchor" + aV[aW]);
			aK.dom.addClass(this._container, "anchor" + aV[aX])
		},
		getAnchor : function() {
			return this._opts.anchor
		},
		setOffset : function(T) {
			if (!( T instanceof X)) {
				return
			}
			this._opts = this._opts || {
				printable : false
			};
			this._opts.offset = new X(T.width, T.height);
			if (!this._container) {
				return
			}
			this.setAnchor(this._opts.anchor)
		},
		getOffset : function() {
			return this._opts.offset
		},
		getDom : function() {
			return this._container
		},
		show : function() {
			this._visible = true;
			if (this._container) {
				aK.dom.show(this._container)
			}
		},
		hide : function() {
			this._visible = false;
			if (this._container) {
				aK.dom.hide(this._container)
			}
		},
		isPrintable : function() {
			return !!this._opts.printable
		},
		isVisible : function() {
			if (!this._container && !this._map) {
				return false
			}
			return !!this._visible
		}
	});
	window.BMAP_ANCHOR_TOP_LEFT = 0;
	window.BMAP_ANCHOR_TOP_RIGHT = 1;
	window.BMAP_ANCHOR_BOTTOM_LEFT = 2;
	window.BMAP_ANCHOR_BOTTOM_RIGHT = 3;
	function R(T) {
		O.call(this);
		T = T || {};
		this._opts = {
			printable : false
		};
		this._opts = aK.object.extend(aK.object.extend(this._opts, {
			color : "black",
			unit : "metric"
		}), T);
		this.defaultAnchor = BMAP_ANCHOR_BOTTOM_LEFT;
		this.defaultOffset = new X(81, 18);
		this.setAnchor(T.anchor);
		this._units = {
			metric : {
				name : "metric",
				conv : 1,
				incon : 1000,
				u1 : "米",
				u2 : "公里"
			}
		};
		if (!this._units[this._opts.unit]) {
			this._opts.unit = "metric"
		}
		this._scaleText = null;
		this._numberArray = {};
		this._asyncLoadCode()
	}
	window.BMAP_UNIT_METRIC = "metric";
	aK.lang.inherits(R, O, "ScaleControl");
	aK.object.extend(R.prototype, {
		initialize : function(T) {
			this._map = T;
			return this._container
		},
		setColor : function(T) {
			this._opts.color = T + ""
		},
		getColor : function() {
			return this._opts.color
		},
		_asyncLoadCode : function() {
			var T = this;
			ar.load("control", function() {
				T._asyncDraw()
			})
		}
	});
	function u(T, aV) {
		if (T && !aV) {
			aV = T
		}
		this._sw = this._ne = null;
		this._swLng = this._swLat = null;
		this._neLng = this._neLat = null;
		if (T) {
			this._sw = new f(T.lng, T.lat);
			this._ne = new f(aV.lng, aV.lat);
			this._swLng = T.lng;
			this._swLat = T.lat;
			this._neLng = aV.lng;
			this._neLat = aV.lat
		}
	}
	aK.object.extend(u.prototype, {
		isEmpty : function() {
			return !this._sw || !this._ne
		},
		equals : function(T) {
			if (!( T instanceof u) || this.isEmpty()) {
				return false
			}
			return this.getSouthWest().equals(T.getSouthWest()) && this.getNorthEast().equals(T.getNorthEast())
		},
		getSouthWest : function() {
			return this._sw
		},
		getNorthEast : function() {
			return this._ne
		},
		getCenter : function() {
			if (this.isEmpty()) {
				return null
			}
			return new f((this._swLng + this._neLng) / 2, (this._swLat + this._neLat) / 2)
		},
		extend : function(T) {
			if (!( T instanceof f)) {
				return
			}
			var aV = T.lng, aW = T.lat;
			if (!this._sw) {
				this._sw = new f(0, 0)
			}
			if (!this._ne) {
				this._ne = new f(0, 0)
			}
			if (!this._swLng || this._swLng > aV) {
				this._sw.lng = this._swLng = aV
			}
			if (!this._neLng || this._neLng < aV) {
				this._ne.lng = this._neLng = aV
			}
			if (!this._swLat || this._swLat > aW) {
				this._sw.lat = this._swLat = aW
			}
			if (!this._neLat || this._neLat < aW) {
				this._ne.lat = this._neLat = aW
			}
		},
		toSpan : function() {
			if (this.isEmpty()) {
				return new f(0, 0)
			}
			return new f(Math.abs(this._neLng - this._swLng), Math.abs(this._neLat - this._swLat))
		}
	});
	function f(T, aV) {
		this.lng = parseFloat(T);
		this.lat = parseFloat(aV)
	}
	f.prototype.equals = function(T) {
		return T && this.lat == T.lat && this.lng == T.lng
	};
	function aA(T) {
		this._mapType = T
	}
	aK.extend(aA.prototype, {
		pointToPixel : function(aV, aZ, aY, aX) {
			if (!aV) {
				return
			}
			var aW = this._mapType.getZoomUnits(aZ);
			var T = Math.round((aV.lng - aY.lng) / aW + aX.width / 2);
			var a0 = Math.round((aY.lat - aV.lat) / aW + aX.height / 2);
			return new aP(T, a0)
		},
		pixelToPoint : function(aX, a0, aZ, aY) {
			if (!aX) {
				return
			}
			var aV = this._mapType.getZoomUnits(a0);
			var aW = aZ.lng + aV * (aX.x - aY.width / 2);
			var a1 = aZ.lat - aV * (aX.y - aY.height / 2);
			var T = new f(aW, a1);
			return T
		}
	});
	function N() {
		this._type = "overlay"
	}
	aK.lang.inherits(N, aK.lang.Class, "Overlay");
	N.getZIndex = function(T) {
		T = T * 1;
		if (!T) {
			return 0
		}
		return (T * -100000) << 1
	};
	aK.extend(N.prototype, {
		_i : function(T) {
			if (!this.domElement && ax(this.initialize)) {
				this.domElement = this.initialize(T);
				if (this.domElement) {
					this.domElement.style.WebkitUserSelect = "none"
				}
			}
			this.draw()
		},
		initialize : function(T) {
			throw "initialize方法未实现"
		},
		draw : function() {
			throw "draw方法未实现"
		},
		remove : function() {
			if (this.domElement && this.domElement.parentNode) {
				this.domElement.parentNode.removeChild(this.domElement)
			}
			this.domElement = null;
			this.dispatchEvent(new ay("onremove"))
		},
		hide : function() {
			if (this.domElement) {
				aK.dom.hide(this.domElement)
			}
		},
		show : function() {
			if (this.domElement) {
				aK.dom.show(this.domElement)
			}
		},
		isVisible : function() {
			if (!this.domElement) {
				return false
			}
			if (this.domElement.style.display == "none" || this.domElement.style.visibility == "hidden") {
				return false
			}
			return true
		}
	});
	BMap.register(function(aW) {
		var T = aW.temp;
		T.overlayDiv = aW.overlayDiv = aV(aW.platform, 200);
		aW._panes.floatPane = aV(T.overlayDiv, 800);
		aW._panes.markerMouseTarget = aV(T.overlayDiv, 700);
		aW._panes.floatShadow = aV(T.overlayDiv, 600);
		aW._panes.labelPane = aV(T.overlayDiv, 500);
		aW._panes.markerPane = aV(T.overlayDiv, 400);
		aW._panes.markerShadow = aV(T.overlayDiv, 300);
		aW._panes.mapPane = aV(T.overlayDiv, 200);
		function aV(aX, a0) {
			var aZ = r("div"), aY = aZ.style;
			aY.position = "absolute";
			aY.top = aY.left = aY.width = aY.height = "0";
			aY.zIndex = a0;
			aX.appendChild(aZ);
			return aZ
		}

	});
	function aG() {
		aK.lang.Class.call(this);
		N.call(this);
		this.map = null;
		this._visible = true;
		this._dblclickTime = 0
	}
	aK.lang.inherits(aG, N, "OverlayInternal");
	aK.extend(aG.prototype, {
		initialize : function(T) {
			this.map = T;
			aK.lang.Class.call(this, this.guid);
			return null
		},
		getMap : function() {
			return this.map
		},
		draw : function() {
		},
		remove : function() {
			this.map = null;
			aK.lang.decontrol(this.guid);
			N.prototype.remove.call(this)
		},
		hide : function() {
			if (this._visible == false) {
				return
			}
			this._visible = false
		},
		show : function() {
			if (this._visible == true) {
				return
			}
			this._visible = true
		},
		isVisible : function() {
			if (!this.domElement) {
				return false
			}
			return !!this._visible
		},
		getContainer : function() {
			return this.domElement
		},
		setConfig : function(aV) {
			aV = aV || {};
			for (var T in aV) {
				this._config[T] = aV[T]
			}
		},
		setZIndex : function(T) {
			this.zIndex = T
		},
		enableMassClear : function() {
			this._config.enableMassClear = true
		},
		disableMassClear : function() {
			this._config.enableMassClear = false
		}
	});
	function at() {
		this.map = null;
		this._overlays = {};
		this._customOverlays = []
	}
	BMap.register(function(aV) {
		var T = new at();
		T.map = aV;
		aV._overlays = T._overlays;
		aV._customOverlays = T._customOverlays;
		aV.addEventListener("moveend", function(aW) {
			if (aW._eventSrc != "centerAndZoom") {
				T.draw(aW)
			}
		});
		aV.addEventListener("zoomend", function(aW) {
			if (aW._eventSrc != "centerAndZoom") {
				T.draw(aW)
			}
		});
		aV.addEventListener("centerandzoom", function(aW) {
			T.draw(aW)
		});
		aV.addEventListener("resize", function(aW) {
			T.draw(aW)
		});
		aV.addEventListener("addoverlay", function(a0) {
			var aX = a0.target;
			if ( aX instanceof aG) {
				if (!T._overlays[aX.guid]) {
					T._overlays[aX.guid] = aX
				}
			} else {
				var aZ = false;
				for (var aY = 0, aW = T._customOverlays.length; aY < aW; aY++) {
					if (T._customOverlays[aY] === aX) {
						aZ = true;
						break
					}
				}
				if (!aZ) {
					T._customOverlays.push(aX)
				}
			}
		});
		aV.addEventListener("removeoverlay", function(aZ) {
			var aX = aZ.target;
			if ( aX instanceof aG) {
				delete T._overlays[aX.guid]
			} else {
				for (var aY = 0, aW = T._customOverlays.length; aY < aW; aY++) {
					if (T._customOverlays[aY] === aX) {
						T._customOverlays.splice(aY, 1);
						break
					}
				}
			}
		});
		aV.addEventListener("clearoverlays", function(aZ) {
			for (var aY in T._overlays) {
				if (T._overlays[aY]._config.enableMassClear) {
					T._overlays[aY].remove();
					delete T._overlays[aY]
				}
			}
			for (var aX = 0, aW = T._customOverlays.length; aX < aW; aX++) {
				if (T._customOverlays[aX].enableMassClear != false) {
					T._customOverlays[aX].remove();
					T._customOverlays[aX] = null;
					T._customOverlays.splice(aX, 1);
					aX--;
					aW--
				}
			}
		})
	});
	at.prototype.draw = function(aW) {
		if (BMap.DrawerSelector) {
			var T = BMap.DrawerSelector.getDrawer(this.map);
			T.setPalette()
		}
		for (var aV in this._overlays) {
			this._overlays[aV].draw()
		}
		aK.array.each(this._customOverlays, function(aX) {
			aX.draw()
		})
	};
	function av(T) {
		aG.call(this);
		this._config = {
			strokeColor : "#3a6bdb",
			strokeWeight : 5,
			strokeOpacity : 0.65,
			strokeStyle : "solid",
			enableMassClear : true,
			getParseTolerance : null,
			getParseCacheIndex : null,
			enableParse : true,
			clickable : true
		};
		T = T || {};
		this.setConfig(T);
		if (this._config.strokeWeight <= 0) {
			this._config.strokeWeight = 5
		}
		if (this._config.strokeOpacity < 0 || this._config.strokeOpacity > 1) {
			this._config.strokeOpacity = 0.65
		}
		if (this._config.strokeStyle != "solid" && this._config.strokeStyle != "dashed") {
			this._config.strokeStyle = "solid"
		}
		if (ah(T.enableClicking)) {
			this._config.clickable = T.enableClicking
		}
		this.domElement = null;
		this._bounds = new BMap.Bounds(0, 0, 0, 0);
		this._parseCache = [];
		this._temp = {}
	}
	aK.lang.inherits(av, aG, "Graph");
	av.getGraphPoints = function(aV) {
		var T = [];
		if (!aV) {
			return T
		}
		if (aI(aV)) {
			var aW = aV.split(";");
			aK.array.each(aW, function(aY) {
				var aX = aY.split(",");
				T.push(new f(aX[0], aX[1]))
			})
		}
		if (aV.constructor == Array && aV.length > 0) {
			T = aV
		}
		return T
	};
	av.parseTolerance = [20000, 2000, 200, 20];
	aK.extend(av.prototype, {
		initialize : function(T) {
			this.map = T;
			return null
		},
		draw : function() {
		},
		setPath : function(T) {
			this._parseCache.length = 0;
			this.points = av.getGraphPoints(T).slice(0);
			this._calcBounds()
		},
		_calcBounds : function() {
			if (!this.points) {
				return
			}
			var T = this;
			T._bounds = new u();
			aK.array.each(this.points, function(aV) {
				T._bounds.extend(aV)
			})
		},
		getPath : function() {
			return this.points
		},
		setPositionAt : function(aV, T) {
			if (!T || !this.points[aV]) {
				return
			}
			this._parseCache.length = 0;
			this.points[aV] = new f(T.lng, T.lat);
			this._calcBounds()
		},
		setStrokeColor : function(T) {
			this._config.strokeColor = T
		},
		getStrokeColor : function() {
			return this._config.strokeColor
		},
		setStrokeWeight : function(T) {
			if (T > 0) {
				this._config.strokeWeight = T
			}
		},
		getStrokeWeight : function() {
			return this._config.strokeWeight
		},
		setStrokeOpacity : function(T) {
			if (!T || T > 1 || T < 0) {
				return
			}
			this._config.strokeOpacity = T
		},
		getStrokeOpacity : function() {
			return this._config.strokeOpacity
		},
		setStrokeStyle : function(T) {
			if (T != "solid" && T != "dashed") {
				return
			}
			this._config.strokeStyle = T
		},
		getStrokeStyle : function() {
			return this._config.strokeStyle
		},
		setFillColor : function(T) {
			this._config.fillColor = T || ""
		},
		getBounds : function() {
			return this._bounds
		},
		remove : function() {
			aG.prototype.remove.call(this);
			this._parseCache.length = 0
		}
	});
	function t(aV, aW, aX) {
		if (!aV || !aW) {
			return
		}
		this.imageUrl = aV;
		this.size = aW;
		var T = new X(Math.floor(aW.width / 2), Math.floor(aW.height / 2));
		var aY = {
			anchor : T,
			imageOffset : new X(0, 0)
		};
		aX = aX || {};
		aK.extend(aY, aX);
		this.anchor = aY.anchor;
		this.imageOffset = aY.imageOffset;
		this.printImageUrl = aX.printImageUrl || ""
	}

	var P = t.prototype;
	P.setImageUrl = function(T) {
		if (!T) {
			return
		}
		this.imageUrl = T
	};
	P.setPrintImageUrl = function(T) {
		if (!T) {
			return
		}
		this.printImageUrl = T
	};
	P.setSize = function(T) {
		if (!T) {
			return
		}
		this.size = new X(T.width, T.height)
	};
	P.setAnchor = function(T) {
		if (!T) {
			return
		}
		this.anchor = new X(T.width, T.height)
	};
	P.setImageOffset = function(T) {
		if (!T) {
			return
		}
		this.imageOffset = new X(T.width, T.height)
	};
	P.toString = function() {
		return "Icon"
	};
	var ai = aT.imgPath + "red_marker.png";
	var aH = new t(ai, new X(19, 25), {
		anchor : new X(10, 25)
	});
	var G = new t(ai, new X(20, 11), {
		anchor : new X(6, 11),
		imageOffset : new X(-19, -13)
	});
	function E(T, aW) {
		aG.call(this);
		aW = aW || {};
		this.point = T;
		this.map = null;
		this._config = {
			offset : new X(0, 0),
			icon : aH,
			shadow : G,
			title : "",
			baseZIndex : 0,
			clickable : true,
			zIndexFixed : false,
			isTop : false,
			enableMassClear : true
		};
		this.setConfig(aW);
		if (aW.icon && !aW.shadow) {
			this._config.shadow = null
		}
		if (ah(aW.enableClicking)) {
			this._config.clickable = aW.enableClicking
		}
		var aV = this;
		ar.load("marker", function() {
			aV._draw()
		})
	}
	E.TOP_ZINDEX = N.getZIndex(-90) + 1000000;
	aK.lang.inherits(E, aG, "Marker");
	aK.extend(E.prototype, {
		setIcon : function(T) {
			if ( T instanceof t) {
				this._config.icon = T
			}
		},
		getIcon : function() {
			return this._config.icon
		},
		setShadow : function(T) {
			if ( T instanceof t) {
				this._config.shadow = T
			}
		},
		getShadow : function() {
			return this._config.shadow
		},
		getPosition : function() {
			return this.point
		},
		setPosition : function(T) {
			if ( T instanceof f) {
				this.point = new f(T.lng, T.lat)
			}
		},
		setTop : function(aV, T) {
			this._config.isTop = !!aV;
			if (aV) {
				this._addi = T || 0
			}
		},
		setTitle : function(T) {
			this._config.title = T + ""
		},
		getTitle : function() {
			return this._config.title
		},
		setOffset : function(T) {
			if ( T instanceof X) {
				this._config.offset = T
			}
		},
		getOffset : function() {
			return this._config.offset
		}
	});
	function ak(T, aW) {
		av.call(this, aW);
		this.setPath(T);
		var aV = this;
		ar.load("poly", function() {
			aV._draw()
		})
	}
	aK.lang.inherits(ak, av, "Polyline");
	function aF(T) {
		this.map = T;
		this.mapTypeLayers = [];
		this.tileLayers = [];
		this.bufferNumber = 30;
		this.realBufferNumber = 0;
		this.mapTiles = {};
		this.bufferTiles = {};
		this.numLoading = 0;
		this.isFirstTile = true;
		this.arrStatTraffic = [];
		this.isZooming = false;
		this.isVectorLoaded = false;
		this._mapTypeLayerContainer = this._createDiv(-1);
		this._vectorLayerContainer = this._createDiv(2);
		this._normalLayerContainer = this._createDiv(3);
		T.platform.appendChild(this._mapTypeLayerContainer);
		T.platform.appendChild(this._vectorLayerContainer);
		T.platform.appendChild(this._normalLayerContainer)
	}
	BMap.register(function(aV) {
		var T = new aF(aV);
		T.initialize();
		aV.tileMgr = T
	});
	aK.extend(aF.prototype, {
		initialize : function() {
			var T = this, aV = T.map;
			aV.addEventListener("loadcode", function() {
				T.loadTiles()
			});
			aV.addEventListener("addtilelayer", function(aW) {
				T.addTileLayer(aW)
			});
			aV.addEventListener("removetilelayer", function(aW) {
				T.removeTileLayer(aW)
			});
			aV.addEventListener("zoomstartcode", function(aW) {
				T._zoom()
			});
			aV.addEventListener("dblclick", function(aW) {
				T.dblClick(aW)
			});
			aV.addEventListener("moving", function(aW) {
				T.moveGridTiles()
			});
			aV.addEventListener("resize", function(aW) {
				T.moveGridTiles()
			});
			aV.addEventListener("zoomend", function(aW) {
				T.setRasterTrafficStatus(aW)
			});
			aV.addEventListener("vectorloaded", function(aW) {
				T.isVectorLoaded = true
			});
			T.addMapClickEvent()
		},
		loadTiles : function() {
			var aX = this;
			aX.lastZoom = aX.map.getZoom();
			if (!aX.loaded) {
				aX.initMapTypeTiles()
			}
			aX.moveGridTiles();
			if (!aX.loaded) {
				aX.loaded = true;
				if (aX.map.vectorMapEnabled()) {
					var aY = "vector", aW = window.asyncMdlVer[aY], T = "async_" + aY + "_" + aW, aV = window.getVersion(T);
					if (aW && aV) {
						ar.run(aY, aV);
						aX.initVectorDrawLib()
					} else {
						ar.load("vector", function() {
							aX.initVectorDrawLib()
						}, true)
					}
				}
			}
		},
		initVectorDrawLib : function() {
			this.vectorDrawLib = new BMap.VectorDrawLib(this)
		},
		initMapTypeTiles : function() {
			var aV = this.map.getMapType();
			var aW = aV.getTileLayers();
			for (var T = 0; T < aW.length; T++) {
				var aX = new C();
				aK.extend(aX, aW[T]);
				this.mapTypeLayers.push(aX);
				aX.initialize(this.map, this._mapTypeLayerContainer)
			}
		},
		_createDiv : function(aV) {
			var T = r("div");
			T.style.position = "absolute";
			T.style.left = T.style.top = "0";
			T.style.zIndex = aV;
			return T
		},
		_checkTilesLoaded : function() {
			this.numLoading--;
			var T = this;
			if (this.isFirstTile) {
				this.map.dispatchEvent(new ay("onfirsttileloaded"));
				this.isFirstTile = false
			}
			if (this.numLoading == 0) {
				if (this._checkLoadedTimer) {
					clearTimeout(this._checkLoadedTimer);
					this._checkLoadedTimer = null
				}
				this._checkLoadedTimer = setTimeout(function() {
					if (T.numLoading == 0) {
						T.map.dispatchEvent(new ay("ontilesloaded"));
						T.isFirstTile = true
					}
					T._checkLoadedTimer = null
				}, 80)
			}
		},
		getTileName : function(T, aV) {
			return "TILE-" + aV.guid + "-" + T[0] + "-" + T[1] + "-" + T[2]
		},
		hideTile : function(aV) {
			var T = aV.img;
			if (T) {
				if (q(T)) {
					T.parentNode.removeChild(T)
				}
			}
			delete this.mapTiles[aV.name];
			if (!aV.loaded) {
				T = null;
				aV._callCbks();
				aV.img = null;
				aV.mgr = null
			}
		},
		moveGridTiles : function() {
			this.arrStatTraffic.length = [];
			var bl = this.mapTypeLayers, a4 = bl.concat(this.tileLayers), a9 = a4.length;
			var be = 1;
			for (var bd = 0; bd < a9; bd++) {
				var aX = a4[bd];
				if (aX.forceHighResolution === true) {
					be = 2
				}
				if (aX.baseLayer) {
					this.tilesDiv = aX.tilesDiv;
					var ba = this.tilesDiv;
					if (this.map.getZoom() >= this.map.config.vectorMapLevel) {
						ba.style.display = "none";
						continue
					} else {
						ba.style.display = "block"
					}
				}
				if (aX._isVectorLayer) {
					continue
				}
				var bq = this.map, bm = bq.getMapType(), br = bm.getProjection(), bc = bq.getZoom() + (be == 2 ? 1 : 0), bg = bq.mercatorCenter;
				var a2 = bm.getZoomUnits(bc) * be, a5 = bm.getZoomFactor(bc), a3 = Math.ceil(bg.lng / a5), aY = Math.ceil(bg.lat / a5), a8 = bm.getTileSize() / be, aW = [a3, aY, (bg.lng - a3 * a5) / a5 * a8, (bg.lat - aY * a5) / a5 * a8], bk = aW[0] - Math.ceil((bq.width / 2 - aW[2]) / a8), aV = aW[1] - Math.ceil((bq.height / 2 - aW[3]) / a8), bh = aW[0] + Math.ceil((bq.width / 2 + aW[2]) / a8), a6 = aW[1] + Math.ceil((bq.height / 2 + aW[3]) / a8);
				var T = this.mapTiles, a1 = -bg.lng / a2, a0 = bg.lat / a2, bo = [Math.round(a1), Math.round(a0)];
				for (var bp in T) {
					var bs = T[bp], bn = bs.info;
					if (bn[2] != bc || (bn[2] == bc && (bk > bn[0] || bh <= bn[0] || aV > bn[1] || a6 <= bn[1]))) {
						if (be == 2) {
							if (bs._svc == 2) {
								this.hideTile(bs)
							}
						} else {
							this.hideTile(bs)
						}
					}
				}
				var aZ = -bq.offsetX + bq.width / 2, a7 = -bq.offsetY + bq.height / 2;
				aX.tilesDiv.style.left = aZ + "px";
				aX.tilesDiv.style.top = a7 + "px";
				if (this.tilesOrder) {
					this.tilesOrder.length = 0
				} else {
					this.tilesOrder = []
				}
				if (bq._viewTiles) {
					bq._viewTiles.length = 0
				} else {
					bq._viewTiles = []
				}
				for (var bj = bk; bj < bh; bj++) {
					for (var bi = aV; bi < a6; bi++) {
						this.tilesOrder.push([bj, bi]);
						bq._viewTiles.push({
							x : bj,
							y : bi
						})
					}
				}
				this.tilesOrder.sort((function(bt) {
					return function(bu, bv) {
						return ((0.4 * Math.abs(bu[0] - bt[0]) + 0.6 * Math.abs(bu[1] - bt[1])) - (0.4 * Math.abs(bv[0] - bt[0]) + 0.6 * Math.abs(bv[1] - bt[1])))
					}
				})([aW[0] - 1, aW[1] - 1]));
				if (!this.map.enableLoadTiles) {
					return
				}
				var bb = aX.baseLayer ? true : false;
				if (bb) {
					this.map.dispatchEvent(new ay("ontilesbegin"));
					this.numLoading += this.tilesOrder.length
				}
				if ( aX instanceof aj) {
					this.map.dispatchEvent(new ay("onTrafficbegin"))
				}
				for (var bj = 0, bf = this.tilesOrder.length; bj < bf; bj++) {
					this.showTile([this.tilesOrder[bj][0], this.tilesOrder[bj][1], bc], bo, aX, be)
				}
			}
		},
		showTile : function(aZ, aY, a2, a6) {
			var a7 = this, a4 = a2.baseLayer ? true : false;
			var a1 = this.map.getMapType(), aW = a7.getTileName(aZ, a2), a8 = a1.getTileSize() / a6, aX = (aZ[0] * a8) + aY[0], aV = (-1 - aZ[1]) * a8 + aY[1], a3 = [aX, aV], a5 = this.mapTiles[aW];
			if (a5 && a5.img) {
				aU(a5.img, a3);
				if (a4) {
					if (a5.loaded) {
						this._checkTilesLoaded()
					} else {
						a5._addLoadCbk(function() {
							a7._checkTilesLoaded()
						})
					}
				}
				return
			}
			a5 = this.bufferTiles[aW];
			if (a5 && a5.img) {
				a2.tilesDiv.insertBefore(a5.img, a2.tilesDiv.lastChild);
				this.mapTiles[aW] = a5;
				aU(a5.img, a3);
				if (a4) {
					if (a5.loaded) {
						this._checkTilesLoaded()
					} else {
						a5._addLoadCbk(function() {
							a7._checkTilesLoaded()
						})
					}
				}
				return
			}
			var a0 = new aP(aZ[0], aZ[1]), T = a2.getTilesUrl(a0, aZ[2]);
			a5 = new az(this, T, a3, aZ, a2, a6);
			if (a4) {
				a5._addLoadCbk(function() {
					a7._checkTilesLoaded()
				})
			}
			a5._load();
			a5._svc = a6;
			this.mapTiles[aW] = a5
		},
		addTileLayer : function(aY) {
			var aX = this;
			var aV = aY.target;
			for (var aW = 0; aW < aX.tileLayers.length; aW++) {
				if (aX.tileLayers[aW] == aV) {
					return
				}
			}
			aX.tileLayers.push(aV);
			var T = aV._isVectorLayer ? this._vectorLayerContainer : this._normalLayerContainer;
			aV.initialize(this.map, T);
			if (aX.map.loaded) {
				aX.moveGridTiles()
			}
		},
		removeTileLayer : function(aZ) {
			var a0 = this, aX = aZ.target, aV = a0.mapTiles, a2 = a0.bufferTiles;
			for (var T in a2) {
				var a1 = T.split("-")[1];
				if (a1 == aX.guid) {
					delete a2[T]
				}
			}
			for (var T in aV) {
				var a1 = T.split("-")[1];
				if (a1 == aX.guid) {
					delete aV[T]
				}
			}
			for (var aY = 0, aW = a0.tileLayers.length; aY < aW; aY++) {
				if (aX == a0.tileLayers[aY]) {
					a0.tileLayers.splice(aY, 1)
				}
			}
			aX.remove();
			a0.moveGridTiles()
		},
		_zoom : function(aV, aY) {
			var a3 = this, aX = g();
			if ((aK.platform.isAndroid && !aX) || (a3.map.vectorMapEnabled() && a3.isVectorLoaded === false)) {
				a3.moveGridTiles();
				a3.map.dispatchEvent(new ay("onzoomend"));
				return
			}
			var T = a3.map, a8 = T.getZoom();
			if (a8 == a3.lastZoom) {
				return
			}
			var a6 = a8 > a3.lastZoom ? true : false;
			a3.lastZoom = a8;
			if (a3.isZooming === true) {
				return
			}
			a3.isZooming = true;
			var a4 = T.platform.style, a1 = T.offsetX, a0 = T.offsetY, aZ = T.width, a2 = T.height, a7 = aV ? (aV.x - a1) : (aZ / 2 - a1), a5 = aV ? (aV.y - a0) : (a2 / 2 - a0);
			a4.WebkitTransformOrigin = a7 + "px " + a5 + "px";
			aY = aY || new X(0, 0);
			var aW = new aL({
				duration : 300,
				transition : h.easeInOutQuad,
				fps : 40,
				render : function(a9) {
					var ba = a6 ? 1 + a9 : 1 - a9 / 2;
					a4.WebkitTransformOrigin = a7 + "px " + a5 + "px";
					a4.WebkitTransform = "translate3d(" + (-aY.width) * a9 + "px, " + (-aY.height) * a9 + "px,0px) scale(" + ba + ")"
				},
				finish : function() {
					a3.moveGridTiles();
					a3.map.dispatchEvent(new ay("onzoomend"));
					a4.WebkitTransform = "";
					a3.isZooming = false
				}
			})
		},
		dblClick : function(aZ) {
			var aV = this.map;
			if (!aV.config.enableDblclickZoom) {
				return
			}
			var a0 = aZ.pixel, aW = a0, aX = new X(0, 0), T = aV.zoomLevel + 1, aY = aV._getProperZoom(T);
			if (!aY.exceeded) {
				aV.dispatchEvent(new ay("onzoomstart"));
				aV.lastLevel = aV.zoomLevel;
				aV.zoomLevel = aY.zoom;
				var a1 = aV.mercatorCenter;
				aV.mercatorCenter = this._getMercatorCenter(a0);
				aV.centerPoint = aV.mercatorCenter;
				aX.width = a0.x - Math.round(aV.width / 2);
				aX.height = a0.y - Math.round(aV.height / 2);
				this._zoom(aW, aX);
				if (!a1.equals(aV.mercatorCenter)) {
					var a2 = new ay("onmoveend");
					a2._eventSrc = "centerAndZoom";
					aV.dispatchEvent(a2)
				}
			} else {
				var a3 = aV.pixelToPoint(a0);
				aV.panTo(a3)
			}
		},
		_getMercatorCenter : function(aW) {
			var aZ = this.map;
			var aX = aZ.mercatorCenter;
			var T = aZ.getMapType().getZoomUnits(aZ.lastLevel);
			var aV = aX.lng + T * (aW.x - aZ.width / 2);
			var aY = aX.lat - T * (aW.y - aZ.height / 2);
			return new f(aV, aY)
		},
		addMapClickEvent : function() {
			var aW = this, T = 200, aX = null, aV = 0;
			aW.map.addEventListener("click", function(aY) {
				aV++;
				if (aV == 1) {
					aX = setTimeout(function() {
						aV = 0;
						var aZ = null, a1 = aW.tileLayers;
						for (var a0 in a1) {
							if (a1[a0] instanceof al) {
								aZ = a1[a0];
								break
							}
						}
						if (aZ && aZ.vectorClick(aY)) {
							return
						}
						if (aW.vectorDrawLib) {
							aW.vectorDrawLib.vectorClick(aY)
						}
					}, T)
				} else {
					clearTimeout(aX);
					aV = 0;
					return false
				}
			})
		},
		setRasterTrafficStatus : function(aX) {
			var aV = this, aW = aV.map, T = aW.getZoom();
			if (!aV.rasterTrafficLayer) {
				aV.rasterTrafficLayer = new aj()
			}
			if (aW.config.trafficStatus && T < aW.config.vectorMapLevel) {
				aW.addTileLayer(aV.rasterTrafficLayer)
			} else {
				aW.removeTileLayer(aV.rasterTrafficLayer)
			}
		},
		setVectorTrafficStatus : function(T) {
			if (this.vectorDrawLib) {
				this.vectorDrawLib.reDrawVectorMap()
			}
		}
	});
	function az(a2, T, aY, aV, aX, aZ) {
		this.mgr = a2;
		this.position = aY;
		this._cbks = [];
		this.name = a2.getTileName(aV, aX);
		this.info = aV;
		this.level = parseInt(aV[2], 10);
		var a3 = r("img");
		n(a3);
		a3.galleryImg = false;
		var a1 = a3.style;
		var aW = a2.map.getMapType(), a4 = aW.getTileSize() / aZ;
		a1.position = "absolute";
		if (g()) {
			a1.WebkitTransform = "translate3d(0px,0px,0)"
		}
		a1.width = a4 + "px";
		a1.height = a4 + "px";
		a1.left = aY[0] + "px";
		a1.top = aY[1] + "px";
		this.img = a3;
		this.src = T;
		var a0 = this;
		this.img.onload = function(bc) {
			a0.loaded = true;
			if (!a0.mgr) {
				return
			}
			var a9 = a0.mgr;
			var bd = a9.bufferTiles;
			if (!bd[a0.name]) {
				a9.realBufferNumber++;
				bd[a0.name] = a0
			}
			if (a0.img && !q(a0.img)) {
				if (aX.tilesDiv) {
					aX.tilesDiv.appendChild(a0.img)
				}
			}
			var be = a9.realBufferNumber - a9.bufferNumber;
			for (var a6 in bd) {
				if (be <= 0) {
					break
				}
				if (!a9.mapTiles[a6]) {
					bd[a6].mgr = null;
					var bb = bd[a6].img;
					if (bb && bb.parentNode) {
						bb.parentNode.removeChild(bb)
					}
					bb = null;
					bd[a6].img = null;
					delete bd[a6];
					a9.realBufferNumber--;
					be--
				}
			}
			a0._callCbks();
			var a5 = this.src, a7 = a2.arrStatTraffic;
			if (a5.indexOf("TrafficTileService") > -1) {
				for (var ba = 0, a8 = a7.length; ba < a8; ba++) {
					if (a5.indexOf(a7[ba]) > -1) {
						a7.splice(ba, 1);
						break
					}
				}
				if (a7.length <= 0) {
					a2.map.dispatchEvent(new ay("onTrafficloaded"))
				}
			}
		};
		this.isHighResolution = a2.map.highResolutionEnabled();
		this.img.onerror = function() {
			var a6 = a0.img, a8 = a6 ? a6.getAttribute("errorCount") : true;
			if (a6 && (!a8 || a8 && a8 < 5)) {
				a8 = a8 || 0;
				a8++;
				a6.src = T;
				a6.setAttribute("errorCount", a8)
			} else {
				a0._callCbks();
				if (!a0.mgr) {
					return
				}
				var a5 = a0.mgr;
				var a7 = a5.map.getMapType();
				if (a7.getErrorImageUrl()) {
					a0.error = true;
					a0.img.src = a7.getErrorImageUrl();
					if (a0.img && !q(a0.img)) {
						aX.tilesDiv.appendChild(a0.img)
					}
				}
			}
		};
		a3 = null
	}
	az.prototype._addLoadCbk = function(T) {
		this._cbks.push(T)
	};
	az.prototype._load = function() {
		this.img.src = this.src
	};
	az.prototype._callCbks = function() {
		var aV = this;
		for (var T = 0; T < aV._cbks.length; T++) {
			aV._cbks[T]()
		}
		aV._cbks.length = 0
	};
	function C(T) {
		this.opts = T || {};
		this.baseLayer = this.opts.baseLayer || false;
		this.zIndex = this.opts.zIndex || 0;
		this.guid = C._guid++
	}
	C._guid = 0;
	aK.lang.inherits(C, aK.lang.Class, "TileLayer");
	aK.extend(C.prototype, {
		initialize : function(aW, T) {
			if (this.baseLayer) {
				this.zIndex = -100
			}
			this.map = aW;
			if (!this.tilesDiv) {
				var aX = r("div");
				var aV = aX.style;
				aV.position = "absolute";
				aV.zIndex = this.zIndex;
				aV.left = Math.ceil(-aW.offsetX + aW.width / 2) + "px";
				aV.top = Math.ceil(-aW.offsetY + aW.height / 2) + "px";
				T.appendChild(aX);
				this.tilesDiv = aX
			}
		},
		remove : function() {
			if (this.tilesDiv && this.tilesDiv.parentNode) {
				this.tilesDiv.innerHTML = "";
				this.tilesDiv.parentNode.removeChild(this.tilesDiv)
			}
			delete this.tilesDiv
		},
		getTilesUrl : function(aV, aW) {
			var T = "";
			if (this.opts.tileUrlTemplate) {
				T = this.opts.tileUrlTemplate.replace(/\{X\}/, aV.x);
				T = T.replace(/\{Y\}/, aV.y);
				T = T.replace(/\{Z\}/, aW)
			}
			return T
		},
		getMapType : function() {
			return this.mapType
		}
	});
	function aj(T) {
		C.call(this, T);
		this._opts = {};
		T = T || {};
		this._opts = aK.object.extend(this._opts, T);
		if (this._opts.predictDate) {
			if (this._opts.predictDate.weekday < 1 || this._opts.predictDate.weekday > 7) {
				this._opts.predictDate = 1
			}
			if (this._opts.predictDate.hour < 0 || this._opts.predictDate.hour > 23) {
				this._opts.predictDate.hour = 0
			}
		}
		this._tileUrl = "http://its.map.baidu.com:8002/traffic/"
	}
	aj.prototype = new C();
	aj.prototype.initialize = function(aV, T) {
		C.prototype.initialize.call(this, aV, T);
		this._map = aV
	};
	aj.prototype.getTilesUrl = function(a2, aV) {
		var aW = this._map.tileMgr.arrStatTraffic, aZ = "level=" + aV + "&x=" + a2.x + "&y=" + a2.y;
		aW.push(aZ);
		var a3 = "";
		if (this._opts.predictDate) {
			a3 = "HistoryService?day=" + (this._opts.predictDate.weekday - 1) + "&hour=" + this._opts.predictDate.hour + "&t=" + new Date().getTime() + "&"
		} else {
			a3 = "TrafficTileService?time=" + new Date().getTime() + "&"
		}
		var aX = this._map, a4 = a2.x, aY = a2.y, a1 = Math.floor(a4 / 200), a0 = Math.floor(aY / 200), T = this._tileUrl + a3 + "level=" + aV + "&x=" + a4 + "&y=" + aY;
		return T.replace(/-(\d+)/gi, "M$1")
	};
	function Q(T) {
		C.call(this, T);
		this._opts = {};
		T = T || {};
		this._opts = aK.object.extend(this._opts, T);
		this.curTimeStamp = new Date().getTime();
		this.interval = 1800000;
		this.uid = this._opts.uid || "";
		this.layerVersion = this._opts.layerVersion;
		this._tileUrls = ["http://shangetu0.map.bdimg.com/it/", "http://shangetu1.map.bdimg.com/it/", "http://shangetu2.map.bdimg.com/it/", "http://shangetu3.map.bdimg.com/it/", "http://shangetu4.map.bdimg.com/it/"]
	}
	Q.prototype = new C();
	Q.prototype.initialize = function(aV, T) {
		C.prototype.initialize.call(this, aV, T);
		this._map = aV
	};
	Q.prototype.getTilesUrl = function(aV, aZ) {
		var aY = this, T = new Date().getTime();
		if (T - aY.curTimeStamp >= aY.interval) {
			aY.curTimeStamp = T
		}
		var a1 = aV.x, aX = aV.y, a0 = "u=x=" + a1 + ";y=" + aX + ";z=" + aZ + ";v=" + aY.layerVersion + ";type=hot" + (aY.uid ? (";s=" + aY.uid) : "") + "&fm=44&t=" + aY.curTimeStamp, aW = aY._tileUrls[Math.abs(a1 + aX) % aY._tileUrls.length] + a0;
		return aW.replace(/-(\d+)/gi, "M$1")
	};
	function al(aX, aW) {
		var aV = {
			zIndex : 1
		};
		C.call(this, aV);
		this._keyWord = aX;
		this._cityCode = aW;
		this._isVectorLayer = true;
		this._map = null;
		this._container = null;
		var T = this;
		ar.load("layer", function() {
			T._asyncLoadCode()
		})
	}
	aK.inherits(al, C, "VectorMDLayer");
	aK.extend(al.prototype, {
		initialize : function(aV, T) {
			this._map = aV;
			this._container = T
		},
		remove : function() {
			this._map = null;
			this._container = null
		},
		setKeyword : function(T) {
			this._keyWord = T
		},
		getKeyword : function() {
			return this._keyWord
		},
		setCityCode : function(T) {
			this._cityCode = T
		},
		getCityCode : function() {
			return this._cityCode
		},
		refreshLayer : function() {
		}
	});
	function aO(T, aV, aW) {
		this._name = T;
		this._layers = aV instanceof C ? [aV] : aV.slice(0);
		this._opts = {
			tips : "",
			labelText : "",
			minZoom : 3,
			maxZoom : 18,
			tileSize : 256,
			textColor : "black",
			errorImageUrl : "",
			projection : new aA(this)
		};
		if (this._layers.length == 1) {
			this._layers[0].baseLayer = true
		}
		aK.extend(this._opts, aW || {})
	}
	aK.extend(aO.prototype, {
		getName : function() {
			return this._name
		},
		getTips : function() {
			return this._opts.tips
		},
		getLabelText : function() {
			return this._opts.labelText
		},
		getTileLayer : function() {
			return this._layers[0]
		},
		getTileLayers : function() {
			return this._layers
		},
		getTileSize : function() {
			this._opts.tileSize = 256;
			var T = this._opts.mapInstance;
			if (T.highResolutionEnabled() && T.getZoom() < T.config.vectorMapLevel) {
				this._opts.tileSize = 128
			}
			return this._opts.tileSize
		},
		getMinZoom : function() {
			return this._opts.minZoom
		},
		getMaxZoom : function() {
			return this._opts.maxZoom
		},
		getTextColor : function() {
			return this._opts.textColor
		},
		getProjection : function() {
			return this._opts.projection
		},
		getErrorImageUrl : function() {
			return this._opts.errorImageUrl
		},
		getZoomUnits : function(aV) {
			var aX = 1, aW = this._opts.mapInstance, T = this._opts.maxZoom;
			if (aW.highResolutionEnabled() && aW.getZoom() < aW.config.vectorMapLevel) {
				aX = 2
			}
			return Math.pow(2, (T - aV)) * aX
		},
		getZoomFactor : function(T) {
			return this.getZoomUnits(T) * this.getTileSize()
		}
	});
	var v = {
		pd : {
			host : ["http://online1.map.bdimg.com/it/", "http://online2.map.bdimg.com/it/", "http://online3.map.bdimg.com/it/", "http://online4.map.bdimg.com/it/"],
			params : {
				fm : 42,
				f : "webapp",
				format_add : ".jpg"
			}
		},
		hd : {
			host : ["http://online1.map.bdimg.com/it/", "http://online2.map.bdimg.com/it/", "http://online3.map.bdimg.com/it/", "http://online4.map.bdimg.com/it/"],
			params : {
				format : "jpeg",
				fm : 41,
				quality : 70,
				f : "webapp",
				format_add : ".jpg"
			}
		}
	};
	var aE = new C();
	aE.getTilesUrl = function(aV, a2) {
		var a3 = aV.x, aX = aV.y, aW, aY;
		var aZ = BMap.TILE_CONFIG || v;
		if (this.map.highResolutionEnabled()) {
			aW = aZ.hd;
			if ( typeof TVC != "undefined") {
				aY = TVC.webapp.high_normal
			}
		} else {
			aW = aZ.pd;
			if ( typeof TVC != "undefined") {
				aY = TVC.webapp.lower_normal
			}
		}
		var a4 = "u=x=" + a3 + ";y=" + aX + ";z=" + a2;
		if (aY && aY.version) {
			a4 += ";v=" + aY.version
		} else {
			a4 += ";v=014"
		}
		a4 += ";type=web";
		var a1 = aW.host[Math.abs(a3 + aX) % aW.host.length];
		if (!a1) {
			a1 = aW.host[0]
		}
		var T = a1 + a4;
		if (aY && aY.updateDate) {
			T += "&udt=" + aY.updateDate
		}
		for (var a0 in aW.params) {
			T += "&" + a0 + "=" + aW.params[a0]
		}
		return T.replace(/-(\d+)/gi, "M$1")
	};
	function B(T, aX) {
		this._container = typeof T == "string" ? aK.g(T) : T;
		this._opts = {
			linksControl : true,
			enableDoubleClickZoom : true,
			showInnerView : true,
			pidForInner : null
		};
		this._povChangedByUser = false;
		aX = aX || {};
		for (var aV in aX) {
			this._opts[aV] = aX[aV]
		}
		this._pov = {
			heading : 0,
			pitch : 0
		};
		this._links = [];
		this._overlays = [];
		this._id = null;
		this._position = null;
		this._zoom = 2;
		this._description = "";
		this._mode = "";
		this._time = "";
		var aW = this;
		ar.load("streetview", function() {
			aW._draw()
		});
		this._init()
	}
	B.MAX_ZOOM = 5;
	B.MIN_ZOOM = 0;
	aK.lang.inherits(B, aK.lang.Class, "StreetView");
	aK.extend(B.prototype, {
		_init : function() {
		},
		getLinks : function() {
			return this._links
		},
		getId : function() {
			return this._id
		},
		getPosition : function() {
			return this._position
		},
		getPov : function() {
			return this._pov
		},
		getZoom : function() {
			return this._zoom
		},
		getDescription : function() {
			return this._description
		},
		getRelevants : function() {
			return this._relevants || []
		},
		getMode : function() {
			return this._mode
		},
		setId : function(aV, T) {
			if (aV == this._id) {
				return
			}
			this._lastId = this._id;
			this._id = aV;
			this._position = null;
			this._opts.pidForInner = T ? aV : null;
			this._opts.showInnerView = T ? true : false;
			this._iid = T
		},
		setStreetId : function(aV, T) {
			T = T || {};
			if (aV === this._streetId && T.pid === this._opts.pidForInner) {
				return
			}
			this._opts.pidForInner = T.pid || null;
			this._opts.showInnerView = T.showInnerView || false;
			this._lastStreetId = this._streetId;
			this._streetId = aV;
			this._id = null;
			this._iid = null;
			this._position = null
		},
		setPosition : function(T) {
			if (T.equals(this._position)) {
				return
			}
			this._lastId = this._id;
			this._position = T;
			this._id = null;
			this._streetId = null
		},
		setPov : function(T) {
			this._pov = T;
			if (this._pov.pitch > 45) {
				this._pov.pitch = 45
			}
			if (this._pov.pitch < -10) {
				this._pov.pitch = -10
			}
			this._povChangedByUser = true
		},
		setZoom : function(T) {
			if (T == this._zoom) {
				return
			}
			if (T > B.MAX_ZOOM) {
				T = B.MAX_ZOOM
			}
			if (T < B.MIN_ZOOM) {
				T = B.MIN_ZOOM
			}
			if (T != this._zoom) {
				this._zoom = T
			}
		},
		enableDoubleClickZoom : function() {
			this._opts.enableDoubleClickZoom = true
		},
		disableDoubleClickZoom : function() {
			this._opts.enableDoubleClickZoom = false
		},
		clear : function() {
			this._data = null;
			this._id = null;
			this._position = null;
			this._links = [];
			this.dispatchEvent(new ay("onclear"))
		}
	});
	function aJ() {
		var T = "20140616";
		if (window.TVC && TVC.ditu && TVC.ditu.panoUdt) {
			T = TVC.ditu.panoUdt.version
		}
		return T
	}

	function l() {
		C.call(this);
		this.forceHighResolution = true
	}
	l.URLS = ["http://pcsv0.map.bdimg.com/tile/", "http://pcsv1.map.bdimg.com/tile/"];
	l.prototype = new C();
	l.prototype.getTilesUrl = function(aY, aX) {
		var aV = (Math.abs(aY.x) + Math.abs(aY.y)) % l.URLS.length;
		var aW = "pl";
		var T = l.URLS[aV] + "?udt=" + aJ() + "&qt=tile&styles=" + aW + "&x=" + aY.x + "&y=" + aY.y + "&z=" + aX;
		return T.replace(/-(\d+)/gi, "M$1")
	};
	function J(T) {
		this._streetView = T;
		this._poi = null;
		this._dom = null;
		this._title = "";
		this._clickToInner = false;
		this._distance = null;
		this._visible = true
	}
	aK.extend(J.prototype, {
		setData : function(T) {
			this._data = T;
			if (T === null || (T.type != "street" && !T.poi)) {
				this._removePrevious();
				this._poi = null;
				this._dom = null;
				this._title = "";
				return
			}
			if (T.poi) {
				this._poi = T.poi;
				this._title = T.poi.title
			}
			if (T.iid) {
				this._clickToInner = true
			} else {
				this._clickToInner = false
			}
			this._init()
		},
		_init : function() {
			var a0 = this._poi;
			if (!a0) {
				return
			}
			var aY = this._data.pointX;
			var aX = this._data.pointY;
			this._distance = this._calcDistance(aY, aX, a0.position.lng, a0.position.lat);
			if (this._distance > 150) {
				this._visible = false;
				return
			} else {
				this._visible = true
			}
			var a1 = a0.position.lng - aY;
			var aW = a0.position.lat - aX;
			var aV = a1 / aW;
			var aZ = Math.atan(aV) * 180 / Math.PI;
			aZ = (aZ + 90) % 90;
			var T = 0;
			if (a1 > 0 && aW < 0) {
				T = 90
			}
			if (a1 < 0 && aW < 0) {
				T = 180
			}
			if (a1 < 0 && aW > 0) {
				T = 270
			}
			aZ += T;
			aZ = Math.round(aZ);
			a0.angle = aZ;
			if (!this._dom) {
				this._dom = this._addPoiLabel()
			}
			this._textDom.innerHTML = ['<span style="margin:0 14px">' + this._title + "</span>", '<span style="color:rgba(255,255,255,0.3)">|</span>', '<span style="margin:0 8px;color:#60c7fa;font-size:12px;vertical-align:1px">' + Math.round(this._distance) + "米</span>"].join("")
		},
		_addPoiLabel : function() {
			var aY = r("div");
			var aW = aY.style;
			aW.position = "absolute";
			aW.backgroundColor = "rgba(29, 29, 29, 0.8)";
			aW.paddingTop = "7px";
			aW.height = "26px";
			aW.font = "16px arial";
			aW.color = "white";
			aW.whiteSpace = "nowrap";
			aW.borderRadius = "4px";
			var aV = null;
			if (this._data.iid) {
				aV = r("img");
				aV.src = aT.imgPath + "poi_inner_icon.png";
				var T = aV.style;
				T.width = "33px";
				T.height = "33px";
				T.position = "absolute";
				T.left = "0";
				T.top = "0";
				T.border = "none";
				T.WebkitTransform = T.transform = "translateZ(0)";
				aW.paddingLeft = "33px";
				aY.appendChild(aV)
			}
			this._textDom = r("div");
			this._textDom.style["float"] = "left";
			aY.appendChild(this._textDom);
			this._streetView._overlayContainer.appendChild(aY);
			var aX = this;
			aY._id = this._data.id;
			aY._iid = this._data.iid;
			aY._streetId = this._data.streetId;
			aY._heading = this._data.heading || 0;
			aK.on(aY, "touchstart", function(aZ) {
				aZ.stopPropagation();
				aZ.preventDefault()
			});
			if (aV) {
				aV._streetId = this._data.streetId;
				aK.on(aV, "touchend", function(a1) {
					var aZ = this._streetId;
					aX._streetView.clear();
					aX._streetView.setStreetId(aZ, {
						showInnerView : true
					});
					var a0 = new ay("onpoiclick");
					a0.clickArea = "icon";
					aX._streetView.dispatchEvent(a0);
					a1.stopPropagation();
					a1.preventDefault()
				})
			}
			aK.on(aY, "touchend", function(a0) {
				if (this._id != aX._data.id) {
					aX._streetView.clear();
					aX._streetView.setStreetId(this._streetId)
				} else {
					var a1 = aX._streetView.getPov().pitch;
					aX._streetView.setPov({
						heading : this._heading,
						pitch : a1
					})
				}
				var aZ = new ay("onpoiclick");
				aZ.clickArea = "text";
				aX._streetView.dispatchEvent(aZ);
				a0.stopPropagation();
				a0.preventDefault()
			});
			return aY
		},
		render : function(aW, T, aV) {
			var a0 = this._dom;
			if (!a0) {
				return
			}
			if (this._visible) {
				a0.style.display = ""
			} else {
				a0.style.display = "none";
				return
			}
			var aY = this._poi;
			var aX = aY.angle;
			var aZ = this._povToPoint(aX, 4, T, aV);
			a0.style.left = aZ[0] + "px";
			a0.style.top = aZ[1] + "px"
		},
		_povToPoint : function(a4, aV, a3, a2) {
			var a1 = this._streetView;
			var aW = a1.getPov().heading % 360;
			while (aW < 0) {
				aW = (aW + 360) % 360
			}
			var a5 = (a4 - aW) % 360;
			var T = a1._containerSize;
			var aX = this._data.tiles.getTotalCols(a3);
			var aZ = 360 / (aX * a2);
			if (a5 > 180) {
				a5 = a5 - 360
			} else {
				if (a5 < -180) {
					a5 = a5 + 360
				}
			}
			var a0 = (Math.round(T.width / 2 + a5 / aZ));
			var aY = Math.round(T.height / 2 - (aV - a1.getPov().pitch) / aZ);
			return [a0, aY]
		},
		_removePrevious : function() {
			if (this._dom && this._dom.parentNode) {
				this._dom.parentNode.removeChild(this._dom);
				this._dom = null
			}
		},
		_calcDistance : function(aV, aX, T, aW) {
			return Math.sqrt(Math.pow(T - aV, 2) + Math.pow(aW - aX, 2))
		}
	});
	function F(T, aV) {
		window.BMap[T] = aV
	}

	F("Map", z);
	F("Hotspot", L);
	F("MapType", aO);
	F("Point", f);
	F("Pixel", aP);
	F("Size", X);
	F("Bounds", u);
	F("TileLayer", C);
	F("RasterTrafficLayer", aj);
	F("SpotshotLayer", Q);
	F("VectorMDLayer", al);
	F("Overlay", N);
	F("Marker", E);
	F("Icon", t);
	F("Polyline", ak);
	F("Control", O);
	F("ScaleControl", R);
	F("StreetView", B);
	F("StreetViewCoverageLayer", l);
})();
rivets.formatters.indexPlus = function(index) {
	return index + 1;
};
rivets.binders['style-width-percent'] = function(el, value) {
	el.style["width"] = parseInt(value)+"%";
};
rivets.formatters.transferFormatter = function(val) {
	if(val == 0){
		return "直达";
	}else{
		return val+"次换乘";
	}
};
rivets.formatters.detailFormatter = function(val) {
	if(val){
		return val;
	}else{
		return "无";
	}
};


rivets.binders['background-image-resize'] = function(el, value) {
	var ratio = window.devicePixelRatio ? devicePixelRatio : 1;
	
	var width = $(el).width()*ratio;
	var height = $(el).height()*ratio;
	var url = "http://map.baidu.com/maps/services/thumbnails?src="+value+"&fm=22&width="+width+"&height="+height+"&align=center";
	
	el.style["backgroundImage"] = "url(" + url + ")";
};


window.addEventListener('HTMLImportsLoaded', function(e) {
	document.body.style.visibility = "visible";
});

var Utils = (function() {

	// var projection = new BMap.MercatorProjection();

	function pointTolngLat(x, y) {
		return  MercatorProjection.convertMC2LL(new BMap.Point(x, y));
		// return projection.pointToLngLat(new BMap.Pixel(x,y));
	}

	function lnglatToPoint(lng, lat) {
		return MercatorProjection.convertLL2MC(new BMap.Point(lng, lat));
		// return projection.lngLatToPoint(new BMap.Point(lng, lat));
	}

	function toData(content) {
		var lnglat = pointTolngLat(content.x, content.y);
		return {
			panorama : "panorama.html?uid="+content.bid,
			name : content.name,
			price : content.price,
			home2work_distr_normaliezd:content.home2work_distr_normaliezd==""?[]:content.home2work_distr_normaliezd.split(","),
			work2home_distr_normaliezd:content.work2home_distr_normaliezd==""?[]:content.work2home_distr_normaliezd.split(","),
			loc : content.metro_distance,
			time : content.bus_time,
			thumbnail : "",
			metro_name:content.metro_name,
			metro_stop_name:content.metro_stop_name,
			transfer1:content.transfer,
			distance:content.distance,
			detailLink:"detail.html?uid="+content.bid,
			x:content.x,
			y:content.y,
			hasChart:content.home2work_distr_normaliezd!=""&&content.work2home_distr_normaliezd!="",
			hotspot:content.live_num_ratio_normalized
		};
	}

	function MapData(params) {

		var contents = params.content;

		


		this.getDetailList = function() {
			var res = [];
			contents.forEach(function(content) {
				res.push(toData(content));
			});

			return {
				count : params.total_res_num,
				list : res
			};
		};

		this.getJSON = function() {
			return contents;
		};

		this.getGeoList = function() {
			var res = [];
			contents.forEach(function(content) {
				var list = content.geo.split(",");
				var arr = [];
				for (var i = 0; i < list.length; i += 2) {
					arr.push(new BMap.Point(list[i], list[i + 1]));
				}
				res.push(arr);
			});
			console.info(res);
			return res;
		};

		this.getHeatList = function() {
			var res = [];
			contents.forEach(function(content) {
				var lnglat = pointTolngLat(content.x, content.y);

				res.push({
					"lng" : lnglat.lng,
					"lat" : lnglat.lat,
					"count" : parseFloat(content.live_num_ratio) * 2000
				});

			});
			return res;
		};
		this.getPointList = function() {
			var res = [];
			contents.forEach(function(content) {
				res.push({
					point : new BMap.Point(content.x, content.y),
					data : toData(content)
				});
			});
			return res;
		};
	}

	function DetailData(json) {

		this.getJSON = function() {
			return json;
		};

		this.getDetailModel = function() {
			var ext = json.ext;
			var info = ext.detail_info;
			return {
				"name" : json.name,
				"price" : info.price,
				"rent_price" : info.rent_price,
				"house_type" : info.house_type,
				"house_year" : info.building_time,
				"building_type" : info.building_type,
				"volume_rate" : info.volume_rate,
				"property_management_fee" : info.property_management_fee,
				"property_company" : info.property_company,
				"developers" : info.developers,
				"thumbnail" : info.image
			};
		};

	}

	function SugData(json) {

		this.getList = function() {
			var arr = [];
			json.s.forEach(function(line) {
				var origin = /^\$\$\$([^\$]+)/.exec(line);
				if (origin) {
					arr.push({
						name : origin[1]
					});
				} else {

					var detail = /^([^\$]+)\$([^\$]+)\$\$([^\$]+)\$/.exec(line);
					if (detail) {

						arr.push({
							name : detail[3],
							city : detail[1] + detail[2]
						});
					}
				}
			});
			return arr;
		};
	}

	var contentCache = {};

	return {

		getContent:function(bid){
			return contentCache[bid];
		},

		getURLParams : function() {

			var d = /\?(.*)/.exec(location.href);
			var res = {};
			if (d) {
				d[1].split("&").forEach(function(param) {
					var pair = param.split("=");
					res[pair[0]] = pair[1];
				});
			}
			return res;

		},
		getGeoPoint : function(address, city, callback) {
			$.getJSON("http://api.map.baidu.com/geocoder/v2/?address=" + address + "&city=" + city + "&output=json&ak=hmPxdBHxPZvZU2x3RN9SSKGt&callback=?", function(res) {
				var point = null;
				if(res.status == 0){
					var loc = res.result.location;
					callback&&callback(MercatorProjection.convertLL2MC(loc));	
				}
				
			});
		},
		getGeoAddress:function(lng,lat,callback){
			$.getJSON("http://api.map.baidu.com/geocoder/v2/?ak=hmPxdBHxPZvZU2x3RN9SSKGt&callback=?&location="+lat+","+lng+"&output=json&pois=0", function(res) {
				callback&&callback(res);
				
				
			});
		},
		getGeoLocation:function(callback){
			/*var coords = {
				longitude:116.322987,
				"latitude":39.983424
			};
			*/
			var me = this;
			
			if (navigator.geolocation) {

				navigator.geolocation.getCurrentPosition(function(geo){
					var coords = geo.coords;
					var point = Utils.lnglatToPoint(coords.longitude, coords.latitude);

					me.getGeoAddress(coords.longitude, coords.latitude,function(res){

						var rs = res.result;
						callback&&callback({
							point:{
								lng:coords.longitude,
								lat:coords.latitude,
							},
							address:res.result.formatted_address,
							pixel:{
								x:point.lng,
								y:point.lat
							}
							
							
						});
					});
					
				});
			}else{
				callback&&callback(null);
			}
			
			
			
			
		},
		getSugData : function(val, callback) {
			$.getJSON("http://map.baidu.com/su?wd=" + val + "&callback=?&cid=1&type=0&newmap=1", {

			}, function(res) {
				callback && callback(new SugData(res));
			});
		},
		getDetailData : function(uid, callback) {
			$.getJSON("http://map.baidu.com/detail?qt=ninf&callback=?", {
				uid :uid
			}, function(res) {

				callback && callback(new DetailData(res.content));
			});
		},

		getMapData : function(lng, lat, page, callback) {
			function fireCallback(data) {
				callback && callback(data);
			};
			var cache = {};
			var cachekey = JSON.stringify({
				"lng" : lng,
				"lat" : lat,
				"page" : page
			});
			var cacheData = cache[cachekey];
			if (cacheData) {
				fireCallback(cacheData);
			} else {
				

				$.getJSON("http://cp01-rdqa-pool388.cp01.baidu.com:8969/house/data/index.php?callback=?", {
					"crd" : lng + "," + lat,
					"sort_live_ratio" : 0,
					"page_num" : page
				}, function(res) {
					cacheData = new MapData(res);
					res.content.forEach(function(obj){
						contentCache[obj.bid] = toData(obj);
					});
					
					cache[cachekey] = cacheData;
					fireCallback(cacheData);
				});
			}

		},
		lnglatToPoint:lnglatToPoint
	};
})();

// 静态常量
(function() {
	var Point = function(x, y) {
		this.lng = x; 
		this.lat = y;
	};

	window.MercatorProjection = {
		EARTHRADIUS : 6370996.81,
		MCBAND : [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0],
		LLBAND : [75, 60, 45, 30, 15, 0],
		MC2LL : [[1.410526172116255e-008, 8.983055096488720e-006, -1.99398338163310, 2.009824383106796e+002, -1.872403703815547e+002, 91.60875166698430, -23.38765649603339, 2.57121317296198, -0.03801003308653, 1.733798120000000e+007], [-7.435856389565537e-009, 8.983055097726239e-006, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 1.026014486000000e+007], [-3.030883460898826e-008, 8.983055099835780e-006, 0.30071316287616, 59.74293618442277, 7.35798407487100, -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6.856817370000000e+006], [-1.981981304930552e-008, 8.983055099779535e-006, 0.03278182852591, 40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561, 4.482777060000000e+006], [3.091913710684370e-009, 8.983055096812155e-006, 0.00006995724062, 23.10934304144901, -0.00023663490511, -0.63218178102420, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2.555164400000000e+006], [2.890871144776878e-009, 8.983055095805407e-006, -0.00000003068298, 7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596, 0.00010322952773, -0.00000323890364, 8.260885000000000e+005]],
		LL2MC : [[-0.00157021024440, 1.113207020616939e+005, 1.704480524535203e+015, -1.033898737604234e+016, 2.611266785660388e+016, -3.514966917665370e+016, 2.659570071840392e+016, -1.072501245418824e+016, 1.800819912950474e+015, 82.5], [8.277824516172526e-004, 1.113207020463578e+005, 6.477955746671608e+008, -4.082003173641316e+009, 1.077490566351142e+010, -1.517187553151559e+010, 1.205306533862167e+010, -5.124939663577472e+009, 9.133119359512032e+008, 67.5], [0.00337398766765, 1.113207020202162e+005, 4.481351045890365e+006, -2.339375119931662e+007, 7.968221547186455e+007, -1.159649932797253e+008, 9.723671115602145e+007, -4.366194633752821e+007, 8.477230501135234e+006, 52.5], [0.00220636496208, 1.113207020209128e+005, 5.175186112841131e+004, 3.796837749470245e+006, 9.920137397791013e+005, -1.221952217112870e+006, 1.340652697009075e+006, -6.209436990984312e+005, 1.444169293806241e+005, 37.5], [-3.441963504368392e-004, 1.113207020576856e+005, 2.782353980772752e+002, 2.485758690035394e+006, 6.070750963243378e+003, 5.482118345352118e+004, 9.540606633304236e+003, -2.710553267466450e+003, 1.405483844121726e+003, 22.5], [-3.218135878613132e-004, 1.113207020701615e+005, 0.00369383431289, 8.237256402795718e+005, 0.46104986909093, 2.351343141331292e+003, 1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45]],

		/**
		 * 平面直角坐标转换成经纬度坐标;
		 * @param {Point} point 平面直角坐标
		 * @return {Point} 返回经纬度坐标
		 */

		convertMC2LL : function(point) {
			var temp, factor;
			temp = new Point(Math.abs(point["lng"]), Math.abs(point["lat"]));
			for (var i = 0; i < this.MCBAND.length; i++) {
				if (temp["lat"] >= this.MCBAND[i]) {
					factor = this.MC2LL[i];
					break;
				}
			};
			var lnglat = this.convertor(point, factor);
			var point = new Point(lnglat["lng"].toFixed(6), lnglat["lat"].toFixed(6));
			return point;
		}
		/**
		 * 经纬度坐标转换成平面直角坐标;
		 * @param {Point} point 经纬度坐标
		 * @return {Point} 返回平面直角坐标
		 */,
		convertLL2MC : function(point) {
			var temp, factor;
			point["lng"] = this.getLoop(point["lng"], -180, 180);
			point["lat"] = this.getRange(point["lat"], -74, 74);
			temp = new Point(point["lng"], point["lat"]);
			for (var i = 0; i < this.LLBAND.length; i++) {
				if (temp["lat"] >= this.LLBAND[i]) {
					factor = this.LL2MC[i];
					break;
				}
			}
			if (!factor) {
				for (var i = this.LLBAND.length - 1; i >= 0; i--) {
					if (temp["lat"] <= -this.LLBAND[i]) {
						factor = this.LL2MC[i];
						break;
					}
				}
			}
			var mc = this.convertor(point, factor);
			var point = new Point(mc["lng"].toFixed(2), mc["lat"].toFixed(2));
			return point;
		},
		convertor : function(fromPoint, factor) {
			if (!fromPoint || !factor) {
				return;
			}
			var x = factor[0] + factor[1] * Math.abs(fromPoint["lng"]);
			var temp = Math.abs(fromPoint["lat"]) / factor[9];
			var y = factor[2] + factor[3] * temp + factor[4] * temp * temp + factor[5] * temp * temp * temp + factor[6] * temp * temp * temp * temp + factor[7] * temp * temp * temp * temp * temp + factor[8] * temp * temp * temp * temp * temp * temp;
			x *= (fromPoint["lng"] < 0 ? -1 : 1);
			y *= (fromPoint["lat"] < 0 ? -1 : 1);
			return new Point(x, y);
		},
		getRange : function(v, a, b) {
			if (a != null) {
				v = Math.max(v, a);
			}
			if (b != null) {
				v = Math.min(v, b);
			}
			return v
		},
		getLoop : function(v, a, b) {
			while (v > b) {
				v -= b - a
			}
			while (v < a) {
				v += b - a
			}
			return v;
		}
	};
})();

$(function() {
	FastClick.attach(document.body);
});








/*
 * Swipe 2.0
 *
 * Brad Birdsall
 * Copyright 2013, MIT License
 *
 */

function Swipe(container, options) {"use strict";

	// utilities
	var noop = function() {
	};
	// simple no operation function
	var offloadFn = function(fn) {
		setTimeout(fn || noop, 0)
	};
	// offload a functions execution

	// check browser capabilities
	var browser = {
		addEventListener : !!window.addEventListener,
		touch : ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
		transitions : (function(temp) {
			var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
			for (var i in props )
			if (temp.style[props[i]] !== undefined)
				return true;
			return false;
		})(document.createElement('swipe'))
	};

	// quit if no root element
	if (!container)
		return;
	var element = container.children[0];
	var slides, slidePos, width, length;
	options = options || {};
	var index = parseInt(options.startSlide, 10) || 0;
	var speed = options.speed || 300;
	options.continuous = options.continuous !== undefined ? options.continuous : true;

	function setup() {

		// cache slides
		slides = element.children;
		length = slides.length;

		// set continuous to false if only one slide
		if (slides.length < 2)
			options.continuous = false;

		//special case if two slides
		if (browser.transitions && options.continuous && slides.length < 3) {
			element.appendChild(slides[0].cloneNode(true));
			element.appendChild(element.children[1].cloneNode(true));
			slides = element.children;
		}

		// create an array to store current positions of each slide
		slidePos = new Array(slides.length);

		// determine width of each slide
		width = container.getBoundingClientRect().width || container.offsetWidth;

		element.style.width = (slides.length * width) + 'px';

		// stack elements
		var pos = slides.length;
		while (pos--) {

			var slide = slides[pos];

			slide.style.width = width + 'px';
			slide.setAttribute('data-index', pos);

			if (browser.transitions) {
				slide.style.left = (pos * -width) + 'px';
				move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
			}

		}

		// reposition elements before and after index
		if (options.continuous && browser.transitions) {
			move(circle(index - 1), -width, 0);
			move(circle(index + 1), width, 0);
		}

		if (!browser.transitions)
			element.style.left = (index * -width) + 'px';

		container.style.visibility = 'visible';

	}

	function prev() {

		if (options.continuous)
			slide(index - 1);
		else if (index)
			slide(index - 1);

	}

	function next() {

		if (options.continuous)
			slide(index + 1);
		else if (index < slides.length - 1)
			slide(index + 1);

	}

	function circle(index) {

		// a simple positive modulo using slides.length
		return (slides.length + (index % slides.length)) % slides.length;

	}

	function slide(to, slideSpeed) {

		// do nothing if already on requested slide
		if (index == to)
			return;

		if (browser.transitions) {

			var direction = Math.abs(index - to) / (index - to);
			// 1: backward, -1: forward

			// get the actual position of the slide
			if (options.continuous) {
				var natural_direction = direction;
				direction = -slidePos[circle(to)] / width;

				// if going forward but to < index, use to = slides.length + to
				// if going backward but to > index, use to = -slides.length + to
				if (direction !== natural_direction)
					to = -direction * slides.length + to;

			}

			var diff = Math.abs(index - to) - 1;

			// move all the slides between index and to in the right direction
			while (diff--)move(circle((to > index ? to : index) - diff - 1), width * direction, 0);

			to = circle(to);

			move(index, width * direction, slideSpeed || speed);
			move(to, 0, slideSpeed || speed);

			if (options.continuous)
				move(circle(to - direction), -(width * direction), 0);
			// we need to get the next in place

		} else {

			to = circle(to);
			animate(index * -width, to * -width, slideSpeed || speed);
			//no fallback for a circular continuous if the browser does not accept transitions
		}

		index = to;
		offloadFn(options.callback && options.callback(index, slides[index]));
	}

	function move(index, dist, speed) {

		translate(index, dist, speed);
		slidePos[index] = dist;

	}

	function translate(index, dist, speed) {

		var slide = slides[index];
		var style = slide && slide.style;

		if (!style)
			return;

		style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = speed + 'ms';

		style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
		style.msTransform = style.MozTransform = style.OTransform = 'translateX(' + dist + 'px)';

	}

	function animate(from, to, speed) {

		// if not an animation, just reposition
		if (!speed) {

			element.style.left = to + 'px';
			return;

		}

		var start = +new Date;

		var timer = setInterval(function() {

			var timeElap = +new Date - start;

			if (timeElap > speed) {

				element.style.left = to + 'px';

				if (delay)
					begin();

				options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

				clearInterval(timer);
				return;

			}

			element.style.left = (((to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';

		}, 4);

	}

	// setup auto slideshow
	var delay = options.auto || 0;
	var interval;

	function begin() {

		interval = setTimeout(next, delay);

	}

	function stop() {

		delay = 0;
		clearTimeout(interval);

	}

	// setup initial vars
	var start = {};
	var delta = {};
	var isScrolling;

	// setup event capturing
	var events = {

		handleEvent : function(event) {

			switch (event.type) {
				case 'touchstart':
					this.start(event);
					break;
				case 'touchmove':
					this.move(event);
					break;
				case 'touchend':
					offloadFn(this.end(event));
					break;
				case 'webkitTransitionEnd':
				case 'msTransitionEnd':
				case 'oTransitionEnd':
				case 'otransitionend':
				case 'transitionend':
					offloadFn(this.transitionEnd(event));
					break;
				case 'resize':
					offloadFn(setup);
					break;
			}

			if (options.stopPropagation)
				event.stopPropagation();

		},
		start : function(event) {

			var touches = event.touches[0];

			// measure start values
			start = {

				// get initial touch coords
				x : touches.pageX,
				y : touches.pageY,

				// store time to determine touch duration
				time : +new Date

			};

			// used for testing first move event
			isScrolling = undefined;

			// reset delta and end measurements
			delta = {};

			// attach touchmove and touchend listeners
			element.addEventListener('touchmove', this, false);
			element.addEventListener('touchend', this, false);

		},
		move : function(event) {

			// ensure swiping with one touch and not pinching
			if (event.touches.length > 1 || event.scale && event.scale !== 1)
				return

			if (options.disableScroll)
				event.preventDefault();

			var touches = event.touches[0];

			// measure change in x and y
			delta = {
				x : touches.pageX - start.x,
				y : touches.pageY - start.y
			}

			// determine if scrolling test has run - one time test
			if ( typeof isScrolling == 'undefined') {
				isScrolling = !!(isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
			}

			// if user is not trying to scroll vertically
			if (!isScrolling) {

				// prevent native scrolling
				event.preventDefault();

				// stop slideshow
				stop();

				// increase resistance if first or last slide
				if (options.continuous) {// we don't add resistance at the end

					translate(circle(index - 1), delta.x + slidePos[circle(index - 1)], 0);
					translate(index, delta.x + slidePos[index], 0);
					translate(circle(index + 1), delta.x + slidePos[circle(index + 1)], 0);

				} else {

					delta.x = delta.x / ((!index && delta.x > 0// if first slide and sliding left
					|| index == slides.length - 1// or if last slide and sliding right
					&& delta.x < 0 // and if sliding at all
					) ? (Math.abs(delta.x) / width + 1 )// determine resistance level
					: 1 );
					// no resistance if false

					// translate 1:1
					translate(index - 1, delta.x + slidePos[index - 1], 0);
					translate(index, delta.x + slidePos[index], 0);
					translate(index + 1, delta.x + slidePos[index + 1], 0);
				}

			}

		},
		end : function(event) {

			// measure duration
			var duration = +new Date - start.time;

			// determine if slide attempt triggers next/prev slide
			var isValidSlide = Number(duration) < 250// if slide duration is less than 250ms
			&& Math.abs(delta.x) > 20// and if slide amt is greater than 20px
			|| Math.abs(delta.x) > width / 2;
			// or if slide amt is greater than half the width

			// determine if slide attempt is past start and end
			var isPastBounds = !index && delta.x > 0// if first slide and slide amt is greater than 0
			|| index == slides.length - 1 && delta.x < 0;
			// or if last slide and slide amt is less than 0

			if (options.continuous)
				isPastBounds = false;

			// determine direction of swipe (true:right, false:left)
			var direction = delta.x < 0;

			// if not scrolling vertically
			if (!isScrolling) {

				if (isValidSlide && !isPastBounds) {

					if (direction) {

						if (options.continuous) {// we need to get the next in this direction in place

							move(circle(index - 1), -width, 0);
							move(circle(index + 2), width, 0);

						} else {
							move(index - 1, -width, 0);
						}

						move(index, slidePos[index] - width, speed);
						move(circle(index + 1), slidePos[circle(index + 1)] - width, speed);
						index = circle(index + 1);

					} else {
						if (options.continuous) {// we need to get the next in this direction in place

							move(circle(index + 1), width, 0);
							move(circle(index - 2), -width, 0);

						} else {
							move(index + 1, width, 0);
						}

						move(index, slidePos[index] + width, speed);
						move(circle(index - 1), slidePos[circle(index - 1)] + width, speed);
						index = circle(index - 1);

					}

					options.callback && options.callback(index, slides[index]);

				} else {

					if (options.continuous) {

						move(circle(index - 1), -width, speed);
						move(index, 0, speed);
						move(circle(index + 1), width, speed);

					} else {

						move(index - 1, -width, speed);
						move(index, 0, speed);
						move(index + 1, width, speed);
					}

				}

			}

			// kill touchmove and touchend event listeners until touchstart called again
			element.removeEventListener('touchmove', events, false)
			element.removeEventListener('touchend', events, false)

		},
		transitionEnd : function(event) {

			if (parseInt(event.target.getAttribute('data-index'), 10) == index) {

				if (delay)
					begin();

				options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

			}

		}
	}

	// trigger setup
	setup();

	// start auto slideshow if applicable
	if (delay)
		begin();

	// add event listeners
	if (browser.addEventListener) {

		// set touchstart event on element
		if (browser.touch)
			element.addEventListener('touchstart', events, false);

		if (browser.transitions) {
			element.addEventListener('webkitTransitionEnd', events, false);
			element.addEventListener('msTransitionEnd', events, false);
			element.addEventListener('oTransitionEnd', events, false);
			element.addEventListener('otransitionend', events, false);
			element.addEventListener('transitionend', events, false);
		}

		// set resize event on window
		window.addEventListener('resize', events, false);

	} else {

		window.onresize = function() {
			setup()
		};
		// to play nice with old IE

	}

	// expose the Swipe API
	return {
		
		setDelay : function(d){
			
			stop();
			delay = d;
			begin();
		},
		setSpeed : function(s){
			speed = s;
		},
		setup : function() {

			setup();

		},
		slide : function(to, speed) {

			// cancel slideshow
			stop();

			slide(to, speed);

		},
		prev : function() {

			// cancel slideshow
			stop();

			prev();

		},
		next : function() {

			// cancel slideshow
			stop();

			next();

		},
		stop : function() {

			// cancel slideshow
			stop();

		},
		getPos : function() {

			// return current index position
			return index;

		},
		getNumSlides : function() {

			// return total number of slides
			return length;
		},
		kill : function() {

			// cancel slideshow
			stop();

			// reset element
			element.style.width = '';
			element.style.left = '';

			// reset slides
			var pos = slides.length;
			while (pos--) {

				var slide = slides[pos];
				slide.style.width = '';
				slide.style.left = '';

				if (browser.transitions)
					translate(pos, 0, 0);

			}

			// removed event listeners
			if (browser.addEventListener) {

				// remove current event listeners
				element.removeEventListener('touchstart', events, false);
				element.removeEventListener('webkitTransitionEnd', events, false);
				element.removeEventListener('msTransitionEnd', events, false);
				element.removeEventListener('oTransitionEnd', events, false);
				element.removeEventListener('otransitionend', events, false);
				element.removeEventListener('transitionend', events, false);
				window.removeEventListener('resize', events, false);

			} else {

				window.onresize = null;

			}

		}
	}

}

if (window.jQuery || window.Zepto) {
	(function($) {
		$.fn.Swipe = function(params) {
			return this.each(function() {
				$(this).data('Swipe', new Swipe($(this)[0], params));
			});
		}
	})(window.jQuery || window.Zepto)
}


/*
 * Swipe 2.0
 *
 * Brad Birdsall
 * Copyright 2013, MIT License
 *
 */

function Swipe(container, options) {"use strict";

	// utilities
	var noop = function() {
	};
	// simple no operation function
	var offloadFn = function(fn) {
		setTimeout(fn || noop, 0)
	};
	// offload a functions execution

	// check browser capabilities
	var browser = {
		addEventListener : !!window.addEventListener,
		touch : ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
		transitions : (function(temp) {
			var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
			for (var i in props )
			if (temp.style[props[i]] !== undefined)
				return true;
			return false;
		})(document.createElement('swipe'))
	};

	// quit if no root element
	if (!container)
		return;
	var element = container.children[0];
	var slides, slidePos, width, length;
	options = options || {};
	var index = parseInt(options.startSlide, 10) || 0;
	var speed = options.speed || 300;
	options.continuous = options.continuous !== undefined ? options.continuous : true;

	function setup() {

		// cache slides
		slides = element.children;
		length = slides.length;

		// set continuous to false if only one slide
		if (slides.length < 2)
			options.continuous = false;

		//special case if two slides
		if (browser.transitions && options.continuous && slides.length < 3) {
			element.appendChild(slides[0].cloneNode(true));
			element.appendChild(element.children[1].cloneNode(true));
			slides = element.children;
		}

		// create an array to store current positions of each slide
		slidePos = new Array(slides.length);

		// determine width of each slide
		width = container.getBoundingClientRect().width || container.offsetWidth;

		element.style.width = (slides.length * width) + 'px';

		// stack elements
		var pos = slides.length;
		while (pos--) {

			var slide = slides[pos];

			slide.style.width = width + 'px';
			slide.setAttribute('data-index', pos);

			if (browser.transitions) {
				slide.style.left = (pos * -width) + 'px';
				move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
			}

		}

		// reposition elements before and after index
		if (options.continuous && browser.transitions) {
			move(circle(index - 1), -width, 0);
			move(circle(index + 1), width, 0);
		}

		if (!browser.transitions)
			element.style.left = (index * -width) + 'px';

		container.style.visibility = 'visible';

	}

	function prev() {

		if (options.continuous)
			slide(index - 1);
		else if (index)
			slide(index - 1);

	}

	function next() {

		if (options.continuous)
			slide(index + 1);
		else if (index < slides.length - 1)
			slide(index + 1);

	}

	function circle(index) {

		// a simple positive modulo using slides.length
		return (slides.length + (index % slides.length)) % slides.length;

	}

	function slide(to, slideSpeed) {

		// do nothing if already on requested slide
		if (index == to)
			return;

		if (browser.transitions) {

			var direction = Math.abs(index - to) / (index - to);
			// 1: backward, -1: forward

			// get the actual position of the slide
			if (options.continuous) {
				var natural_direction = direction;
				direction = -slidePos[circle(to)] / width;

				// if going forward but to < index, use to = slides.length + to
				// if going backward but to > index, use to = -slides.length + to
				if (direction !== natural_direction)
					to = -direction * slides.length + to;

			}

			var diff = Math.abs(index - to) - 1;

			// move all the slides between index and to in the right direction
			while (diff--)move(circle((to > index ? to : index) - diff - 1), width * direction, 0);

			to = circle(to);

			move(index, width * direction, slideSpeed || speed);
			move(to, 0, slideSpeed || speed);

			if (options.continuous)
				move(circle(to - direction), -(width * direction), 0);
			// we need to get the next in place

		} else {

			to = circle(to);
			animate(index * -width, to * -width, slideSpeed || speed);
			//no fallback for a circular continuous if the browser does not accept transitions
		}

		index = to;
		offloadFn(options.callback && options.callback(index, slides[index]));
	}

	function move(index, dist, speed) {

		translate(index, dist, speed);
		slidePos[index] = dist;

	}

	function translate(index, dist, speed) {

		var slide = slides[index];
		var style = slide && slide.style;

		if (!style)
			return;

		style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = speed + 'ms';

		style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
		style.msTransform = style.MozTransform = style.OTransform = 'translateX(' + dist + 'px)';

	}

	function animate(from, to, speed) {

		// if not an animation, just reposition
		if (!speed) {

			element.style.left = to + 'px';
			return;

		}

		var start = +new Date;

		var timer = setInterval(function() {

			var timeElap = +new Date - start;

			if (timeElap > speed) {

				element.style.left = to + 'px';

				if (delay)
					begin();

				options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

				clearInterval(timer);
				return;

			}

			element.style.left = (((to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';

		}, 4);

	}

	// setup auto slideshow
	var delay = options.auto || 0;
	var interval;

	function begin() {

		interval = setTimeout(next, delay);

	}

	function stop() {

		delay = 0;
		clearTimeout(interval);

	}

	// setup initial vars
	var start = {};
	var delta = {};
	var isScrolling;

	// setup event capturing
	var events = {

		handleEvent : function(event) {

			switch (event.type) {
				case 'touchstart':
					this.start(event);
					break;
				case 'touchmove':
					this.move(event);
					break;
				case 'touchend':
					offloadFn(this.end(event));
					break;
				case 'webkitTransitionEnd':
				case 'msTransitionEnd':
				case 'oTransitionEnd':
				case 'otransitionend':
				case 'transitionend':
					offloadFn(this.transitionEnd(event));
					break;
				case 'resize':
					offloadFn(setup);
					break;
			}

			if (options.stopPropagation)
				event.stopPropagation();

		},
		start : function(event) {

			var touches = event.touches[0];

			// measure start values
			start = {

				// get initial touch coords
				x : touches.pageX,
				y : touches.pageY,

				// store time to determine touch duration
				time : +new Date

			};

			// used for testing first move event
			isScrolling = undefined;

			// reset delta and end measurements
			delta = {};

			// attach touchmove and touchend listeners
			element.addEventListener('touchmove', this, false);
			element.addEventListener('touchend', this, false);

		},
		move : function(event) {

			// ensure swiping with one touch and not pinching
			if (event.touches.length > 1 || event.scale && event.scale !== 1)
				return

			if (options.disableScroll)
				event.preventDefault();

			var touches = event.touches[0];

			// measure change in x and y
			delta = {
				x : touches.pageX - start.x,
				y : touches.pageY - start.y
			}

			// determine if scrolling test has run - one time test
			if ( typeof isScrolling == 'undefined') {
				isScrolling = !!(isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
			}

			// if user is not trying to scroll vertically
			if (!isScrolling) {

				// prevent native scrolling
				event.preventDefault();

				// stop slideshow
				stop();

				// increase resistance if first or last slide
				if (options.continuous) {// we don't add resistance at the end

					translate(circle(index - 1), delta.x + slidePos[circle(index - 1)], 0);
					translate(index, delta.x + slidePos[index], 0);
					translate(circle(index + 1), delta.x + slidePos[circle(index + 1)], 0);

				} else {

					delta.x = delta.x / ((!index && delta.x > 0// if first slide and sliding left
					|| index == slides.length - 1// or if last slide and sliding right
					&& delta.x < 0 // and if sliding at all
					) ? (Math.abs(delta.x) / width + 1 )// determine resistance level
					: 1 );
					// no resistance if false

					// translate 1:1
					translate(index - 1, delta.x + slidePos[index - 1], 0);
					translate(index, delta.x + slidePos[index], 0);
					translate(index + 1, delta.x + slidePos[index + 1], 0);
				}

			}

		},
		end : function(event) {

			// measure duration
			var duration = +new Date - start.time;

			// determine if slide attempt triggers next/prev slide
			var isValidSlide = Number(duration) < 250// if slide duration is less than 250ms
			&& Math.abs(delta.x) > 20// and if slide amt is greater than 20px
			|| Math.abs(delta.x) > width / 2;
			// or if slide amt is greater than half the width

			// determine if slide attempt is past start and end
			var isPastBounds = !index && delta.x > 0// if first slide and slide amt is greater than 0
			|| index == slides.length - 1 && delta.x < 0;
			// or if last slide and slide amt is less than 0

			if (options.continuous)
				isPastBounds = false;

			// determine direction of swipe (true:right, false:left)
			var direction = delta.x < 0;

			// if not scrolling vertically
			if (!isScrolling) {

				if (isValidSlide && !isPastBounds) {

					if (direction) {

						if (options.continuous) {// we need to get the next in this direction in place

							move(circle(index - 1), -width, 0);
							move(circle(index + 2), width, 0);

						} else {
							move(index - 1, -width, 0);
						}

						move(index, slidePos[index] - width, speed);
						move(circle(index + 1), slidePos[circle(index + 1)] - width, speed);
						index = circle(index + 1);

					} else {
						if (options.continuous) {// we need to get the next in this direction in place

							move(circle(index + 1), width, 0);
							move(circle(index - 2), -width, 0);

						} else {
							move(index + 1, width, 0);
						}

						move(index, slidePos[index] + width, speed);
						move(circle(index - 1), slidePos[circle(index - 1)] + width, speed);
						index = circle(index - 1);

					}

					options.callback && options.callback(index, slides[index]);

				} else {

					if (options.continuous) {

						move(circle(index - 1), -width, speed);
						move(index, 0, speed);
						move(circle(index + 1), width, speed);

					} else {

						move(index - 1, -width, speed);
						move(index, 0, speed);
						move(index + 1, width, speed);
					}

				}

			}

			// kill touchmove and touchend event listeners until touchstart called again
			element.removeEventListener('touchmove', events, false)
			element.removeEventListener('touchend', events, false)

		},
		transitionEnd : function(event) {

			if (parseInt(event.target.getAttribute('data-index'), 10) == index) {

				if (delay)
					begin();

				options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

			}

		}
	}

	// trigger setup
	setup();

	// start auto slideshow if applicable
	if (delay)
		begin();

	// add event listeners
	if (browser.addEventListener) {

		// set touchstart event on element
		if (browser.touch)
			element.addEventListener('touchstart', events, false);

		if (browser.transitions) {
			element.addEventListener('webkitTransitionEnd', events, false);
			element.addEventListener('msTransitionEnd', events, false);
			element.addEventListener('oTransitionEnd', events, false);
			element.addEventListener('otransitionend', events, false);
			element.addEventListener('transitionend', events, false);
		}

		// set resize event on window
		window.addEventListener('resize', events, false);

	} else {

		window.onresize = function() {
			setup()
		};
		// to play nice with old IE

	}

	// expose the Swipe API
	return {
		
		setDelay : function(d){
			
			stop();
			delay = d;
			begin();
		},
		setSpeed : function(s){
			speed = s;
		},
		setup : function() {

			setup();

		},
		slide : function(to, speed) {

			// cancel slideshow
			stop();

			slide(to, speed);

		},
		prev : function() {

			// cancel slideshow
			stop();

			prev();

		},
		next : function() {

			// cancel slideshow
			stop();

			next();

		},
		stop : function() {

			// cancel slideshow
			stop();

		},
		getPos : function() {

			// return current index position
			return index;

		},
		getNumSlides : function() {

			// return total number of slides
			return length;
		},
		kill : function() {

			// cancel slideshow
			stop();

			// reset element
			element.style.width = '';
			element.style.left = '';

			// reset slides
			var pos = slides.length;
			while (pos--) {

				var slide = slides[pos];
				slide.style.width = '';
				slide.style.left = '';

				if (browser.transitions)
					translate(pos, 0, 0);

			}

			// removed event listeners
			if (browser.addEventListener) {

				// remove current event listeners
				element.removeEventListener('touchstart', events, false);
				element.removeEventListener('webkitTransitionEnd', events, false);
				element.removeEventListener('msTransitionEnd', events, false);
				element.removeEventListener('oTransitionEnd', events, false);
				element.removeEventListener('otransitionend', events, false);
				element.removeEventListener('transitionend', events, false);
				window.removeEventListener('resize', events, false);

			} else {

				window.onresize = null;

			}

		}
	}

}

if (window.jQuery || window.Zepto) {
	(function($) {
		$.fn.Swipe = function(params) {
			return this.each(function() {
				$(this).data('Swipe', new Swipe($(this)[0], params));
			});
		}
	})(window.jQuery || window.Zepto)
}






