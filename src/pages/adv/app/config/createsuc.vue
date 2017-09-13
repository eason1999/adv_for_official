<template>
  <div class="step-success-wrapper">
    <div class="data-content-wrapper">
      <span class="el-icon-circle-check check-icon"></span>
      <p class="success-content">恭喜您，操作成功</p>
      <el-button class="success-btn" type="info" @click="back">返回列表</el-button>
    </div>
  </div>
</template>

<script type="ecmascript-6">
export default {
  methods: {
    back () {
      this.$router.push({
      	path: '/dev/app/index'
      }); 
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .step-success-wrapper
    background: #fff 
    margin-top: 20px
    .data-content-wrapper
      text-align: center
      padding: 100px 0
      .check-icon
      	display: block
      	color: #41d430
      	font-size: 70px
      	margin-bottom: 20px
      .success-content
      	font-size: 18px
      	color: #666
      	margin-bottom: 20px
      .success-btn	
      	margin: 0 auto 
</style>
