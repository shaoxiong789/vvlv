# vvlv

> vvlv component build with vue and rxjs

## Selling Point

virtualList won't create or remove any DOM when you scroll the list, it will reuse the existing DOM and only change their position and data. But when you resize your window, you'll find the DOM's number is changed, so your virtual list will always have just right number of DOM.

## Install

```bash
npm install --save vvlv
```

## Usage

```javascript
import {Component,Vue} from 'vue-property-decorator';
import virtualList from 'vvlv'
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
```

## Props

| Property   | Type                              | Description                     |
| ---------- | --------------------------------- | ------------------------------- |
| `list`    | `Array<any>`                       | Data source of the list.        |
| `options` | `IVirtualListOptions`              | Options of the virtual list.    |
| `style`    | `any`                             | Style of VirtualList container. |

### `IVirtualListOptions`

| Property     | Type      | Default      | Description                                                                                                     |
| ------------ | --------- | ------------ | --------------------------------------------------------------------------------------------------------------- |
| `height`     | `number`  | **NOT NULL** | Item height, it's **necessary**, use this property to calculate how many rows should be rendered actually. |
| `spare`      | `number`  | 3            | Spare rows out of the view.                                                                                     |
| `resize`     | `boolean` | true         | To mark if the real dom number should be recomputed when the window resize.                                     |
## License

MIT © [shaoxiong789](https://github.com/shaoxiong789)
