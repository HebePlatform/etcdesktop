import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ismint:true,
    network: '',
    wallet: {
      address: ''
    },
    settingVisible:false,
    loading: false,
    sendis: true,
    send100: false,
    send200: false,
    send400: false,
    hash: '',
    tokens: '',
    balanceList:'',
    balanceValue:'',
    dialogVisible: false,
    dialogSendVisible:false,
    syncing:true,
    hex:'',
    txt:'',
    prv: {
      prv: '',
      address: ''
    },
    dialog: {
      to: '',
      amount: 0,
      gasLimit: 0,
      gasPrice: 0,
      data: '',
      fee:0,
      nonce:0,
    },
    hens:{
      name:'',
      id:'',
      img:''
    },
    form:{
      syncmode:'fast',
      http:true,
      ws:false,
      cros:true,
      ipfs:'https://classicsavages.mypinata.cloud/ipfs/',
      eruda:true,
      rpc:'https://etc.etcdesktop.com/'
    }
  },
  mutations: {
    ['setPrv'](state, model) {
      state.prv = JSON.parse(JSON.stringify(model));
    },
    ['setBalanceList'](state, model) {
      state.balanceList = JSON.parse(JSON.stringify(model));
    },
    ['setNetwork'](state, model) {
      state.network = JSON.parse(JSON.stringify(model));
    },
    ['setWallet'](state, model) {
      state.wallet = JSON.parse(JSON.stringify(model));
    },
    ['setTokens'](state, model) {
      state.tokens = JSON.parse(JSON.stringify(model));
    },
  }
})
