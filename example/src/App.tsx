import {Component,Vue} from 'vue-property-decorator';
import virtualList from '../../src/VirtualList'
import { CreateElement } from 'vue';
@Component({
  components: {
    virtualList
  }
})
export default class App extends Vue {

  data:Array<any> = [];

  mounted() {
    fetch('https://jsonplaceholder.typicode.com/photos')
      .then(res => res.json())
      .then(data => this.data = data)
      .catch(console.error);
  }

  render(h: CreateElement) {
    return (
      <div class="virtual-box">
        <input type="button" value="刷新" onClick={() => {
          this.data = []
        }}/>
        <virtual-list style="height: 100%;"
          list={this.data} options={{ height: 180 }}
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
    )
  }
}