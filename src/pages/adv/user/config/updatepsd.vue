<template>
  <div class="user-updatepsd-wrapper">
    <div class="bread-title-wrapper">
      <breadcrumb :bread-detail="breadContent"></breadcrumb>
    </div>
    <div class="data-content-wrapper">
      <el-form :model="ruleForm" :rules="rules" :label-position="labelPosition" ref="ruleForm" v-loading.fullscreen.lock="loadings" element-loading-text="拼命加载中">
        <el-form-item label="原密码：" prop="oldpassword">
          <el-input type="password" v-model="ruleForm.oldpassword" placeholder="请填写注册账号"></el-input>
        </el-form-item>
        <el-form-item label="新密码：" prop="newpassword">
          <el-input type="password" v-model="ruleForm.newpassword" placeholder="请填写真实姓名"></el-input>
        </el-form-item>
        <el-form-item label="密码确认：" prop="confirmpsd">
          <el-input type="password" v-model="ruleForm.confirmpsd" placeholder="请填写手机号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="config('ruleForm')">保存</el-button>
          <el-button type="default" @click="back">取消</el-button>
        </el-form-item>  
      </el-form>
    </div>
  </div>
</template>

<script type="ecmascript-6">
import breadcrumb from '../../../../components/breadcrumb/breadcrumb.vue';
export default {
  data () {
    var checkpsd = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('输入不能为空'));
      }
      setTimeout(() => {
        if (value.length < 6 || value.length > 18) {
          callback(new Error('请输入6-18位密码'));
        } else {
          callback();
        }
      }, 1000);
    };
    var confirmpsd = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('输入不能为空'));
      }
      setTimeout(() => {
        if (value !== this.ruleForm.newpassword) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      }, 1000);
    };
    return {
      breadContent: [{ text: '用户管理', path: '/adv/user/index'}, { text: '修改密码'}],
      ruleForm: {
        oldpassword: '',
        newpassword: '',
        confirmpsd: ''
      },
      rules: {
        oldpassword: [
          { required: true, validator: checkpsd, trigger: 'blur' }
        ],
        newpassword: [
          { required: true, validator: checkpsd, trigger: 'blur' }
        ],
        confirmpsd: [
          { required: true, validator: confirmpsd, trigger: 'blur' }
        ]
      },
      loadings: false,
      labelPosition: 'top'
    };
  },
  mounted () {
    
  },
  computed: {
  	  
  },
  components: { breadcrumb },
  methods: {
    config (formName) {	
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.creates();
        } else {
          return this.$alert('请正确处理相应选项或上传证件！！！', '提示：', {
            confirmButtonText: '确定'
          });
        }
      });
    },
    creates () {
      this.loadings = true;
      let params = {};
      params.oldPass = this.ruleForm.oldpassword;
      params.newPass = this.ruleForm.newpassword;
      this.$http.put('/v1/adv/users/current/pass', params).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        this.back();
      }, () => {
        this.loadings = false;
      });
    },
    back () {
      this.$router.push({
        path:'/adv/user/index'
      });
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .user-updatepsd-wrapper
    .bread-title-wrapper 
      margin-bottom: 20px
    .data-content-wrapper
      background: #fff 
      padding: 20px 
      border: 1px solid #eee
      .el-form-item
        width: 300px 
        &:last-child
          margin-bottom: 0  
</style>
