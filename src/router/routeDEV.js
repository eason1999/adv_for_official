import layout from '../pages/adv/layout.vue';

import login from '../pages/adv/login.vue';

import financeindex from '../pages/adv/finance/index.vue';

import financeupdate from '../pages/adv/finance/update.vue';

import totalindex from '../pages/adv/total/index.vue';

import appindex from '../pages/adv/app/index.vue';

import appaddslot from '../pages/adv/app/config/addslot.vue';

import appupdate from '../pages/adv/app/config/update.vue';

import addapp from '../pages/adv/app/config/addapp.vue';

import dataindex from '../pages/adv/data/index.vue';

import userindex from '../pages/adv/user/index.vue';

import userupdate from '../pages/adv/user/config/update.vue';

import userupdatepsd from '../pages/adv/user/config/updatepsd.vue';

import adplan from '../pages/adv/adpromotion/adplan.vue';

import plandetail from '../pages/adv/adpromotion/plandetail.vue';

import config from '../config.js';

const routes = [{
  path: '/',
  redirect: config.index
}, {
  path: '/adv/login',
  component: login
}, {
  path: '/adv/',
  component: layout,
  children: [{
    path: 'index',
    component: totalindex
  }, {
    path: 'app/index',
    component: appindex
  }, {
    path: 'app/index/addslot',
    component: appaddslot
  }, {
    path: 'app/index/update',
    component: appupdate
  }, {
    path: 'app/index/addapp',
    component: addapp
  }, {
    path: 'data/index',
    component: dataindex
  }, {
    path: 'user/index',
    component: userindex
  }, {
    path: 'user/index/update',
    component: userupdate
  }, {
    path: 'user/index/updatepsd',
    component: userupdatepsd
  }, {
    path: 'finance/index',
    component: financeindex
  }, {
    path: 'finance/update',
    component: financeupdate
  }, {
    path: 'adpromotion/plan',
    component: adplan
  }, {
    path: 'adpromotion/plan/detail',
    component: plandetail
  }]
}];

export default routes;
