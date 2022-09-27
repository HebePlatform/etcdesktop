import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import 'element-ui/lib/theme-chalk/index.css';
import ElementUI from 'element-ui';
Vue.use(ElementUI);

import Web3 from 'web3';
let BigNumber = require('bignumber.js');

let web3 = new Web3();

import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard)
import global from './global/index'
Vue.prototype.$g = global

Vue.config.productionTip = false
Vue.prototype.$web3 = web3
Vue.prototype.$bigNumber = BigNumber
Vue.prototype.$axios = axios



new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
