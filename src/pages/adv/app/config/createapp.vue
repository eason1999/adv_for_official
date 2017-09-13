<template>
  <div class="step-app-wrapper">
    <div class="data-content-wrapper">
      <el-form :model="ruleForm" :rules="rules" :label-position="labelPosition" ref="ruleForm" v-loading.fullscreen.lock="loadings" element-loading-text="拼命加载中">
        <el-form-item label="应用平台：">
          <el-radio-group v-model="platform" class="radio-wrapper">
            <el-radio class="radio" label="0">Android</el-radio>
            <el-radio class="radio" label="1">IOS</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="接入形式：">
          <el-radio-group v-model="apptype" class="radio-wrapper">
            <el-radio class="radio" label="0">API</el-radio>
            <el-radio class="radio" label="1">SDK</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="应用类型：">
          <el-select v-model="industryCategory1" filterable placeholder="请选择" @change="getCategories2()">
            <el-option
              v-for="item in industryCategories1"
              :key="item.id"
              :label="item.text"
              :value="item.id">
            </el-option>
          </el-select>
          <el-select v-model="industryCategory2" filterable placeholder="请选择">
            <el-option
              v-for="item in industryCategories2"
              :key="item.id"
              :label="item.text"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="应用名称：" prop="appname">
          <el-input v-model="ruleForm.appname" placeholder="请输入应用名称"></el-input>
        </el-form-item>
        <el-form-item label="应用包名：" prop="packages">
          <el-input v-model="ruleForm.packages" placeholder="请输入应用包名" v-loading.fullscreen.lock="loadings" element-loading-text="拼命加载中"></el-input>
        </el-form-item>
        <el-form-item label="下载地址：" prop="urls">
          <el-input v-model="ruleForm.urls" placeholder="请填写以http://或https://开头的下载地址"></el-input>
        </el-form-item>
        <el-form-item label="应用描述：" prop="instructions">
          <el-input type="textarea" :rows="4" resize="none" placeholder="请输入应用描述" v-model="ruleForm.instructions"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="config('ruleForm')">保存并继续</el-button>
          <el-button type="default" @click="back">取消</el-button>
        </el-form-item>  
      </el-form>
    </div>
  </div>
</template>

<script type="ecmascript-6">
export default {
  props: {
  	actives: {
      type: Number		
  	}
  },
  data () {
    var checkpages = (rule, value, callback) => {
      let req = /^[a-zA-Z][\w\.]+$/;
      if (!value) {
        return callback(new Error('输入不能为空'));
      }
      setTimeout(() => {
        if (!req.test(value)) {
          callback(new Error('请输入合法的包名'));
        } else {
          callback();
        }
      }, 1000);
    };
    var checkurls = (rule, value, callback) => {
      let req = /^[a-zA-Z][\w\.]+$/;
      if (!value) {
        return callback(new Error('输入不能为空'));
      }
      setTimeout(() => {
        if (!(/[\u4E00-\u9FA5\uF900-\uFA2D]/.test(value)) && !(/^http:\/\//.test(value)||/^https:\/\//.test(value))) {
          callback(new Error('请输入http://或https://开头且不能包含中文字符'));
        } else {
          callback();
        }
      }, 1000);
    };
    return {
      industryCategories1: [],
      industryCategories2: [],
      industryCategory1:'',
	  industryCategory2:'',
      platform: '0',
      apptype: '0',
      ruleForm: {
        appname: '',
        instructions: '',
        packages: '',
        urls: ''
      },
      rules: {
        appname: [
          { required: true, message: '请输入保护周期', trigger: 'blur' }
        ],
        instructions: [
          { required: true, message: '请输入应用说明', trigger: 'blur' }
        ],
        packages: [
          { required: true, message: '请输入包名', trigger: 'blur' },
          { validator: checkpages, trigger: 'blur' }
        ],
        urls: [
          { required: true, message: '请输入监测地址', trigger: 'blur' },
          { validator: checkurls, trigger: 'blur' }
        ]
      },
      loadings: false,
      labelPosition: 'top',
      active: this.actives, 
      appId: this.$store.state.appsteps.appId
    };
  },
  mounted () {
    this.$nextTick(() => {
      this.loadCategory1();
      console.log(this.appId); 
      if (this.appId != '') {
      	this.load();
      }
    });
  },
  components: { },
  methods: {
    loadCategory1 () {
      this.loadings = true;
      this.$http.get('/v1/dict/apps/industry/category1').then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        this.industryCategories1 = data.result;
        if(this.industryCategory1 === ''){
          this.industryCategory1 = this.industryCategories1[0].id;
        }
      }, () => {this.loadings = false});
    },
    getCategories2 () {
      this.loadings = true;
      let params = {};
      params.industryCategory1 = this.industryCategory1;
      this.$http.get('/v1/dict/apps/industry/{industryCategory1}/category2', {params: params}).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        this.industryCategories2 = data.result;
        this.industryCategory2 = this.industryCategories2[0].id;
      }, () => {this.loadings = false});
    },
    config (formName) {	
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.creates();
        } else {
          return this.$alert('请正确选择或输入相应选项！！！', '提示：', {
            confirmButtonText: '确定'
          });
        }
      });
    },
    load () {
      this.loadings = true;
      this.$http.get('/v1/dev/apps/'+this.appId).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.ruleForm.appname = result.name;
        this.industryCategory1 = result.industryCategory1;
        this.industryCategory2 = result.industryCategory2;
        this.platform = result.platform;
        this.ruleForm.instructions = result.description;
        this.ruleForm.packages = result.packageName;
        this.ruleForm.urls = result.downloadLink;
        this.apptype = result.accessFormat; 
      }, () => {
        this.loadings = false;
      });
    },
    creates () {
      this.loadings = true;
      let params = {};
      params.name = this.ruleForm.appname;
      params.industryCategory1 = this.industryCategory1;
      params.industryCategory2 = this.industryCategory2;
      params.platform = this.platform;
      params.description = this.ruleForm.instructions;
      params.packageName = this.ruleForm.packages;
      params.downloadLink = this.ruleForm.urls;
      params.accessFormat = this.apptype;
      this.$http.post('/v1/dev/apps', params).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.active = 1;
        this.$emit('update:actives', 1);
        this.$store.commit('EDIT_ID', result.id);
        console.log(this.$store);
      }, () => {
        this.loadings = false;
      });
    },
    back () {
      this.$router.push({
        path:'/dev/app/index'
      });
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .step-app-wrapper
    background: #fff 
    margin-top: 20px
    .data-content-wrapper
      .el-form-item
        width: 280px 
        .el-select
          display: inline-block
          width: 137px
          &:last-child
            margin-left: 2px
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
