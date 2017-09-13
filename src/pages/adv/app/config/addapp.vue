<template>
  <div class="add-app-wrapper">
    <div class="bread-title-wrapper">
      <breadcrumb :bread-detail="breadContent"></breadcrumb>
    </div>
    <div class="data-title-wrapper">
      <el-steps :active="active" center="true" finish-status="success">
        <el-step title="新增应用"></el-step>
        <el-step title="创建广告位"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <createapp v-if="active === 0" :actives="active" @update:actives="val => active = val"></createapp>
      <createslot v-if="active === 1" :actives="active" @update:actives="val => active = val"></createslot>
      <createsuc v-if="active === 2"></createsuc>
    </div>
  </div>
</template>

<script type="ecmascript-6">
import breadcrumb from '../../../../components/breadcrumb/breadcrumb.vue';
import createapp from './createapp.vue';
import createslot from './createslot.vue';
import createsuc from './createsuc.vue';
export default {
  data () {
    return {
      active: 0,
      breadContent: [{ text: '应用管理', path: '/dev/app/index'}, { text: '新增应用'}]
    };
  },
  computed: {
    
  },
  mounted () {
    
  },
  components: { breadcrumb, createsuc, createslot, createapp },
  methods: {
    
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .add-app-wrapper
    .bread-title-wrapper
      margin-bottom: 15px
    .data-title-wrapper
      margin-bottom: 15px
      background: #fff
      border: 1px solid #eee
      padding: 20px
</style>
