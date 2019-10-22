import {Component,Vue} from 'vue-property-decorator';
import virtualList from '../../../src/VirtualList'
import { CreateElement } from 'vue';
@Component({
  components: {
    virtualList
  }
})
export default class loadPage extends Vue {

  render(h: CreateElement) {
    return (
      <div>
        <div>
          <button onClick={() => {
            (this.$refs.virtualList as any).refresh()
          }}>刷新</button>
        </div>
        <div class="virtual-box">
        <virtual-list style="height: 100%;" ref="virtualList"
            options={{ height: 180 }}
            pullUpLoad={({pagination}) => {
              return new Promise((resolve) => {
                console.log('请求一次');
                window.setTimeout(() => {
                  resolve(
                    Array.from({length: 20}).map(() => {
                      return {"albumId":1,"id":1,"title":"accusamus beatae ad facilis cum similique qui sunt","url":"https://via.placeholder.com/600/92c952","thumbnailUrl":"https://via.placeholder.com/150/92c952"}
                    })
                  )
                }, 200)
              })
            }}
            {...{
              scopedSlots: {
                default: item => {
                  return (
                    item && <div class="card" style="height: 180px;">
                      <a href={item.url}>
                        <div class="thumbnail">
                          <img src={item.thumbnailUrl} alt={item.title}/>
                        </div>
                        <div class="content">
                          <p>{item.title}</p>
                          <p>No.{item.id}</p>
                        </div>
                      </a>
                    </div>
                  )
                }
              }
            }}
          >
        </virtual-list>
      </div>
      </div>
    )
  }
}