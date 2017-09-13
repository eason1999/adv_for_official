import Vue from 'vue';
import Vuex from 'vuex';
import stepMutations from './steps/mutations.js';

Vue.use(Vuex);
const datepick = {
  state: {
    datelist: []
  },
  mutations: stepMutations
};

export default new Vuex.Store({
  modules: {
    datepick
  }
});
