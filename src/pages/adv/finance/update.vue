<template>
  <div class="finance-index-wrapper">
    <h2>财务信息设置</h2>
    <div class="data-content-wrapper">
      <el-form :model="ruleForm" :rules="rules" :label-position="labelPosition" ref="ruleForm" v-loading.fullscreen.lock="loadings" element-loading-text="拼命加载中">
        <el-form-item label="账户类型">
          <el-radio-group v-model="financeType" class="radio-wrapper" @change="changetype">
            <el-radio class="radio" label="2">个人账户</el-radio>
            <el-radio class="radio" label="1">企业账户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="联系人：" prop="contactor">
          <el-input v-model="ruleForm.contactor" placeholder="请填写联系人姓名"></el-input>
        </el-form-item>
        <el-form-item label="联系号码：" prop="contactmobile">
          <el-input v-model="ruleForm.contactmobile" placeholder="请填写电话号码"></el-input>
        </el-form-item>
        <el-form-item label="开户人：" prop="accountname">
          <el-input v-model="ruleForm.accountname" placeholder="请填写开户人姓名"></el-input>
        </el-form-item>
        <el-form-item label="开户银行：" prop="bankname">
          <el-select v-model="ruleForm.bankname" filterable placeholder="请选择">
            <el-option
              v-for="item in names"
              :key="item.id"
              :label="item.text"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开户行支行：" prop="branchname">
          <el-input v-model="ruleForm.branchname" placeholder="请填写开户支行"></el-input>
        </el-form-item>
        <el-form-item label="银行账号：" prop="bankaccount">
          <el-input v-model="ruleForm.bankaccount" placeholder="请输入银行账号"></el-input>
        </el-form-item>
        <el-form-item label="证件类型：" prop="certificatetype">
          <el-select v-model="ruleForm.certificatetype" filterable placeholder="请选择">
            <el-option
              v-for="item in types"
              :key="item.id"
              :label="item.text"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="证件姓名：" prop="certificatename">
          <el-input v-model="ruleForm.certificatename" placeholder="请输入证件姓名"></el-input>
        </el-form-item>
        <el-form-item label="证件号码：" prop="certificatenumber">
          <el-input v-model="ruleForm.certificatenumber" placeholder="请填写证件号码"></el-input>
        </el-form-item>
        <div class="dowm-forward">
          <span class="list-title">上传凭证：</span>
          <el-upload
            :disabled="this.item!=''||this.fileList.length>=1"
            class="upload-wrapper"
            accept=".jpg,.png,.jpeg,.gif"
            :action="urls"
            :data="updatas"
            :multiple="false"
            :file-list="fileList"
            :on-remove="remove"
            :on-success="success"
            :on-error="error"
            :on-change="change">
            <el-button size="small" type="primary">点击上传</el-button>
            <div class="el-upload__tip" slot="tip">
              只能上传*.jpg/*.png/*.jpeg/*.gif文件
            </div>
          </el-upload>
        </div>
        <el-form-item>
          <el-button type="primary" @click="config('ruleForm')">保存修改</el-button>
        </el-form-item>  
      </el-form>
    </div>
  </div>
</template>

<script type="ecmascript-6">
import apiUtil from '../../../util/api.js';
export default {
  data () {
    var checkbankaccount = (rule, value, callback) => {
      let req = /^\d{7,21}$/;
      if (!value) {
        return callback(new Error('输入不能为空'));
      }
      setTimeout(() => {
        if (!req.test(value)) {
          callback(new Error('请输入合法账号'));
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
      names: [],
      types: [],
      financeType: '2',
      ruleForm: {
        contactor: '',
        contactmobile: '',
        accountname: '',
        branchname: '',
        bankaccount: '',
        certificatenumber: '',
        certificatename: '',
        bankname: '',
        certificatetype: ''
      },
      rules: {
        contactor: [
          { required: true, message: '请输入联系人姓名', trigger: 'blur' }
        ],
        contactmobile: [
          { required: true, validator: checkphonenum, trigger: 'blur' }
        ],
        accountname: [
          { required: true, message: '请输入开户人姓名', trigger: 'blur' }
        ],
        branchname: [
          { required: true, message: '请输入开户支行名', trigger: 'blur' }
        ],
        bankaccount: [
          { required: true, validator: checkbankaccount, trigger: 'blur' }
        ],
        certificatenumber: [
          { required: true, message: '请输入证件号码', trigger: 'blur' }
        ],
        certificatename: [
          { required: true, message: '请输入证件姓名', trigger: 'blur' }
        ],
        bankname: [
          { required: true, message: '请选择开户银行', trigger: 'change' }
        ],
        certificatetype: [
          { required: true, message: '请选择证件类型', trigger: 'change' }
        ]
      },
      materialId: -1, //营业执照附件ID
      materialName: '',//营业执照附件名称
      loadings: false,
      labelPosition: 'top',
      urls: apiUtil.url('/v1/adv/finances/materials'),
      fileList: [],
      item: ''
    };
  },
  mounted () {
    this.$nextTick(() => {
      this.loadPersonCertificate();
      this.loadbank();
      this.load();
    });
  },
  computed: {
  	updatas () {
  	  let items = {};
  	  return items = {
  	  	financeType: this.financeType,
        certificateType: this.ruleForm.certificatetype
  	  };
  	}  
  },
  components: { },
  methods: {
    changetype () {
      if (this.financeType === '2') {
        this.loadPersonCertificate();
      } else {
        this.loadCompanyCertificate();
      }
  	},
    loadPersonCertificate () {
      this.loadings = true;
      this.$http.get('/v1/dict/types/certificates/person').then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.types = result;
        this.ruleForm.certificatetype = this.types[0].id;
      }, () => {this.loadings = false;});
  	},
    loadCompanyCertificate () {
      this.loadings = true;
      this.$http.get('/v1/dict/types/certificates/company').then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.types = result;
        this.ruleForm.certificatetype = this.types[0].id;
      }, () => {this.loadings = false;});
  	},
    loadbank () {
      this.loadings = true;
      this.$http.get('/v1/dict/types/banks').then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.names = result;
        this.ruleForm.bankname = this.names[0].id;
      }, () => {this.loadings = false;});
  	},
  	load () {
      this.loadings = true;
      this.$http.get('/v1/adv/finances/user').then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        if (result.financeType) {
          this.financeType = result.financeType;
        }
        this.ruleForm.contactor = result.contactor;
        this.ruleForm.contactmobile = result.contactMobile;
        this.ruleForm.accountname = result.accountName;
        this.ruleForm.branchname = result.bankName;
        this.ruleForm.bankaccount = result.bankAccount;
        this.ruleForm.certificatenumber = result.certificateNum;
        this.ruleForm.certificatename = result.certificateName;
        if (result.bankType) {
          this.ruleForm.bankname = result.bankType;
        }
        if (result.certificateType) {
          this.ruleForm.certificatetype = result.certificateType;
        }
        this.materialId = result.materialId;
        this.materialName = result.materialName;
        let item = {};
        item.name = result.materialName;
        item.url = 'http://dsafasfsaf';
        if (result.materialName) {
          this.fileList.push(item);
        }
      }, () => {this.loadings = false;});
  	},
    config (formName) {	
      this.$refs[formName].validate((valid) => {
        if (valid && this.fileList === 1) { 
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
      params.contactor = this.ruleForm.contactor;
      params.contactMobile = this.ruleForm.contactmobile;
      params.accountName = this.ruleForm.accountname;
      params.bankType = this.ruleForm.bankname;
      params.bankName = this.ruleForm.branchname;
      params.bankAccount = this.ruleForm.bankaccount;
      params.certificateType = this.ruleForm.certificatetype;
      params.certificateName = this.ruleForm.certificatename;
      params.certificateNum = this.ruleForm.certificatenumber;
      params.materialId = this.materialId;
      params.materialName = this.materialName;
      params.financeType = this.financeType;
      this.$http.put('/v1/adv/finances/user', params).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        } else {
          return this.$alert('修改成功！！！', '提示：', {
            confirmButtonText: '确定'
          });
        }
      }, () => {
        this.loadings = false;
      });
    },
    remove (file, fileList) {
      this.item='';
      this.fileList = fileList;
    },
    success (data) {
      this.item = data.result;
      if (data.ret!=1) {
        return this.$alert(data.message, '提示：', {
          confirmButtonText: '确定'
        });
      }
    },
    error (data) {
      return this.$alert(data.message, '提示：', {
        confirmButtonText: '确定'
      });
    },
    change (data) {
      // console.log(data);
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .finance-index-wrapper
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
      .dowm-forward
        width: 300px
        margin-bottom: 20px 
</style>
