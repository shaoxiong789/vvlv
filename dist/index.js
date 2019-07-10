'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var vuePropertyDecorator = require('vue-property-decorator');
var rxjs = require('rxjs');
var operators = require('rxjs/operators');
var styled = _interopDefault(require('vue-styled-components'));

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
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

let VirtualList = class VirtualList extends vuePropertyDecorator.Vue {
    constructor() {
        super(...arguments);
        this.viewlist = [];
        this.scrollHeight = 0;
        this.containerHeight = 0;
        this.scrollBarHeight = 0;
        /**
         * 容器高度变化的流
         *
         * @private
         * @memberof VirtualList
         */
        this.containerHeight$ = new rxjs.BehaviorSubject(0);
        this.list$ = new rxjs.BehaviorSubject([]);
        this.subscription = new rxjs.Subscription();
        this.stateDataSnapshot = [];
        this.lastFirstIndex = -1;
        // snapshot of actualRows
        this.actualRowsSnapshot = 0;
        this.scrollBarTop = 0;
        this.scrollBarDuring = 0;
    }
    listChange() {
        this.list$.next(this.list);
    }
    mounted() {
        this.list$.next(this.list);
        // 数据加载完毕后，对快照查漏补缺
        this.subscription.add(this.list$.pipe(operators.pairwise(), operators.tap(([, newList]) => {
            this.stateDataSnapshot.forEach(item => {
                item.origin = newList[item.$index];
            });
        })).subscribe());
        const options$ = rxjs.of(this.options);
        const virtualListElm = this.virtualListRef.elm;
        this.containerHeight$.next(virtualListElm.clientHeight);
        // window resize
        this.subscription.add(rxjs.fromEvent(window, 'resize').pipe(operators.withLatestFrom(options$), operators.map(([, options]) => {
            options.resize = options.resize === undefined;
            return options;
        }), operators.skipWhile(options => !!!options.resize),
        // startWith(null),
        operators.debounceTime(200)).subscribe(() => {
            this.containerHeight$.next(virtualListElm.clientHeight);
        }));
        // 滚动事件发射
        const scrollWin$ = rxjs.fromEvent(virtualListElm, 'scroll').pipe(operators.map(({ target }) => {
            return target.scrollTop;
        }), operators.distinctUntilChanged(), operators.startWith(0));
        this.$nextTick(() => {
            virtualListElm.scrollTop = 1000;
        });
        this.subscription.add(rxjs.fromEvent(this.scrollBarWarpRef.elm, 'mousewheel').subscribe(event => {
            virtualListElm.scrollTop = virtualListElm.scrollTop + event.deltaY;
        }));
        this.subscription.add(rxjs.fromEvent(this.scrollBarRef.elm, 'mousedown').subscribe(event => {
            event.preventDefault();
            const onset = event.clientY;
            const scrollTop = virtualListElm.scrollTop;
            this.subscription.add(rxjs.combineLatest(rxjs.combineLatest(rxjs.fromEvent(document, 'mousemove'), this.containerHeight$, scrollHeight$).pipe(operators.tap(([event, containerHeight, scrollHeight]) => {
                const scrollScope = scrollHeight - containerHeight;
                const offset = event.clientY - onset;
                virtualListElm.scrollTop = offset / containerHeight * scrollScope + scrollTop;
            })), rxjs.fromEvent(document, 'mouseup')).pipe(operators.takeWhile(() => {
                return false;
            })).subscribe());
        }));
        const scrollTop$ = new rxjs.BehaviorSubject(0);
        // 滚动事件订阅
        this.subscription.add(scrollWin$.subscribe(scrollTop => {
            scrollTop$.next(scrollTop);
        }));
        // 计算滚动方向
        const scrollDirection$ = scrollTop$.pipe(operators.pairwise(), operators.map(([oldTop, newTop]) => {
            return newTop - oldTop > 0 ? 1 : -1;
        }), operators.startWith(1));
        // 计算可滚动内容的高度
        const scrollHeight$ = rxjs.combineLatest(this.list$, options$).pipe(operators.map(([list, { height }]) => {
            return list.length * height;
        }));
        const scrollBarHeight$ = rxjs.combineLatest(this.containerHeight$, scrollHeight$).pipe(operators.map(([containerHeight, scrollHeight]) => {
            return containerHeight / scrollHeight * containerHeight;
        }), operators.map(scrollBarHeight => {
            return scrollBarHeight < 20 ? 20 : scrollBarHeight;
        }), operators.tap(scrollBarHeight => {
            this.scrollBarHeight = scrollBarHeight;
        }), operators.startWith(0));
        const scrollBarTop$ = rxjs.combineLatest(scrollBarHeight$, scrollTop$, this.containerHeight$, scrollHeight$).pipe(operators.map(([scrollBarHeight, scrollTop, containerHeight, scrollHeight]) => {
            const scrollScope = scrollHeight - containerHeight;
            const scrollBarScope = containerHeight - scrollBarHeight;
            return scrollBarScope * (scrollTop / scrollScope);
        }));
        this.subscription.add(scrollBarHeight$.subscribe());
        const scrollBarDuring$ = new rxjs.BehaviorSubject(0);
        this.subscription.add(scrollBarTop$.pipe(operators.tap(() => {
            scrollBarDuring$.next(1);
        }), operators.debounceTime(1000)).subscribe(() => {
            scrollBarDuring$.next(0);
        }));
        this.subscription.add(scrollBarDuring$.pipe(operators.distinctUntilChanged(), operators.tap(scrollBarDuring => {
            this.scrollBarDuring = scrollBarDuring;
        })).subscribe());
        this.subscription.add(scrollBarTop$.subscribe(scrollBarTop => {
            this.scrollBarTop = scrollBarTop;
        }));
        // 滚动触发加载
        const scrolling$ = rxjs.combineLatest(scrollTop$, scrollDirection$).pipe(operators.map(([scrollTop, dir]) => [scrollTop, dir]));
        // 计算上拉加载
        const pullUpLoad$ = rxjs.defer(() => {
            // 防止重复触发
            let pullUpping = false;
            return rxjs.combineLatest(scrolling$, this.containerHeight$, scrollHeight$).pipe(operators.map(([[scrollTop, dir], ch, scrollHeight]) => {
                return dir > 0 && scrollHeight - (scrollTop + ch) < ch * 1;
            }), operators.filter(state => {
                if (!state) {
                    pullUpping = false;
                }
                return !pullUpping && state;
            }), operators.tap(() => {
                pullUpping = true;
            }));
        });
        // 订阅滚动加载
        this.subscription.add(rxjs.combineLatest(pullUpLoad$).subscribe(() => {
            this.$emit('pullUpLoad');
        }));
        // 根据容器高度与给定的 item 高度，计算出实际应创建的 行数量
        const actualRows$ = rxjs.combineLatest(this.containerHeight$, options$).pipe(operators.map(([ch, option]) => Math.ceil(ch / option.height) + (option.spare || 1)), operators.tap(count => {}));
        const shouldUpdate$ = rxjs.combineLatest(scrollTop$.pipe(operators.map(scrollTop => scrollTop)), this.list$, options$, actualRows$).pipe(
        // 计算当前列表中最顶部的索引
        operators.map(([scrollTop, list, { height }, actualRows]) => {
            const firstIndex = Math.floor(scrollTop / height);
            // the first index of the virtualList on the last screen, if < 0, reset to 0
            const maxIndex = list.length - actualRows < 0 ? 0 : list.length - actualRows;
            return [firstIndex > maxIndex ? maxIndex : firstIndex, actualRows];
        }),
        // 如果索引有改变，才触发重新 render
        operators.filter(([curIndex, actualRows]) => curIndex !== this.lastFirstIndex || actualRows !== this.actualRowsSnapshot),
        // update the index
        operators.tap(([curIndex]) => this.lastFirstIndex = curIndex), operators.map(([firstIndex, actualRows]) => {
            const lastIndex = firstIndex + actualRows - 1;
            return [firstIndex, lastIndex];
        }));
        // 计算当前需要的数据区块
        const dataInViewSlice$ = rxjs.combineLatest(this.list$, options$, shouldUpdate$).pipe(operators.withLatestFrom(scrollDirection$, actualRows$), operators.map(([[list, { height }, [firstIndex, lastIndex]], dir, actualRows]) => {
            const dataSlice = this.stateDataSnapshot;
            if (!dataSlice.length || actualRows !== this.actualRowsSnapshot) {
                if (actualRows !== this.actualRowsSnapshot) {
                    this.actualRowsSnapshot = actualRows;
                }
                return this.stateDataSnapshot = list.slice(firstIndex, lastIndex + 1).map(item => ({
                    origin: item,
                    $pos: firstIndex * height,
                    $index: firstIndex++
                }));
            }
            // 拿到不需要显示的内容块，回收利用
            const diffSliceIndexes = this.getDifferenceIndexes(dataSlice, firstIndex, lastIndex);
            let newIndex = dir > 0 ? lastIndex - diffSliceIndexes.length + 1 : firstIndex;
            diffSliceIndexes.forEach(index => {
                const item = dataSlice[index];
                item.origin = list[newIndex];
                item.$pos = newIndex * height;
                item.$index = newIndex++;
            });
            return this.stateDataSnapshot = dataSlice;
        }));
        this.subscription.add(rxjs.combineLatest(dataInViewSlice$, scrollHeight$).subscribe(([list, scrollHeight]) => {
            this.viewlist = list;
            this.scrollHeight = scrollHeight;
        }));
    }
    getDifferenceIndexes(slice, firstIndex, lastIndex) {
        const indexes = [];
        slice.forEach((item, i) => {
            if (item.$index < firstIndex || item.$index > lastIndex) {
                indexes.push(i);
            }
        });
        return indexes;
    }
    render(h) {
        this.virtualListRef = h(
            'div',
            { 'class': 'scrollarp', style: 'float: left;overflow:auto;height: 100%;width: 100%;padding-right: 18px;box-sizing: content-box;' },
            [h(
                'div',
                { style: { position: 'relative', height: `${this.scrollHeight}px` } },
                [this.viewlist.map((data, i) => {
                    return h(
                        'div',
                        { key: i, style: {
                                position: 'absolute',
                                width: '100%',
                                transform: `translateY(${data.$pos}px)`
                            } },
                        [this.$scopedSlots.default(data.origin)]
                    );
                })]
            )]
        );
        this.scrollBarRef = h('scroll-bar', { style: {
                'opacity': this.scrollBarDuring,
                'height': `${this.scrollBarHeight}px`,
                'top': `0px`,
                'transform': `translateY(${this.scrollBarTop}px)`,
                'right': '0'
            } });
        this.scrollBarWarpRef = h('scroll-bar-warp', [this.scrollBarRef]);
        return h(
            'div',
            { style: 'position: relative;overflow: hidden;height: 100%;' },
            [this.virtualListRef, this.scrollBarWarpRef]
        );
    }
};
__decorate([vuePropertyDecorator.Prop({
    required: true,
    default() {
        return [];
    }
})], VirtualList.prototype, "list", void 0);
__decorate([vuePropertyDecorator.Prop()], VirtualList.prototype, "options", void 0);
__decorate([vuePropertyDecorator.Watch('list', {
    deep: true
})], VirtualList.prototype, "listChange", null);
VirtualList = __decorate([vuePropertyDecorator.Component({
    components: {
        scrollBarWarp: styled.div`
      position: absolute;
      width: 9px;
      top: 0px;
      bottom: 0px;
      right: 0px;
    `,
        scrollBar: styled.div`
      position: absolute;
      background: rgba(0, 0, 0, 0.55);
      width: 9px;
      border-radius: 4px;
      top: 0;
      z-index: 2;
      cursor: pointer;
      opacity: 1;
      transition: opacity 0.25s linear;
    `
    }
})], VirtualList);
var VirtualList$1 = VirtualList;

exports.default = VirtualList$1;
//# sourceMappingURL=index.js.map
