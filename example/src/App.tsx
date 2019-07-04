import {Component,Provide,Vue, Watch, Model, Prop} from 'vue-property-decorator';
import virtualList from '../../'
console.log(virtualList)
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

  render() {
    return (
      <div class="virtual-box">
        <virtual-list style="height: 100%;"
          list={this.data} options={{ height: 180 }}
            {...{
              scopedSlots: {
                default: item => {
                  return (
                    <div class="card" style="height: 180px;">
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