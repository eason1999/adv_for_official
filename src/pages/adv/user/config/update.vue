<template>
  <div class="user-update-wrapper">
    <div class="bread-title-wrapper">
      <breadcrumb :bread-detail="breadContent"></breadcrumb>
    </div>
    <div class="data-content-wrapper">
      <el-form :model="ruleForm" :rules="rules" :label-position="labelPosition" ref="ruleForm" v-loading.fullscreen.lock="loadings" element-loading-text="拼命加载中">
        <el-form-item label="注册账号：" prop="username">
          <el-input v-model="ruleForm.username" disabled placeholder="请填写注册账号"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名：" prop="realname">
          <el-input v-model="ruleForm.realname" placeholder="请填写真实姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号码：" prop="contactmobile">
          <el-input v-model="ruleForm.contactmobile" placeholder="请填写手机号"></el-input>
        </el-form-item>
        <el-form-item label="邮箱：" prop="email">
          <el-input v-model="ruleForm.email" placeholder="请填写邮箱"></el-input>
        </el-form-item>
        <el-form-item label="QQ：">
          <el-input v-model="contactqq" placeholder="请填写QQ号"></el-input>
        </el-form-item>
        <el-form-item label="微信：">
          <el-input v-model="contactwechat" placeholder="请输入微信号"></el-input>
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
    var checkemail = (rule, value, callback) => {
      let req = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!value) {
        return callback(new Error('输入不能为空'));
      }
      setTimeout(() => {
        if (!req.test(value)) {
          callback(new Error('请输入合法邮箱'));
        } else {
          callback();
        }
      }, 1000);
    };
    var checkphonenum = (rule, value, callback) => {
      let req = /^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/;
      if (!value) {
        return callback(new Error('输入不能为空'));
      }
      setTimeout(() => {
        if (!req.test(value)) {
          callback(new Error('请输入合法电话号码'));
        } else {
          callback();
        }
      }, 1000);
    };
    return {
      breadContent: [{ text: '用户管理', path: '/adv/user/index'}, { text: '修改个人信息'}],
      contactqq: '',
      contactwechat: '',
      ruleForm: {
        username: '',
        contactmobile: '',
        realname: '',
        email: ''
      },
      rules: {
        username: [
          { required: true, message: '注册账号不能为空', trigger: 'blur' }
        ],
        contactmobile: [
          { required: true, validator: checkphonenum, trigger: 'blur' }
        ],
        realname: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        email: [
          { required: true, validator: checkemail, trigger: 'blur' }
        ]
      },
      loadings: false,
      labelPosition: 'top'
    };
  },
  mounted () {
    this.$nextTick(() => {
      this.load();
    });
  },
  computed: {
  	  
  },
  components: { breadcrumb },
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
        if (result.contactWechat) {
          this.contactwechat = result.contactWechat;
        }
        if (result.contactQq) {
          this.contactqq = result.contactQq;
        }
        this.ruleForm.username = result.userName;
        this.ruleForm.contactmobile = result.contactMobile;
        this.ruleForm.realname = result.realName;
        this.ruleForm.email = result.email;
      }, () => {this.loadings = false;});
  	},
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
      params.userName = this.ruleForm.username;
      params.realName = this.ruleForm.realname;
      params.email = this.ruleForm.email;
      params.contactMobile = this.ruleForm.contactmobile;
      params.contactQq = this.contactqq;
      params.contactWechat = this.contactwechat;
      this.$http.put('/v1/adv/users/current', params).then((res) => {
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
  .user-update-wrapper
    .bread-title-wrapper 
      margin-bottom: 20px
    .data-content-wrapper
      background: #fff 
      padding: 20px 
      border: 1px solid #eee
      .el-form-item
        width: 300px 
        .el-select
          display: block
          width: 100%
        .radio-wrapper
          margin: 5px 0
          display: block 
          .radio
            color: #565656
            width: 80px
          .radio:first-child
            margin-right: 30px
        &:last-child
          margin-bottom: 0  
</style>
