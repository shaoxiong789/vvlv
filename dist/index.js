'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var vuePropertyDecorator = require('vue-property-decorator');
var rxjs = require('rxjs');
var operators = require('rxjs/operators');
var styled = _interopDefault(require('vue-styled-components'));
var _ = _interopDefault(require('lodash'));

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var taggedTemplateLiteral = function (strings, raw) {
  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {
        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    }return c > 3 && r && Object.defineProperty(target, key, r), r;
}

var _templateObject = taggedTemplateLiteral(['\n      position: absolute;\n      width: 9px;\n      top: 0px;\n      bottom: 0px;\n      right: 0px;\n    '], ['\n      position: absolute;\n      width: 9px;\n      top: 0px;\n      bottom: 0px;\n      right: 0px;\n    ']),
    _templateObject2 = taggedTemplateLiteral(['\n      position: absolute;\n      background: rgba(0, 0, 0, 0.55);\n      width: 9px;\n      border-radius: 4px;\n      top: 0;\n      z-index: 2;\n      cursor: pointer;\n      opacity: 1;\n      transition: opacity 0.25s linear;\n    '], ['\n      position: absolute;\n      background: rgba(0, 0, 0, 0.55);\n      width: 9px;\n      border-radius: 4px;\n      top: 0;\n      z-index: 2;\n      cursor: pointer;\n      opacity: 1;\n      transition: opacity 0.25s linear;\n    ']);
var VirtualList = function (_Vue) {
    inherits(VirtualList, _Vue);

    function VirtualList() {
        classCallCheck(this, VirtualList);

        var _this = possibleConstructorReturn(this, (VirtualList.__proto__ || Object.getPrototypeOf(VirtualList)).apply(this, arguments));

        _this.viewlist = [];
        _this.scrollHeight = 0;
        _this.containerHeight = 0;
        _this.scrollBarHeight = 0;
        /**
         * 容器高度变化的流
         *
         * @private
         * @memberof VirtualList
         */
        _this.containerHeight$ = new rxjs.BehaviorSubject(0);
        _this.list$ = new rxjs.BehaviorSubject([]);
        _this.subscription = new rxjs.Subscription();
        _this.stateDataSnapshot = [];
        _this.lastFirstIndex = -1;
        // snapshot of actualRows
        _this.actualRowsSnapshot = 0;
        _this.scrollBarTop = 0;
        _this.scrollBarDuring = 0;
        _this.scrollTop$ = new rxjs.BehaviorSubject(0);
        _this.cacheList = [];
        _this.pagination = {
            page: 1,
            pageSize: 20
        };
        return _this;
    }

    createClass(VirtualList, [{
        key: 'listChange',
        value: function listChange(val) {
            if (val && val.length > 0) {
                this.list$.next(val);
            } else {
                this.scrollTop$.next(0);
            }
        }
    }, {
        key: 'mounted',
        value: function mounted() {
            var _this2 = this;

            // 数据加载完毕后，对快照查漏补缺
            this.subscription.add(this.list$.pipe(operators.pairwise(), operators.tap(function (_ref) {
                var _ref2 = slicedToArray(_ref, 2),
                    newList = _ref2[1];

                _this2.stateDataSnapshot.forEach(function (item) {
                    item.origin = newList[item.$index];
                });
            })).subscribe());
            var options$ = rxjs.of(this.options);
            var virtualListElm = this.virtualListRef.elm;
            this.containerHeight$.next(virtualListElm.clientHeight);
            // window resize
            this.subscription.add(rxjs.fromEvent(window, 'resize').pipe(operators.withLatestFrom(options$), operators.map(function (_ref3) {
                var _ref4 = slicedToArray(_ref3, 2),
                    options = _ref4[1];

                options.resize = options.resize === undefined;
                return options;
            }), operators.skipWhile(function (options) {
                return !!!options.resize;
            }),
            // startWith(null),
            operators.debounceTime(200)).subscribe(function () {
                _this2.containerHeight$.next(virtualListElm.clientHeight);
            }));
            // 滚动事件发射
            var scrollWin$ = rxjs.fromEvent(virtualListElm, 'scroll').pipe(operators.map(function (_ref5) {
                var target = _ref5.target;

                return target.scrollTop;
            }), operators.distinctUntilChanged(), operators.startWith(0));
            this.subscription.add(rxjs.fromEvent(this.scrollBarWarpRef.elm, 'mousewheel').subscribe(function (event) {
                virtualListElm.scrollTop = virtualListElm.scrollTop + event.deltaY;
            }));
            this.subscription.add(rxjs.fromEvent(this.scrollBarRef.elm, 'mousedown').subscribe(function (event) {
                event.preventDefault();
                var onset = event.clientY;
                var scrollTop = virtualListElm.scrollTop;
                _this2.subscription.add(rxjs.combineLatest(rxjs.combineLatest(rxjs.fromEvent(document, 'mousemove'), _this2.containerHeight$, scrollHeight$).pipe(operators.tap(function (_ref6) {
                    var _ref7 = slicedToArray(_ref6, 3),
                        event = _ref7[0],
                        containerHeight = _ref7[1],
                        scrollHeight = _ref7[2];

                    var scrollScope = scrollHeight - containerHeight;
                    var offset = event.clientY - onset;
                    virtualListElm.scrollTop = offset / containerHeight * scrollScope + scrollTop;
                })), rxjs.fromEvent(document, 'mouseup')).pipe(operators.takeWhile(function () {
                    return false;
                })).subscribe());
            }));
            // const scrollTop$ = new BehaviorSubject<number>(0);
            // 滚动事件订阅
            this.subscription.add(scrollWin$.subscribe(function (scrollTop) {
                _this2.scrollTop$.next(scrollTop);
            }));
            // 计算滚动方向
            var scrollDirection$ = this.scrollTop$.pipe(operators.pairwise(), operators.map(function (_ref8) {
                var _ref9 = slicedToArray(_ref8, 2),
                    oldTop = _ref9[0],
                    newTop = _ref9[1];

                return newTop - oldTop > 0 ? 1 : -1;
            }), operators.startWith(1));
            // 计算可滚动内容的高度
            var scrollHeight$ = rxjs.combineLatest(this.list$, options$).pipe(operators.map(function (_ref10) {
                var _ref11 = slicedToArray(_ref10, 2),
                    list = _ref11[0],
                    height = _ref11[1].height;

                return list.length * height;
            }));
            var scrollBarHeight$ = rxjs.combineLatest(this.containerHeight$, scrollHeight$).pipe(operators.map(function (_ref12) {
                var _ref13 = slicedToArray(_ref12, 2),
                    containerHeight = _ref13[0],
                    scrollHeight = _ref13[1];

                return containerHeight / scrollHeight * containerHeight;
            }), operators.map(function (scrollBarHeight) {
                return scrollBarHeight < 20 ? 20 : scrollBarHeight;
            }), operators.tap(function (scrollBarHeight) {
                _this2.scrollBarHeight = scrollBarHeight;
            }), operators.startWith(0));
            var scrollBarTop$ = rxjs.combineLatest(scrollBarHeight$, this.scrollTop$, this.containerHeight$, scrollHeight$).pipe(operators.map(function (_ref14) {
                var _ref15 = slicedToArray(_ref14, 4),
                    scrollBarHeight = _ref15[0],
                    scrollTop = _ref15[1],
                    containerHeight = _ref15[2],
                    scrollHeight = _ref15[3];

                var scrollScope = scrollHeight - containerHeight;
                var scrollBarScope = containerHeight - scrollBarHeight;
                return scrollBarScope * (scrollTop / scrollScope);
            }));
            this.subscription.add(scrollBarHeight$.subscribe());
            var scrollBarDuring$ = new rxjs.BehaviorSubject(0);
            this.subscription.add(scrollBarTop$.pipe(operators.tap(function () {
                scrollBarDuring$.next(1);
            }), operators.debounceTime(1000)).subscribe(function () {
                scrollBarDuring$.next(0);
            }));
            this.subscription.add(scrollBarDuring$.pipe(operators.distinctUntilChanged(), operators.tap(function (scrollBarDuring) {
                _this2.scrollBarDuring = scrollBarDuring;
            })).subscribe());
            this.subscription.add(scrollBarTop$.subscribe(function (scrollBarTop) {
                _this2.scrollBarTop = scrollBarTop;
            }));
            // 滚动触发加载
            var scrolling$ = rxjs.combineLatest(this.scrollTop$, scrollDirection$).pipe(operators.map(function (_ref16) {
                var _ref17 = slicedToArray(_ref16, 2),
                    scrollTop = _ref17[0],
                    dir = _ref17[1];

                return [scrollTop, dir];
            }));
            // 计算上拉加载
            var pullUpLoad$ = rxjs.defer(function () {
                // 防止重复触发
                var pullUpping = false;
                return rxjs.combineLatest(scrolling$, _this2.containerHeight$, scrollHeight$).pipe(operators.map(function (_ref18) {
                    var _ref19 = slicedToArray(_ref18, 3),
                        _ref19$ = slicedToArray(_ref19[0], 2),
                        scrollTop = _ref19$[0],
                        dir = _ref19$[1],
                        ch = _ref19[1],
                        scrollHeight = _ref19[2];

                    return dir > 0 && scrollHeight - (scrollTop + ch) < ch * 1;
                }), operators.filter(function (state) {
                    if (state && !pullUpping) {
                        _this2.pullUpLoad && _this2.pullUpLoad({ pagination: _this2.pagination }).then(function (list) {
                            var _cacheList;

                            (_cacheList = _this2.cacheList).push.apply(_cacheList, toConsumableArray(list));
                            if (_this2.sourceHandle) {
                                _this2.list$.next(_this2.sourceHandle(_this2.cacheList));
                            } else {
                                _this2.list$.next(_this2.cacheList);
                            }
                            _this2.pagination.page += 1;
                            pullUpping = false;
                        });
                    }
                    return state;
                }), operators.tap(function () {
                    pullUpping = true;
                }));
            });
            // 订阅滚动加载
            this.subscription.add(rxjs.combineLatest(pullUpLoad$).subscribe(function () {}));
            // 根据容器高度与给定的 item 高度，计算出实际应创建的 行数量
            var actualRows$ = rxjs.combineLatest(this.containerHeight$, options$).pipe(operators.map(function (_ref20) {
                var _ref21 = slicedToArray(_ref20, 2),
                    ch = _ref21[0],
                    option = _ref21[1];

                return Math.ceil(ch / option.height) + (option.spare || 1);
            }), operators.tap(function (count) {}));
            var shouldUpdate$ = rxjs.combineLatest(this.scrollTop$.pipe(operators.map(function (scrollTop) {
                return scrollTop;
            })), this.list$, options$, actualRows$).pipe(
            // 计算当前列表中最顶部的索引
            operators.map(function (_ref22) {
                var _ref23 = slicedToArray(_ref22, 4),
                    scrollTop = _ref23[0],
                    list = _ref23[1],
                    height = _ref23[2].height,
                    actualRows = _ref23[3];

                var firstIndex = Math.floor(scrollTop / height);
                // the first index of the virtualList on the last screen, if < 0, reset to 0
                var maxIndex = list.length - actualRows < 0 ? 0 : list.length - actualRows;
                return [firstIndex > maxIndex ? maxIndex : firstIndex, actualRows];
            }),
            // 如果索引有改变，才触发重新 render
            operators.filter(function (_ref24) {
                var _ref25 = slicedToArray(_ref24, 2),
                    curIndex = _ref25[0],
                    actualRows = _ref25[1];

                return curIndex !== _this2.lastFirstIndex || actualRows !== _this2.actualRowsSnapshot;
            }),
            // update the index
            operators.tap(function (_ref26) {
                var _ref27 = slicedToArray(_ref26, 1),
                    curIndex = _ref27[0];

                return _this2.lastFirstIndex = curIndex;
            }), operators.map(function (_ref28) {
                var _ref29 = slicedToArray(_ref28, 2),
                    firstIndex = _ref29[0],
                    actualRows = _ref29[1];

                var lastIndex = firstIndex + actualRows - 1;
                return [firstIndex, lastIndex];
            }));
            // 计算当前需要的数据区块
            var dataInViewSlice$ = rxjs.combineLatest(this.list$, options$, shouldUpdate$).pipe(operators.withLatestFrom(scrollDirection$, actualRows$), operators.map(function (_ref30) {
                var _ref31 = slicedToArray(_ref30, 3),
                    _ref31$ = slicedToArray(_ref31[0], 3),
                    list = _ref31$[0],
                    height = _ref31$[1].height,
                    _ref31$$ = slicedToArray(_ref31$[2], 2),
                    firstIndex = _ref31$$[0],
                    lastIndex = _ref31$$[1],
                    dir = _ref31[1],
                    actualRows = _ref31[2];

                var dataSlice = _this2.stateDataSnapshot;
                if (!dataSlice.length || dataSlice.length < lastIndex + 1 || actualRows !== _this2.actualRowsSnapshot) {
                    if (actualRows !== _this2.actualRowsSnapshot) {
                        _this2.actualRowsSnapshot = actualRows;
                    }
                    return _this2.stateDataSnapshot = list.slice(firstIndex, lastIndex + 1).map(function (item) {
                        return {
                            origin: item,
                            $pos: firstIndex * height,
                            $index: firstIndex++
                        };
                    });
                }
                // 拿到不需要显示的内容块，回收利用
                var diffSliceIndexes = _this2.getDifferenceIndexes(dataSlice, firstIndex, lastIndex);
                var newIndex = dir > 0 ? lastIndex - diffSliceIndexes.length + 1 : firstIndex;
                diffSliceIndexes.forEach(function (index) {
                    var item = dataSlice[index];
                    item.origin = list[newIndex];
                    item.$pos = newIndex * height;
                    item.$index = newIndex++;
                });
                return _this2.stateDataSnapshot = dataSlice;
            }));
            this.subscription.add(rxjs.combineLatest(dataInViewSlice$, scrollHeight$).subscribe(function (_ref32) {
                var _ref33 = slicedToArray(_ref32, 2),
                    list = _ref33[0],
                    scrollHeight = _ref33[1];

                _this2.viewlist = list;
                _this2.scrollHeight = scrollHeight;
            }));
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            var _this3 = this;

            this.pagination = {
                page: 1,
                pageSize: 20
            };
            var virtualListElm = this.virtualListRef.elm;
            virtualListElm.scrollTop = 0;
            this.pullUpLoad && this.pullUpLoad({ pagination: this.pagination }).then(function (list) {
                var _cacheList2;

                _this3.cacheList = [];
                (_cacheList2 = _this3.cacheList).push.apply(_cacheList2, toConsumableArray(list));
                if (_this3.sourceHandle) {
                    _this3.list$.next(_this3.sourceHandle(_this3.cacheList));
                } else {
                    _this3.list$.next(_this3.cacheList);
                }
                _this3.pagination.page += 1;
            });
        }
    }, {
        key: 'delete',
        value: function _delete(item, key) {
            _.remove(this.cacheList, function (el) {
                console.log(el);
                return el[key] == item[key];
            });
        }
    }, {
        key: 'getDifferenceIndexes',
        value: function getDifferenceIndexes(slice, firstIndex, lastIndex) {
            var indexes = [];
            slice.forEach(function (item, i) {
                if (item.$index < firstIndex || item.$index > lastIndex) {
                    indexes.push(i);
                }
            });
            return indexes;
        }
    }, {
        key: 'render',
        value: function render(h) {
            var _this4 = this;

            this.virtualListRef = h(
                'div',
                { 'class': 'scrollarp', style: 'float: left;overflow:auto;height: 100%;width: 100%;padding-right: 18px;box-sizing: content-box;' },
                [h(
                    'div',
                    { style: { position: 'relative', height: this.scrollHeight + 'px' } },
                    [this.viewlist.map(function (data, i) {
                        return h(
                            'div',
                            { key: i, style: {
                                    position: 'absolute',
                                    width: '100%',
                                    transform: 'translateY(' + data.$pos + 'px)'
                                } },
                            [_this4.$scopedSlots.default(data.origin)]
                        );
                    })]
                )]
            );
            this.scrollBarRef = h('scroll-bar', { style: {
                    'opacity': this.scrollBarDuring,
                    'height': this.scrollBarHeight + 'px',
                    'top': '0px',
                    'transform': 'translateY(' + this.scrollBarTop + 'px)',
                    'right': '0'
                } });
            this.scrollBarWarpRef = h('scroll-bar-warp', [this.scrollBarRef]);
            return h(
                'div',
                { style: 'position: relative;overflow: hidden;height: 100%;' },
                [this.virtualListRef, this.scrollBarWarpRef]
            );
        }
    }]);
    return VirtualList;
}(vuePropertyDecorator.Vue);
__decorate([vuePropertyDecorator.Prop({
    required: false,
    default: function _default() {
        return [];
    }
})], VirtualList.prototype, "list", void 0);
__decorate([vuePropertyDecorator.Prop()], VirtualList.prototype, "options", void 0);
__decorate([vuePropertyDecorator.Watch('list', {
    deep: true,
    immediate: true
})], VirtualList.prototype, "listChange", null);
__decorate([vuePropertyDecorator.Prop()], VirtualList.prototype, "pullUpLoad", void 0);
__decorate([vuePropertyDecorator.Prop()], VirtualList.prototype, "sourceHandle", void 0);
VirtualList = __decorate([vuePropertyDecorator.Component({
    components: {
        scrollBarWarp: styled.div(_templateObject),
        scrollBar: styled.div(_templateObject2)
    }
})], VirtualList);
var VirtualList$1 = VirtualList;

exports.default = VirtualList$1;
//# sourceMappingURL=index.js.map
