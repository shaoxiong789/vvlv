import {Component,Vue, Watch, Prop} from 'vue-property-decorator';
import {of, defer, fromEvent, BehaviorSubject, Subscription, combineLatest } from 'rxjs'
import { map, distinctUntilChanged, tap, debounceTime, skipWhile, startWith, filter, withLatestFrom, pairwise, takeWhile } from 'rxjs/operators'
import { VNode, CreateElement } from 'vue';
import styled from 'vue-styled-components';

interface IVirtualListOptions {
  height: number
  spare: number
  resize?: boolean 
}

@Component({
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
})
export default class VirtualList extends Vue {

  @Prop({
    required: true,
    default() {
      return [];
    }
  })
  list!: Array<any>;

  @Prop()
  options!: IVirtualListOptions;

  viewlist: Array<any> = []

  scrollHeight:number = 0

  containerHeight:number = 0

  scrollBarHeight:number = 0;
  /**
   * 容器高度变化的流
   *
   * @private
   * @memberof VirtualList
   */
  private containerHeight$ = new BehaviorSubject<number>(0);

  private list$:BehaviorSubject<any[]> = new BehaviorSubject<any>([])

  private subscription = new Subscription();

  private virtualListRef!: VNode;
  
  private stateDataSnapshot:Array<any> = []

  private lastFirstIndex = -1

  // snapshot of actualRows
  private actualRowsSnapshot: number = 0;

  scrollBarTop: number = 0;

  scrollBarDuring:number = 0;

  private scrollBarWarpRef!: VNode;

  private scrollBarRef!: VNode;

  @Watch('list', {
    deep: true
  })
  listChange() {
    this.list$.next(this.list)
  }

  mounted() {
    this.list$.next(this.list)

    // 数据加载完毕后，对快照查漏补缺
    this.subscription.add(
      this.list$.pipe(
        pairwise(),
        tap(([, newList]) => {
          this.stateDataSnapshot.forEach((item) => {
            item.origin = newList[item.$index]
          })
        })
      )
      .subscribe()
    )

    const options$ = of(this.options)

    const virtualListElm = this.virtualListRef.elm as HTMLElement;

    this.containerHeight$.next(virtualListElm.clientHeight)

    // window resize
    this.subscription.add(
      fromEvent(window, 'resize')
        .pipe(
          withLatestFrom(options$),
          map(([,options]) => {
            options.resize = options.resize === undefined
            return options
          }),
          skipWhile((options) => !!!options.resize),
          // startWith(null),
          debounceTime(200)
        )
        .subscribe(() => {
          this.containerHeight$.next(virtualListElm.clientHeight)
        })
    );

    // 滚动事件发射
    const scrollWin$ = fromEvent(virtualListElm, 'scroll').pipe(
      map(({target}) => {
        return (target as HTMLElement).scrollTop
      }),
      distinctUntilChanged(),
      startWith(0)
    )

    this.subscription.add(
      fromEvent(this.scrollBarWarpRef.elm as HTMLElement, 'mousewheel')
      .subscribe((event) => {
        virtualListElm.scrollTop = virtualListElm.scrollTop + (event as WheelEvent).deltaY;
      })
    )

    this.subscription.add(
      fromEvent(this.scrollBarRef.elm as HTMLElement, 'mousedown')
      .subscribe((event) => { 
        event.preventDefault();
        const onset = (event as MouseEvent).clientY;
        const scrollTop = virtualListElm.scrollTop;
        this.subscription.add(
          combineLatest(
            combineLatest(fromEvent(document as Document, 'mousemove'), this.containerHeight$, scrollHeight$).pipe(
              tap(([event, containerHeight, scrollHeight]) => {
                const scrollScope = scrollHeight - containerHeight;
                const offset = (event as MouseEvent).clientY - onset
                virtualListElm.scrollTop = (offset / containerHeight) * scrollScope + scrollTop
              })
            ),
            fromEvent(document as Document, 'mouseup')
          ).pipe(
            takeWhile(() => {
              return false;
            })
          )
          .subscribe()
        )
      })
    )


    const scrollTop$ = new BehaviorSubject<number>(0);

    // 滚动事件订阅
    this.subscription.add(scrollWin$
      .subscribe((scrollTop) => {
        scrollTop$.next(scrollTop)
      })
    )

    // 计算滚动方向
    const scrollDirection$ = scrollTop$.pipe(
      pairwise(),
      map(([oldTop, newTop]) => {
        return newTop - oldTop > 0 ? 1 : -1
      }),
      startWith(1)
    );

    // 计算可滚动内容的高度
    const scrollHeight$ = combineLatest(this.list$, options$).pipe(
      map(([list, { height }]) => {
        return list.length * height
      })
    )

    const scrollBarHeight$ = combineLatest(this.containerHeight$, scrollHeight$).pipe(
      map(([containerHeight, scrollHeight]) => {
        return (containerHeight / scrollHeight) * containerHeight
      }),
      map((scrollBarHeight) => {
        return scrollBarHeight < 20 ? 20 :  scrollBarHeight
      }),
      tap((scrollBarHeight) => {
        this.scrollBarHeight = scrollBarHeight;
      }),
      startWith(0)
    )

    const scrollBarTop$ = combineLatest(scrollBarHeight$, scrollTop$, this.containerHeight$, scrollHeight$).pipe(
      map(([scrollBarHeight, scrollTop, containerHeight, scrollHeight]) => {
        const scrollScope = scrollHeight - containerHeight;
        const scrollBarScope = containerHeight - scrollBarHeight;
        return scrollBarScope * (scrollTop / scrollScope)
      })
    )

    this.subscription.add(scrollBarHeight$
      .subscribe()
    )

    const scrollBarDuring$ = new BehaviorSubject<number>(0);

    this.subscription.add(scrollBarTop$.pipe(
      tap(() => {
        scrollBarDuring$.next(1);
      }),
      debounceTime(1000)
    ).subscribe(() => {
      scrollBarDuring$.next(0);
    }))

    this.subscription.add(scrollBarDuring$.pipe(
      distinctUntilChanged(),
      tap((scrollBarDuring) => {
        this.scrollBarDuring = scrollBarDuring;
      })
    ).subscribe())


    
    this.subscription.add(scrollBarTop$.subscribe(
      (scrollBarTop) => {
        this.scrollBarTop = scrollBarTop;
      }
    ))
    

    // 滚动触发加载
    const scrolling$ = combineLatest(scrollTop$, scrollDirection$).pipe(
      map(([scrollTop, dir]) => [scrollTop, dir])
    )

    // 计算上拉加载
    const pullUpLoad$ = defer(() => {
      // 防止重复触发
      let pullUpping = false;
      return combineLatest(scrolling$, this.containerHeight$, scrollHeight$).pipe(
        map(([[scrollTop, dir], ch, scrollHeight]) => {
          return dir > 0 && (scrollHeight - (scrollTop + ch)) < (ch * 1);
        }),
        filter((state) => {
          if(!state) {
            pullUpping = false
          }
          return !pullUpping && state
        }),
        tap(() => {
          pullUpping = true
        })
      )
    });

    // 订阅滚动加载
    this.subscription.add(
      combineLatest(pullUpLoad$)
        .subscribe(() => {
          this.$emit('pullUpLoad')
        })
    )

    
    // 根据容器高度与给定的 item 高度，计算出实际应创建的 行数量
    const actualRows$ = combineLatest(this.containerHeight$, options$).pipe(
      map(([ch, option]) => Math.ceil(ch / option.height) + (option.spare || 1)),
      tap((count) => {
      })
    )

    const shouldUpdate$ = combineLatest(
      scrollTop$.pipe(map((scrollTop) => scrollTop)),
      this.list$,
      options$,
      actualRows$
    ).pipe(
      // 计算当前列表中最顶部的索引
      map(([scrollTop, list, { height }, actualRows]) => {
        const firstIndex = Math.floor(scrollTop / height)
        // the first index of the virtualList on the last screen, if < 0, reset to 0
        const maxIndex = list.length - actualRows < 0 ? 0 : list.length - actualRows;
        return [firstIndex > maxIndex ? maxIndex : firstIndex, actualRows];
      }),
      // 如果索引有改变，才触发重新 render
      filter(([curIndex, actualRows]) => curIndex !== this.lastFirstIndex || (actualRows !== this.actualRowsSnapshot)),
      // update the index
      tap(([curIndex]) => this.lastFirstIndex = curIndex),
      map(([firstIndex, actualRows]) => {
        const lastIndex = firstIndex + actualRows - 1
        return [firstIndex, lastIndex]
      })
    )

    // 计算当前需要的数据区块
    const dataInViewSlice$ = combineLatest(
      this.list$,
      options$,
      shouldUpdate$
    ).pipe(
      withLatestFrom(scrollDirection$, actualRows$),
      map(([[list, { height }, [firstIndex, lastIndex]], dir, actualRows]) => {
        const dataSlice = this.stateDataSnapshot
        if (!dataSlice.length || dataSlice.length < (lastIndex + 1) || actualRows !== this.actualRowsSnapshot) {
          if (actualRows !== this.actualRowsSnapshot) {
            this.actualRowsSnapshot = actualRows;
          }
          return this.stateDataSnapshot = list.slice(firstIndex, lastIndex + 1).map(item => ({
            origin: item,
            $pos: firstIndex * height,
            $index: firstIndex++
          }))
        }

        // 拿到不需要显示的内容块，回收利用
        const diffSliceIndexes = this.getDifferenceIndexes(dataSlice, firstIndex, lastIndex);


        let newIndex = dir > 0 ? lastIndex - diffSliceIndexes.length + 1 : firstIndex;
        if (dir > 0) {
          lastIndex - 1
          dataSlice
        }
        diffSliceIndexes.forEach(index => {
          const item = dataSlice[index];
          item.origin = list[newIndex];
          item.$pos = newIndex * height;
          item.$index = newIndex++;
        });
        return this.stateDataSnapshot = dataSlice;
      })
    )

    this.subscription.add(
      combineLatest(dataInViewSlice$, scrollHeight$)
        .subscribe(([list, scrollHeight]) => {
          this.viewlist = list
          this.scrollHeight = scrollHeight
        })
    )
  }

  private getDifferenceIndexes(slice: Array<any>, firstIndex: number, lastIndex: number): number[] {
    const indexes: number[] = [];
    slice.forEach((item, i) => {
      if (item.$index < firstIndex || item.$index > lastIndex) {
        indexes.push(i);
      }
    });
    return indexes;
  }

  render(h:CreateElement) {
    this.virtualListRef = (
      <div class="scrollarp" style="float: left;overflow:auto;height: 100%;width: 100%;padding-right: 18px;box-sizing: content-box;">
        <div style={{ position: 'relative', height: `${this.scrollHeight}px` }}>
          {
            this.viewlist.map((data, i) => {
              return (
                <div key={i}
                  style={{ 
                      position: 'absolute', 
                      width: '100%', 
                      transform: `translateY(${data.$pos}px)`
                    }}>
                  {this.$scopedSlots.default!(data.origin)}
                </div>
              )
            })
          }
        </div>
      </div>
    )

    this.scrollBarRef = (
      <scroll-bar style={{ 
        'opacity': this.scrollBarDuring, 
        'height': `${this.scrollBarHeight}px`, 
        'top': `0px`, 
        'transform': `translateY(${this.scrollBarTop}px)`,
        'right': '0'
      }}></scroll-bar>
    )

    this.scrollBarWarpRef = (
      <scroll-bar-warp>
        { this.scrollBarRef }
      </scroll-bar-warp>
    )
    return (
      <div style="position: relative;overflow: hidden;height: 100%;">
        { this.virtualListRef }
        { this.scrollBarWarpRef }
      </div>
    )
  }
}