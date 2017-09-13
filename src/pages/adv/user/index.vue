<template>
  <div class="user-index-wrapper">
    <h2>财务信息详情</h2>
    <div class="data-table-wrapper">
      <el-table :data="tableData" stripe style="width: 100%" v-loading.fullscreen.lock="loadings" element-loading-text="拼命加载中">
        <el-table-column type="expand">
          <template scope="props">
            <el-form label-position="left" inline class="demo-table-expand sub-app-form">
              <el-form-item label="QQ:">
                <span>{{ props.row.contactQq | check }}</span>
              </el-form-item>
              <el-form-item label="微信:">
                <span>{{ props.row.contactWechat | check }}</span>
              </el-form-item>
              <el-form-item label="操作:">
                <el-button type="primary" size="small" @click="handleUpdate()">修改用户信息</el-button>
                <el-button type="primary" size="small" @click="handleUpdatepsd()">修改密码</el-button>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="注册账号" show-overflow-tooltip></el-table-column>
        <el-table-column prop="realName" label="真实姓名" show-overflow-tooltip></el-table-column>
        <el-table-column prop="contactMobile" label="手机号码" show-overflow-tooltip></el-table-column>
        <el-table-column prop="email" label="邮箱" show-overflow-tooltip></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script type="ecmascript-6">
export default {
  data () {
    return {
      tableData: [],
      loadings: false
    };
  },
  mounted () {
    this.$nextTick(() => {
      this.load();
    });
  },
  filters: {
  	check (value) {
      let item;
      switch (value) {
        case undefined:
          item = '暂无';
          break;         
        default:
          item = value;
          break;  
      }
      return item;		
  	}
  },
  components: { },
  methods: {
    load () {
      this.loadings = true;
      this.$http.get('/v1/adv/users/current').then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.tableData.push(result);
      }, () => {this.loadings = false;});
    },
    handleUpdate () {
      this.$router.push({
      	path: 'index/update'
      });
    },
    handleUpdatepsd () {
      this.$router.push({
      	path: 'index/updatepsd'
      });
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .user-index-wrapper    
    .data-table-wrapper
      margin-bottom: 20px 
      .sub-app-form
        padding: 10px
        label
          width: 75px
          overflow: hidden
          white-space: nowrap
          text-overflow: ellipsis
          color: #99a9bf
        .el-form-item
          margin-right: 0
          margin-bottom: 0
          width: 48%
</style>
