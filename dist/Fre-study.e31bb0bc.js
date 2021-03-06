// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/render.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mount = mount;
exports.render = render;
exports.setAttr = setAttr;
exports.ele = exports.prevNode = exports.vm = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var vm, prevNode, ele;
exports.ele = ele;
exports.prevNode = prevNode;
exports.vm = vm;

function mount(vnode, el) {
  exports.ele = ele = el;
  exports.vm = vm = vnode;
  exports.prevNode = prevNode = vnode.type();
  el.innerHTML = '';
  var node = render(vnode);
  el.appendChild(node);
}

function render(vnode) {
  if (typeof vnode.type === 'function') {
    exports.prevNode = prevNode = vnode.type(vnode.props);
    vnode = vnode.type(vnode.props);
  }

  var node = document.createElement(vnode.type);

  for (var name in vnode.props) {
    setAttr(node, name, vnode.props[name]);
  }

  vnode.children.forEach(function (child) {
    child = _typeof(child) == 'object' ? render(child) : document.createTextNode(child);
    node.appendChild(child);
  });
  return node;
}

function setAttr(node, name, value) {
  if (/on\w+/.test(name)) {
    name = name.toLowerCase();
    node[name] = value || '';
  } else {
    switch (name) {
      case 'className':
        name === 'class';
        break;

      case 'value':
        if (node.tagName.toUpperCase() === 'INPUT' || node.tagName.toUpperCase() === 'TEXTAREA') {
          node.value = value;
        } else {
          node.setAttribute(name, value);
        }

        break;

      case 'style':
        node.style.cssText = value;
        break;

      default:
        node.setAttribute(name, value);
    }
  }
}
},{}],"src/diff.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.diff = diff;
exports.prevNode = void 0;
var ATTRS = 'ATTRS';
var REMOVE = 'REMOVE';
var TEXT = 'TEXT';
var REPLACE = 'REPLACE';
var prevNode;
exports.prevNode = prevNode;

function diff(oldTree, newTree) {
  var index = 0;
  var patches = {};
  walk(oldTree, newTree, index, patches);
  return patches;
}

function walk(oldNode, newNode, index, patches) {
  var currentPatches = [];

  if (typeof oldNode.type === 'function') {
    walk(oldNode.type(oldNode.props), newNode.type(newNode.props), index, patches);
  } else if (typeof oldNode === 'string' && typeof newNode === 'string' || typeof oldNode === 'number' && typeof oldNode === 'number') {
    if (oldNode !== newNode) {
      currentPatches.push({
        type: TEXT,
        text: newNode
      });
    }
  } else if (!newNode) {
    currentPatches.push({
      type: REMOVE,
      index: index
    });
  } else if (oldNode.type === newNode.type) {
    var attrs = diffAttr(oldNode.props, newNode.props);

    if (Object.keys(attrs).length > 0) {
      currentPatches.push({
        type: ATTRS,
        attrs: attrs
      });
    }

    diffChildren(oldNode.children, newNode.children, index, patches);
  } else {
    index += oldNode.children.length;
    currentPatches.push({
      type: REPLACE,
      newNode: newNode
    });
  }

  if (currentPatches.length > 0) {
    patches[index] = currentPatches;
  }
}

function diffAttr(oldAttr, newAttr) {
  var patch = {};

  for (var key in oldAttr) {
    if (typeof oldAttr[key] !== 'function') {
      if (oldAttr[key] !== newAttr[key]) {
        patch[key] = newAttr[key];
      }
    }
  }

  for (var _key in newAttr) {
    if (typeof newAttr[_key] !== 'function') {
      if (!oldAttr.hasOwnProperty(_key)) {
        patch[_key] = newAttr[_key];
      }
    }
  }

  return patch;
}

function diffChildren(oldChildren, newChildren, index, patches) {
  oldChildren.forEach(function (child, i) {
    walk(child, newChildren[i], ++index, patches);
  });
}
},{}],"src/patch.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.patch = patch;

var _render = require("./render");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var allPatches;
var index;

function patch(node, patches) {
  allPatches = patches;
  index = 0;
  walk(node);
}

function walk(node) {
  var currentPatch = allPatches[index++];
  node.childNodes.forEach(function (child) {
    return walk(child);
  });

  if (currentPatch) {
    usePatch(node, currentPatch);
  }
}

function usePatch(node, patches) {
  patches.forEach(function (patch) {
    switch (patch.type) {
      case 'ATTRS':
        for (var key in patch.attrs) {
          var value = patch.attrs[key];

          if (value) {
            (0, _render.setAttr)(node, key, value);
          } else {
            node.removeAttribute(key);
          }
        }

        break;

      case 'TEXT':
        node.textContent = patch.text;
        break;

      case 'REPLACE':
        var newNode = _typeof(patch.newNode) === 'object' ? (0, _render.render)(patch.newNode) : document.createTextNode(patch.newNode);
        node.parentNode.replaceChild(newNode, node);
        break;

      case 'REMOVE':
        node.parentNode.removeChild(node);
        break;
    }
  });
}
},{"./render":"src/render.js"}],"src/hooks.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useState = useState;

var _render = require("./render");

var _diff = require("./diff");

var _patch = require("./patch");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var save = {};
var oldTree;
var newTree;

function useState(state) {
  if (Object.keys(save).length > 0) {
    state = _objectSpread(_objectSpread({}, state), save);
  }

  return proxy(state);
}

function proxy(state) {
  var newState = new Proxy(state, {
    get: function get(obj, key) {
      if (save[key]) {
        return save[key];
      } else {
        return obj[key];
      }
    },
    set: function set(obj, key, val) {
      save[key] = val;
      oldTree = _render.prevNode;
      newTree = _render.vm.type(_render.vm.props);
      var patches = (0, _diff.diff)(oldTree, newTree);
      (0, _patch.patch)(_render.ele, patches);
      return true;
    }
  });
  return newState;
}
},{"./render":"src/render.js","./diff":"src/diff.js","./patch":"src/patch.js"}],"src/html.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = html;
// complie tagged template to vnode , thanks htm
var CACHE = {};
var TEMPLATE = document.createElement('template');
var reg = /(\$_h\[\d+\])/g;

function html(statics) {
  var tpl = CACHE[statics] || (CACHE[statics] = build(statics));
  console.log('tpl', tpl, arguments);
  return tpl(this, arguments);
}

function build(statics) {
  console.log('statics', statics);
  var str = statics[0],
      i = 1;

  while (i < statics.length) {
    str += '$_h[' + i + ']' + statics[i++];
  }

  console.log('str', str);
  TEMPLATE.innerHTML = str.replace(/<(?:(\/)\/|(\/?)(\$_h\[\d+\]))/g, '<$1$2c c@=$3').replace(/<([\w:-]+)(?:\s[^<>]*?)?(\/?)>/g, function (str, name, a) {
    return str.replace(/(?:'.*?'|".*?"|([A-Z]))/g, function (s, c) {
      return c ? ':::' + c : s;
    }) + (a ? '</' + name + '>' : '');
  }).replace(/[\r\n]|\ \ +/g, '').trim();
  console.log('TEMPLATE', TEMPLATE, walk((TEMPLATE.content || TEMPLATE).firstChild));
  return Function('h', '$_h', 'return ' + walk((TEMPLATE.content || TEMPLATE).firstChild));
}

function walk(n) {
  console.log('n', n, n.data);

  if (n.nodeType != 1) {
    //当不是节点元素
    //当是文本节点 并且有值
    if (n.nodeType == 3 && n.data) return field(n.data, ',');
    return 'null';
  }

  console.log('localName', n.localName);
  var str = '',
      nodeName = field(n.localName, str),
      sub = '',
      start = ',({';

  for (var i = 0; i < n.attributes.length; i++) {
    var name = n.attributes[i].name;
    var value = n.attributes[i].value;

    if (name == 'c@') {
      nodeName = value;
    } else if (name.substring(0, 3) == '...') {
      sub = '';
      start = ',Object.assign({';
      str += '},' + name.substring(3) + ',{';
    } else {
      str += "".concat(sub, "\"").concat(name.replace(/:::(\w)/g, function (s, i) {
        return i.toUpperCase();
      }), "\":").concat(value ? field(value, '+') : true);
      sub = ',';
    }
  }

  str = 'h(' + nodeName + start + str + '})';
  var child = n.firstChild;

  while (child) {
    str += ',' + walk(child);
    child = child.nextSibling;
  }

  return str + ')';
}

function field(value, sep) {
  var matches = value.match(reg);
  var strValue = JSON.stringify(value);

  if (matches != null) {
    if (matches[0] === value) return value;
    strValue = strValue.replace(reg, "\"".concat(sep, "$1").concat(sep, "\"")).replace(/"[+,]"/g, '');
    if (sep == ',') strValue = "[".concat(strValue, "]");
  }

  return strValue;
}
},{}],"src/h.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.h = h;
exports.html = void 0;

var _html = _interopRequireDefault(require("./html"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function h(type, props) {
  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  return {
    type: type,
    props: props,
    children: children
  };
}

var html = _html.default.bind(h);

exports.html = html;
},{"./html":"src/html.js"}],"src/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "useState", {
  enumerable: true,
  get: function () {
    return _hooks.useState;
  }
});
Object.defineProperty(exports, "html", {
  enumerable: true,
  get: function () {
    return _h.html;
  }
});
Object.defineProperty(exports, "h", {
  enumerable: true,
  get: function () {
    return _h.h;
  }
});
exports.render = void 0;

var _hooks = require("./hooks");

var _h = require("./h");

var _render = require("./render");

var render = _render.mount;
exports.render = render;
},{"./hooks":"src/hooks.js","./h":"src/h.js","./render":"src/render.js"}],"src_mine/html.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = html;

// complie tagged template to vnode , thanks htm
// const CACHE = {}
// const TEMPLATE = document.createElement('template')
// const reg = /(\$_h\[\d+\])/g
function html(statics) {
  console.log('statics', statics);
  var str = statics[0];
  var i = 1;

  while (i < statics.length) {
    str += '$_h[' + i + ']' + statics[i++];
  }

  console.log('tag', str); // for(let i = 1; i <statics.length; ){
  //   str+= '$_h'+i + statics[i++]
  // }
  // const tpl = CACHE[statics] || (CACHE[statics] = build(statics))
  // return tpl(this, arguments)
}

function build(statics) {}

function walk(n) {}

function field(value, sep) {}
},{}],"src_mine/h.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.h1 = h1;
exports.html1 = void 0;

var _html = _interopRequireDefault(require("./html"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function h1(type, props) {
  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  return {
    type: type,
    props: props,
    children: children
  };
}

var html1 = _html.default.bind(h1);

exports.html1 = html1;
},{"./html":"src_mine/html.js"}],"index.js":[function(require,module,exports) {
"use strict";

var _src = require("./src");

var _h = require("./src_mine/h");

function _templateObject4() {
  var data = _taggedTemplateLiteral(["<", " />"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = _taggedTemplateLiteral(["<", " />"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = _taggedTemplateLiteral(["\n    <button onclick=", ">", "</button>\n  "]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n    <div>123</div>\n  "]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

// function counter() {
//   const state = useState({
//     count: 0
//   },this)
//   return h`
//     <div>
//       ${h`<${count} count=${state.count} />`}
//       <button onclick=${() => {state.count++}}>+</button>
//       <button onclick=${() => {state.count--}}>-</button>
//     </div> 
//   `
// }
// function count(props){
//   const state = useState({
//     sex:'boy'
//   },this)
//   return h`
//     <div>
//       <p>${props.count}</p>
//       <p>${state.sex}</p>
//       <button onclick=${()=>{console.log(123)}}>x</button>
//     </div>
//   `
// }
function HelloWord() {
  return (0, _src.html)(_templateObject());
}

{
  /* <button onclick=${()=>{console.log(123)}}>hello</button> */
}

function HelloWord2() {
  return (0, _h.html1)(_templateObject2(), function () {
    console.log(123);
  }, 1 + 2);
}

console.log(123, HelloWord());
console.log('h', (0, _src.html)(_templateObject3(), HelloWord)); // console.log('mine',HelloWord2())

(0, _src.render)((0, _src.html)(_templateObject4(), HelloWord), document.body);
},{"./src":"src/index.js","./src_mine/h":"src_mine/h.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "58228" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/Fre-study.e31bb0bc.js.map