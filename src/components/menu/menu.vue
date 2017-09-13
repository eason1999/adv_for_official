<template>
  <el-menu :unique-opened="true" @select="handleSelect" router :default-active="$route.path" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose">
    <el-menu-item index="/adv/index"><i class="el-icon-message"></i>首页</el-menu-item>
    <el-menu-item index="/adv/adpromotion/plan"><i class="el-icon-menu"></i>广告推广</el-menu-item>
    <el-menu-item index="/adv/app/index"><i class="el-icon-menu"></i>应用管理</el-menu-item>
    <el-menu-item index="/adv/data/index"><i class="el-icon-menu"></i>数据管理</el-menu-item>
    <el-submenu index="1">
	  <template slot="title"><i class="el-icon-message"></i>财务管理</template>
	  <el-menu-item-group>
	    <el-menu-item index="/adv/finance/index">财务数据</el-menu-item>
	    <el-menu-item index="/adv/finance/update">财务信息设置</el-menu-item>
	  </el-menu-item-group>
	</el-submenu>
    <el-menu-item index="/adv/user/index"><i class="el-icon-menu"></i>用户管理</el-menu-item>
  </el-menu> 
</template>

<script type="esmascript-6">
export default {
  data () {
    return {
      indexpath: '/adm/adv/campaign'	
    };
  },
  methods: {
  	handleSelect (index, indexPath) {
      this.indexpath = index;		
  	},
	handleOpen (key, keyPath) {
	  console.log(key, keyPath);
	},
	handleClose (key, keyPath) {
	  console.log(key, keyPath);
	}
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
	.el-menu
		height: 100%
</style>
