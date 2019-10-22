import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'
import './style.css'
Vue.config.productionTip = false
Vue.use(VueRouter);

const routes = [
  { path: '/list', component: () => import('./pages/list') },
  { path: '/loadPage', component: () => import('./pages/loadPage') }
]

const router = new VueRouter({
  routes // (缩写) 相当于 routes: routes
})

new Vue({
  components: { App },
  render: h => h(App),
  router
}).$mount('#app')
