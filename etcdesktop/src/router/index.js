import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/index'
import panel from '@/components/panel'
import login from '@/components/login/login'
import token from '@/components/tokens/token'
import tokentransfers from '@/components/tokens/transfers'
import nft from '@/components/nfts/nft'
import swap from '@/components/swap/swap'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/index',
      name: 'index',
      component: index,
      children: [
        {
          path: '',
          component: panel
        },
        {
          path: 'token',
          component: token
        },
        {
          path: 'tokentransfers',
          component: tokentransfers
        },
        {
          path: 'nft',
          component: nft
        },
        {
          path: 'swap',
          component: swap
        }
      ]
    },
    {
      path: '/',
      name: 'login',
      component: login,
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
