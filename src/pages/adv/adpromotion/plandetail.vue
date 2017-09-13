<template>
  <div class="plan-detail-wrapper">
    <div class="bread-title-wrapper">
      <breadcrumb :bread-detail="breadContent"></breadcrumb>
    </div>
    <div class="tab-page-wrapper">
      <tabpage :tabs="tabs" :currentab="currentabs" @update:currentab="val => currentabs = val"></tabpage>
    </div> 
    <adstrategy v-if="currentabs==='first'" :campaignid="id" :planname="planname"></adstrategy>
    <adcreate v-if="currentabs==='second'" :campaignid="id" :planname="planname"></adcreate>
  </div>
</template>

<script type="ecmascript-6">
import breadcrumb from '../../../components/breadcrumb/breadcrumb.vue';
import tabpage from '../../../components/tabpage/tabpage.vue';
import adcreate from './adcreate.vue';
import adstrategy from './adstrategy.vue';
export default {
  data () {
    return {
      planname: this.$route.query.name,
      breadContent: [{ text: this.$route.query.name, path: '/adv/adpromotion/plan'}, { text: '计划详情'}],
      tabs: [
        {name: 'first', text: '策略'},
        {name: 'second', text: '创意'}
      ],
      currentabs: 'first',
      id: this.$route.query.id
    };
  },
  mounted () {
    
  },
  components: { tabpage, breadcrumb, adcreate, adstrategy }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .plan-detail-wrapper
    overflow: hidden
    .bread-title-wrapper
      margin-bottom: 10px
    .tab-page-wrapper
      margin-bottom: 10px  
</style>
