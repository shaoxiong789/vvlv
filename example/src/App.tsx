import {Component,Vue} from 'vue-property-decorator';
import { CreateElement } from 'vue';
@Component({
})
export default class App extends Vue {

  mounted() {
  }

  render(h: CreateElement) {
    return (
      <div id="app">
        <router-view/>
      </div>
    )
  }
}