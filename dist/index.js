'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vuePropertyDecorator = require('vue-property-decorator');
var rxjs = require('rxjs');
var operators = require('rxjs/operators');

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
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

var VirtualList = /** @class */function (_super) {
    __extends(VirtualList, _super);
    function VirtualList() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.viewlist = [];
        _this.scrollHeight = 0;
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
        return _this;
    }
    VirtualList.prototype.listChange = function () {
        this.list$.next(this.list);
    };
    VirtualList.prototype.mounted = function () {
        var _this = this;
        this.list$.next(this.list);
        // 数据加载完毕后，对快照查漏补缺
        this.subscription.add(this.list$.pipe(operators.pairwise(), operators.tap(function (_a) {
            var newList = _a[1];
            _this.stateDataSnapshot.forEach(function (item) {
                item.origin = newList[item.$index];
            });
        })).subscribe());
        var options$ = rxjs.of(this.options);
        var virtualListElm = this.virtualListRef.elm;
        this.containerHeight$.next(virtualListElm.clientHeight);
        // window resize
        this.subscription.add(rxjs.fromEvent(window, 'resize').pipe(operators.withLatestFrom(options$), operators.map(function (_a) {
            var options = _a[1];
            options.resize = options.resize === undefined;
            return options;
        }), operators.skipWhile(function (options) {
            return !!!options.resize;
        }),
        // startWith(null),
        operators.debounceTime(200)).subscribe(function () {
            _this.containerHeight$.next(virtualListElm.clientHeight);
        }));
        // 滚动事件发射
        var scrollWin$ = rxjs.fromEvent(virtualListElm, 'scroll').pipe(operators.map(function () {
            return virtualListElm.scrollTop;
        }), operators.pairwise(), operators.filter(function (_a) {
            var oldY = _a[0],
                newY = _a[1];
            return newY !== oldY;
        }), operators.map(function (_a) {
            var y = _a[1];
            return y;
        }), operators.startWith(0));
        // 计算滚动位置
        var scrollTop$ = scrollWin$.pipe(operators.map(function (scrollTop) {
            return scrollTop;
        }));
        // 计算滚动方向
        var scrollDirection$ = scrollTop$.pipe(operators.pairwise(), operators.map(function (_a) {
            var oldTop = _a[0],
                newTop = _a[1];
            return newTop - oldTop > 0 ? 1 : -1;
        }), operators.startWith(1));
        // 计算可滚动内容的高度
        var scrollHeight$ = rxjs.combineLatest(this.list$, options$).pipe(operators.map(function (_a) {
            var list = _a[0],
                height = _a[1].height;
            return list.length * height;
        }));
        // 滚动触发加载
        var scrolling$ = rxjs.combineLatest(scrollTop$, scrollDirection$).pipe(operators.map(function (_a) {
            var scrollTop = _a[0],
                dir = _a[1];
            return [scrollTop, dir];
        }));
        // 计算上拉加载
        var pullUpLoad$ = rxjs.defer(function () {
            // 防止重复触发
            var pullUpping = false;
            return rxjs.combineLatest(scrolling$, _this.containerHeight$, scrollHeight$).pipe(operators.map(function (_a) {
                var _b = _a[0],
                    scrollTop = _b[0],
                    dir = _b[1],
                    ch = _a[1],
                    scrollHeight = _a[2];
                return dir > 0 && scrollHeight - (scrollTop + ch) < ch * 1;
            }), operators.filter(function (state) {
                if (!state) {
                    pullUpping = false;
                }
                return !pullUpping && state;
            }), operators.tap(function () {
                pullUpping = true;
            }));
        });
        // 订阅滚动加载
        this.subscription.add(rxjs.combineLatest(pullUpLoad$).subscribe(function () {
            _this.$emit('pullUpLoad');
        }));
        // 根据容器高度与给定的 item 高度，计算出实际应创建的 行数量
        var actualRows$ = rxjs.combineLatest(this.containerHeight$, options$).pipe(operators.map(function (_a) {
            var ch = _a[0],
                option = _a[1];
            return Math.ceil(ch / option.height) + (option.spare || 1);
        }), operators.tap(function (count) {}));
        var shouldUpdate$ = rxjs.combineLatest(scrollWin$.pipe(operators.map(function (scrollTop) {
            return scrollTop;
        })), this.list$, options$, actualRows$).pipe(
        // 计算当前列表中最顶部的索引
        operators.map(function (_a) {
            var scrollTop = _a[0],
                list = _a[1],
                height = _a[2].height,
                actualRows = _a[3];
            var firstIndex = Math.floor(scrollTop / height);
            // the first index of the virtualList on the last screen, if < 0, reset to 0
            var maxIndex = list.length - actualRows < 0 ? 0 : list.length - actualRows;
            return [firstIndex > maxIndex ? maxIndex : firstIndex, actualRows];
        }),
        // 如果索引有改变，才触发重新 render
        operators.filter(function (_a) {
            var curIndex = _a[0],
                actualRows = _a[1];
            return curIndex !== _this.lastFirstIndex || actualRows !== _this.actualRowsSnapshot;
        }),
        // update the index
        operators.tap(function (_a) {
            var curIndex = _a[0];
            return _this.lastFirstIndex = curIndex;
        }), operators.map(function (_a) {
            var firstIndex = _a[0],
                actualRows = _a[1];
            var lastIndex = firstIndex + actualRows - 1;
            return [firstIndex, lastIndex];
        }));
        // 计算当前需要的数据区块
        var dataInViewSlice$ = rxjs.combineLatest(this.list$, options$, shouldUpdate$).pipe(operators.withLatestFrom(scrollDirection$, actualRows$), operators.map(function (_a) {
            var _b = _a[0],
                list = _b[0],
                height = _b[1].height,
                _c = _b[2],
                firstIndex = _c[0],
                lastIndex = _c[1],
                dir = _a[1],
                actualRows = _a[2];
            var dataSlice = _this.stateDataSnapshot;
            if (!dataSlice.length || actualRows !== _this.actualRowsSnapshot) {
                if (actualRows !== _this.actualRowsSnapshot) {
                    _this.actualRowsSnapshot = actualRows;
                }
                return _this.stateDataSnapshot = list.slice(firstIndex, lastIndex + 1).map(function (item) {
                    return {
                        origin: item,
                        $pos: firstIndex * height,
                        $index: firstIndex++
                    };
                });
            }
            // 拿到不需要显示的内容块，回收利用
            var diffSliceIndexes = _this.getDifferenceIndexes(dataSlice, firstIndex, lastIndex);
            var newIndex = dir > 0 ? lastIndex - diffSliceIndexes.length + 1 : firstIndex;
            diffSliceIndexes.forEach(function (index) {
                var item = dataSlice[index];
                item.origin = list[newIndex];
                item.$pos = newIndex * height;
                item.$index = newIndex++;
            });
            return _this.stateDataSnapshot = dataSlice;
        }));
        this.subscription.add(rxjs.combineLatest(dataInViewSlice$, scrollHeight$).subscribe(function (_a) {
            var list = _a[0],
                scrollHeight = _a[1];
            _this.viewlist = list;
            _this.scrollHeight = scrollHeight;
        }));
    };
    VirtualList.prototype.getDifferenceIndexes = function (slice, firstIndex, lastIndex) {
        var indexes = [];
        slice.forEach(function (item, i) {
            if (item.$index < firstIndex || item.$index > lastIndex) {
                indexes.push(i);
            }
        });
        return indexes;
    };
    VirtualList.prototype.render = function (h) {
        var _this = this;
        this.virtualListRef = h(
            'div',
            { style: 'overflow:auto;' },
            [h(
                'div',
                { style: { position: 'relative', height: this.scrollHeight + "px" } },
                [this.viewlist.map(function (data, i) {
                    return h(
                        'div',
                        { key: i, style: {
                                position: 'absolute',
                                width: '100%',
                                transform: "translateY(" + data.$pos + "px)"
                            } },
                        [_this.$scopedSlots.default(data.origin)]
                    );
                })]
            )]
        );
        return this.virtualListRef;
    };
    __decorate([vuePropertyDecorator.Prop({
        required: true,
        default: function () {
            return [];
        }
    })], VirtualList.prototype, "list", void 0);
    __decorate([vuePropertyDecorator.Prop()], VirtualList.prototype, "options", void 0);
    __decorate([vuePropertyDecorator.Watch('list', {
        deep: true
    })], VirtualList.prototype, "listChange", null);
    VirtualList = __decorate([vuePropertyDecorator.Component({})], VirtualList);
    return VirtualList;
}(vuePropertyDecorator.Vue);

exports.default = VirtualList;
//# sourceMappingURL=index.js.map
