<template>
  <div class="ad-create-wrapper">
    <div class="app-top-wrapper clearfix">
      <el-button type="primary" class="pull-left" @click="addcreate">新增创意</el-button>
      <div class="app-search pull-right">
        <el-input placeholder="请输入内容" v-model="keyword" @keyup.native.enter="load()"></el-input>
        <el-button type="primary" @click="load()">搜索</el-button>
      </div>
    </div>
    <div class="apps-data-table">
      <el-table :data="tableData" stripe style="width: 100%" v-loading.fullscreen.lock="loadings" element-loading-text="拼命加载中">
        <el-table-column label="创意名称" show-overflow-tooltip> 
          <template scope="scope">
            <a href="javascript:;" @click="getdetail(scope.row.id)">
              <p>{{scope.row.codeName }}</p> 
              <p>ID: {{scope.row.id }}</p> 
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="adTypeOnProduct" label="广告类型" show-overflow-tooltip></el-table-column>
        <el-table-column label="审核状态" show-overflow-tooltip>
          <template scope="scope">
            <span>{{scope.row.verificationStatus }}</span> 
          </template>
        </el-table-column>
        <el-table-column label="修改时间" show-overflow-tooltip>
          <template scope="scope">
            <span>{{scope.row.createAt | date }}</span> 
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pager-wrapper clearfix" v-if="tableData.length">
      <pager :total-records="totalRecords" @pagechange="load" :page-sizes="pageSize" :page-nums="pageNum"></pager>
    </div>
    <!-- 新增、修改创意部分 -->
    <el-dialog title="新增/修改创意" :visible.sync="createDialogVisible" :modal-append-to-body="false" @open="getdate" @close="closedate">
      <el-form :model="ruleForm" :rules="rules" :label-position="labelPosition" ref="ruleForm">
        <el-form-item label="创意名称:"  prop="codeName">
          <el-input v-model="ruleForm.codeName" placeholder="请输入计划名称"></el-input>
        </el-form-item>
        <el-form-item label="广告类型:"  prop="adTypeOnProduct">
          <el-radio-group v-model="ruleForm.adTypeOnProduct" class="radio-wrapper" @change="changesize">
            <el-radio class="radio" label="BANNER">横幅</el-radio>
            <el-radio class="radio" label="SPLASH">开屏</el-radio>
            <el-radio class="radio" label="INTERSTITIAL">插屏</el-radio>
            <el-radio class="radio" label="NATIVE">原生</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="广告形式:" prop="adTypeOnInterface" v-if="ruleForm.adTypeOnProduct === 'BANNER'">
          <el-radio-group v-model="ruleForm.adTypeOnInterface" class="radio-wrapper" @change="changesize">
            <el-radio class="radio" label="IMAGE">图片</el-radio>
            <el-radio class="radio" label="IMAGE_TEXT">图文</el-radio>
            <el-radio class="radio" label="TEXT">文字</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="createOptional" v-if="ruleForm.adTypeOnProduct === 'NATIVE'">
          <el-checkbox-group v-model="ruleForm.createOptional" class="checkbox-wrapper">
            <el-checkbox v-for="item in options" :label="item.id" :key="item.id">{{item.text}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <div class="upload-content-wrapper"> 
            <el-form-item label="物料尺寸:" v-if="controlicon">
              <el-select v-model="iconsize" filterable placeholder="请选择">
                <el-option
                  v-for="item in icons"
                  :key="item.sizeType"
                  :label="item.description"
                  :value="item.sizeType">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="广告logo:" prop="logofileList" v-if="controlicon">
              <div class="img-upload-wrapper">
                <el-upload
                  :disabled="logodisable"
                  :data="{type:'ICON_IMAGE', materialSizeType: this.iconsize, materialId: this.iconId}" 
                  class="upload-wrapper"
                  ref="iconref"
                  accept=".jpg,.png,.jpeg,.gif"
                  :action="imgurls"
                  list-type="picture"
                  :multiple="false"
                  :file-list="ruleForm.logofileList"
                  :before-upload="logobeforeupload"
                  :on-remove="logoremove"
                  :on-success="logosuccess"
                  :on-error="logoerror"
                  :on-preview="logopreview"
                  :on-change="logochange"> 
                  <el-button size="small" type="primary">点击上传</el-button>
                  <div class="el-upload__tip" slot="tip">只能上传*.jpg/*.png/*.jpeg/*.gif文件</div>
                </el-upload>
                <el-dialog v-model="logodialogVisible" :modal="false" size="large">
                  <img width="100%" :src="dialoglogoUrl">
                </el-dialog>
              </div>
            </el-form-item>
            <el-form-item label="物料尺寸:" v-if="controlimg">
              <el-select v-model="imgsize" filterable placeholder="请选择">
                <el-option
                  v-for="item in imgs"
                  :key="item.sizeType"
                  :label="item.description"
                  :value="item.sizeType">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="广告物料:" prop="imgfileList" v-if="controlimg">
              <div class="img-upload-wrapper">
                <el-upload
                  :disabled="imgdisable"
                  :data="{type: this.ruleForm.adTypeOnProduct+'_IMAGE', materialSizeType: this.imgsize, materialId: this.imgId}" 
                  class="upload-wrapper"
                  ref="imgref"
                  accept=".jpg,.png,.jpeg,.gif"
                  :action="imgurls"
                  list-type="picture"
                  :multiple="false"
                  :file-list="ruleForm.imgfileList"
                  :before-upload="imgbeforeupload"
                  :on-remove="remove"
                  :on-success="success"
                  :on-error="error"
                  :on-preview="preview"
                  :on-change="change"> 
                  <el-button size="small" type="primary">点击上传</el-button>
                  <div class="el-upload__tip" slot="tip">只能上传*.jpg/*.png/*.jpeg/*.gif文件</div>
                </el-upload>
                <el-dialog v-model="dialogVisible" :modal="false" size="large">
                  <img width="100%" :src="dialogImageUrl">
                </el-dialog>
              </div>
            </el-form-item>
            <el-form-item label="广告标题:"  prop="headline" v-if="controltitle">
              <el-input v-model="ruleForm.headline" placeholder="请输入广告标题"></el-input>
            </el-form-item>
            <el-form-item label="广告内容:"  prop="body" v-if="controlcontent">
              <el-input type="textarea" :rows="4" resize="none" v-model="ruleForm.body" placeholder="请输入广告内容"></el-input>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="交互类型:"  prop="adTypeOnInteraction">
          <el-select v-model="ruleForm.adTypeOnInteraction" filterable placeholder="请选择">
            <el-option
              v-for="item in bidtypes"
              :key="item.id"
              :label="item.text"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="跳转链接:"  prop="targetUrl">
          <el-input v-model="ruleForm.targetUrl" placeholder="请输入http://或https://开头链接"></el-input>
        </el-form-item>
        <el-form-item 
          v-for="(result, index) in revealurls" 
          :label="index === 0 ? '展现监测：' : ''">
          <div class="ad-slot-wrapper">
            <el-input :disabled="index !== (revealurls.length-1)" v-model="result.text" placeholder="请输入展现监测"></el-input>
            <span class="add-source el-icon-plus" v-if="index === (revealurls.length-1)" @click="addreveal(index, result.text)"></span>
            <span class="delete-source el-icon-circle-cross" v-else @click="deletereveal(index)"></span>
          </div>
      	</el-form-item>
      	<el-form-item 
          v-for="(result, index) in clickurls" 
          :label="index === 0 ? '点击监测：' : ''">
          <div class="ad-slot-wrapper">
            <el-input :disabled="index !== (clickurls.length-1)" v-model="result.text" placeholder="请输入点击监测"></el-input>
            <span class="add-source el-icon-plus" v-if="index === (clickurls.length-1)" @click="addclick(index, result.text)"></span>
            <span class="delete-source el-icon-circle-cross" v-else @click="deleteclick(index)"></span>
          </div>
      	</el-form-item> 
        <el-form-item>
          <div class="dialog-footer">
            <el-button @click="cancels('ruleForm')">取 消</el-button>
            <el-button type="primary" @click="creates('ruleForm')">确 定</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
    <div v-if="resourceshow" class="bottom-bg" @click="closes"></div>
    <transition name="slide-fade">
      <createdetail
        v-if="resourceshow" 
        :planname="planname"
        :id="id"
        :createdetail="createdetail"
        @update:show="val => resourceshow = val"
        @update:visible="val => createDialogVisible = val"
        @refreshbizlines="dorefresh"
      ></createdetail>
    </transition>
  </div>
</template>

<script type="ecmascript-6">
import pager from '../../../components/pager/pager.vue';
import createdetail from './config/createdetail.vue';
import upload from '../../../components/upload/imgupload.vue';
import apiUtil from '../../../util/api.js';
export default {
  props: {
    campaignid: {
      type: Number,
      default: -1
    },
    planname: {
      type: String,
      default: ''
    }
  },
  data () {
  	var checkoptions = (rule, value, callback) => {
      if (!value.length) {
        return callback(new Error('至少勾选一项'));
      } else {
        callback();
      }
    };
    var checkurls = (rule, value, callback) => {
      let req = /^(https:\/\/|http:\/\/)/;
      if (!value) {
        return callback(new Error('跳转链接不能为空'));
      }
      setTimeout(() => {
        if (!req.test(value)) {
          callback(new Error('请输入http://或https://开头链接'));
        } else {
          callback();
        }
      }, 1000);
    };
    var checkuploads =  (rule, value, callback) => {
      if (!value.length) {
        return callback(new Error('请上传物料'));
      } else {
        callback();
      }
    };
    return {
      id: this.campaignid,
      planname: this.planname,
      tableData: [],
      options: [{id: '-1', text: '标题'}, {id: '0', text: '描述'}, {id: '1', text: 'logo'}, {id: '2', text: '图片'}],
      bidtypes: [{id: 'OPEN_WEBPAGE', text: '打开网页'}, {id: 'DOWNLOAD_APP', text: '下载应用'}],
      labelPosition: 'top',
      revealurls: [{text: ''}],
      clickurls: [{text: ''}],
      materialids: [],
      icons: [],
      imgsize: '',
      iconsize: '',
      ruleForm: {
        targetUrl: '',
        codeName: '',
        adTypeOnProduct: 'BANNER',
        adTypeOnInterface: 'IMAGE',
        adTypeOnInteraction: '',
        headline: '',
        body: '',
        createOptional: ['-1', '0', '1', '2'],
        id: -1,
        campaignId: -1,
        clickUrls:"",
        showUrls:"",
        imgfileList: [],
        logofileList: []
      },
      rules: {
        targetUrl: [
          { required: true, validator: checkurls, trigger: 'blur' }
        ],
        codeName: [
          { required: true, message: '请输入创意名称', trigger: 'blur' },
          { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
        ],
        body: [
          { required: true, message: '请输入广告内容', trigger: 'blur' }
        ],
        headline: [
          { required: true, message: '请输入广告标题', trigger: 'blur' },
          { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
        ],
        adTypeOnProduct: [
          { required: true, message: '请选择广告类型', trigger: 'change' }
        ],
        adTypeOnInterface: [
          { required: true, message: '请选择广告形式', trigger: 'change' }
        ],
        adTypeOnInteraction: [
          { required: true, message: '请选择交互类型', trigger: 'change' }
        ],
        createOptional: [
          { required: true, validator: checkoptions, trigger: 'change' }
        ],
        imgfileList: [
          { required: true, validator: checkuploads }
        ],
        logofileList: [
          { required: true, validator: checkuploads }
        ]
      },
      keyword: '',
      totalRecords: -1,
      pageNum: 1,
      pageSize: 20,
      loadings: false,
      resourceshow: false,
      createDialogVisible: false,
      signs: false,
      imgurls: apiUtil.url('/v1/adv/campaigns/materials'),
      // icon 上传
      logofileName: '',
      logofileUrl: '',
      iconId: -1,
      dialoglogoUrl: '',
      logodialogVisible: false,
      logodisable: false,
      // img 上传
      imgfileName: '',
      imgfileUrl: '',
      imgId: -1,
      dialogImageUrl: '',
      dialogVisible: false,
      imgdisable: false,
      // 创意详情
      createdetail: {},
      sizes: {}
    };
  },
  computed: {
    imgs () {
      let item = [];
      switch (this.ruleForm.adTypeOnProduct) {
        case 'BANNER':
          item = this.sizes.BANNER;
        break;
        case 'SPLASH':
          item = this.sizes.SPLASH;
        break;
        case 'INTERSTITIAL':
          item = this.sizes.INTERSTITIAL;
        break;
        case 'NATIVE':
          item = this.sizes.NATIVE;
        break;
      }
      return item;
    },
    controlicon () {
      return (this.ruleForm.adTypeOnProduct === 'NATIVE' && this.ruleForm.createOptional.indexOf('1')>-1) || (this.ruleForm.adTypeOnProduct === 'BANNER' && this.ruleForm.adTypeOnInterface === 'IMAGE_TEXT');
    },
    controlimg () {
      return (this.ruleForm.adTypeOnProduct === 'BANNER' && this.ruleForm.adTypeOnInterface === 'IMAGE') || this.ruleForm.adTypeOnProduct === 'SPLASH' || this.ruleForm.adTypeOnProduct === 'INTERSTITIAL' || (this.ruleForm.adTypeOnProduct === 'NATIVE' && this.ruleForm.createOptional.indexOf('2')>-1);
    },
    controltitle () {
      return (this.ruleForm.adTypeOnProduct === 'NATIVE' && this.ruleForm.createOptional.indexOf('-1')>-1) || (this.ruleForm.adTypeOnProduct === 'BANNER' && this.ruleForm.adTypeOnInterface !== 'IMAGE');
    },
    controlcontent () {
      return (this.ruleForm.adTypeOnProduct === 'NATIVE' && this.ruleForm.createOptional.indexOf('0')>-1) || (this.ruleForm.adTypeOnProduct === 'BANNER' && this.ruleForm.adTypeOnInterface !== 'IMAGE');
    },
    // 上传与否
    forupload () {
      return (this.ruleForm.adTypeOnProduct === 'NATIVE' && this.ruleForm.createOptional.indexOf('1')===-1 && this.ruleForm.createOptional.indexOf('2')===-1) || (this.ruleForm.adTypeOnProduct === 'BANNER' && this.ruleForm.adTypeOnInterface === 'TEXT');
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.load();
      this.getsize();
    });
  },
  components: { pager, createdetail, upload },
  methods: {
  	dorefresh (val) {
      console.log(val);
      console.log(this.pageNum);
      this.load(this.pageNum, 20); 
    },
  	getsize () {
  	  this.loadings = true;
      this.$http.get('/v1/adv/material_size').then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.icons = result.ICON; 
        this.iconsize = this.icons[0].sizeType;  
        this.sizes = result;
        this.imgsize = this.imgs[0].sizeType; 
      }, () => {
        this.loadings = false;
      });
  	},
    load (pageNum, pageSize) {
      let params = {};
      if (pageNum) {
        this.pageNum = pageNum;
      }
      params.keyword = this.keyword;
      params.pageSize = pageSize || this.pageSize;
      params.pageindex = pageNum || this.pageNum;
      params.campaignId = this.id;
      this.loadings = true;
      this.$http.get('/v1/adv/campaign/{campaignId}/{pageindex}/{pageSize}/creatives', {params: params}).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;   
        this.pageSize = result.pageSize;
        this.totalRecords = result.total;
        this.tableData = result.list;
      }, () => {
        this.loadings = false;
      });
    },
    addcreate () {
      this.createDialogVisible = true;
      // 标记修改或新增
      this.signs = true;
    },
    creates (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid && ((this.materialids.length && !this.forupload)||this.forupload)) {
          this.updatas(formName);
        } else {
          return this.$alert('请正确输入相应选项或正确上传！！！', '提示：', {
            confirmButtonText: '确定'
          });
        }
      });
    },
    updatas (formName) {
      if (this.clickurls.length) {
        let clickUrlArr = [];
        for (let i = 0; i < this.clickurls.length; i++) {
          clickUrlArr.push(this.clickurls[i].text);
        }
        this.ruleForm.clickUrls = clickUrlArr.join(',');
      }
      if (this.revealurls.length) {
        let revealUrlArr = [];
        for(let i = 0; i < this.revealurls.length; i++){
          revealUrlArr.push(this.revealurls[i].text);
        }
         this.ruleForm.showUrls = revealUrlArr.join(',');
      }
      if (this.ruleForm.adTypeOnProduct === 'NATIVE' && typeof(this.ruleForm.createOptional) === 'object') {
        this.ruleForm.createOptional = this.ruleForm.createOptional.join(',');
      } else {
      	this.ruleForm.createOptional = '';
      }
      this.ruleForm.campaignId = this.id;
      let creativesdata = this.ruleForm;
      delete creativesdata.imgfileList;
      delete creativesdata.logofileList;
      let params = {};
      params.creatives = JSON.stringify(creativesdata);
      this.loadings = true;
      this.$http.post('/v1/adv/campaigns/creatives', params).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.imgdata(result, formName);
      }, () => {this.loadings = false;});
    },
    // 图片相关信息
    imgdata (result, formName) {
      if (this.materialids.length) {
      	for (let i = 0; i < this.materialids.length; i++) {
          this.loadings = true;
          let params = {};
          params.meterialId = this.materialids[i].materialId;
          params.materialType = this.materialids[i].materialType;
          this.$http.post("/v1/adv/campaigns/"+result+"/materials", params).then((res) => {
            this.loadings = false;
            let data = res.body;
            if (data.ret!=1) {
              return this.$alert(data.message, '提示：', {
                confirmButtonText: '确定'
              });
            }
            this.cancels(formName);
          }, () => {this.loadings = false;});
        }
        this.load();
      } else {
        return this.$alert('创意创建过程中物料上传错误！！！', '提示：', {
          confirmButtonText: '确定'
        });
      }
    },
    changesize () {
      this.imgsize = this.imgs[0].sizeType;
    },
    getdetail (id) {
      this.loadings = true;
      this.$http.get('/v1/adv/creatives/'+id+'/creative').then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.createdetail = result;
        this.shows();
      }, () => {this.loadings = false;});
    },
    shows () {
      this.resourceshow = true;
    },
    closes () {
      this.resourceshow = false;
    },
    cancels (formName) {
      this.createDialogVisible = false;
      this.$refs[formName].resetFields(); 
      this.signs = false;
      this.materialids = [];
      this.clickurls = this.revealurls = [{text: ''}];
    },
    closedate () {
      // 标记修改或新增
      this.signs = false;
      this.materialids = [];
      this.iconsize = this.icons[0].sizeType;
      this.imgsize = this.imgs[0].sizeType; 
      this.clickurls = this.revealurls = [{text: ''}];
      this.ruleForm = {
        targetUrl: '',
        codeName: '',
        adTypeOnProduct: 'BANNER',
        adTypeOnInterface: 'IMAGE',
        adTypeOnInteraction: '',
        headline: '',
        body: '',
        createOptional: ['-1', '0', '1', '2'],
        id: -1,
        campaignId: -1,
        clickUrls:"",
        showUrls:"",
        imgfileList: [],
        logofileList: []
      };
    },
    // img上传
    remove (file, fileList) {
      this.imgdisable = false;
      this.$refs.imgref.clearFiles();
      this.ruleForm.imgfileList = fileList;
      console.log(file);
      console.log(fileList);
      for (let i = 0; i < this.materialids.length; i++) {
      	if (file !== null && file.response && file.response.result) {
          if (file.response.result.materialId === this.materialids[i].materialId) {
            this.materialids.splice(i, 1);
          }
        } else if (file.url === this.materialids[i].url) {
          this.materialids.splice(i, 1);
        }
      }
      console.log(this.materialids);
    },
    preview (file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    success (data, file, fileList) {
      this.imgdisable = false;
      if (data.ret!=1) {
      	this.$refs.imgref.clearFiles();
        return this.$alert(data.message, '提示：', {
          confirmButtonText: '确定'
        });
      }
      let datas = {};
      datas.url = data.result.imageSrc;
      datas.materialId = data.result.materialId;
      datas.materialType = data.result.materialType;
      this.materialids.push(datas);
      this.ruleForm.imgfileList = fileList;
    },
    imgbeforeupload (file) {
      this.imgdisable = true;
      if (this.ruleForm.imgfileList.length >= 1) {
        this.$alert('最多上传1张图片', '提示：', {
          confirmButtonText: '确定'
        });
        return false;
      }
    },
    error (data) {
      return this.$alert(data.message, '提示：', {
        confirmButtonText: '确定'
      });
    },
    change (file, fileList) {
      // console.log(data);
    },
    // icon上传
    logoremove (file, fileList) {
      this.logodisable = false;
      this.$refs.iconref.clearFiles(); 
      this.ruleForm.logofileList = fileList;
      for (let i = 0; i < this.materialids.length; i++) {
        if (file !== null && file.response && file.response.result) {
          if (file.response.result.materialId === this.materialids[i].materialId) {
            this.materialids.splice(i, 1);
          } 
        } else if (file.url === this.materialids[i].url) {
          this.materialids.splice(i, 1);
        }
      } 
    },
    logopreview (file) {
      this.dialoglogoUrl = file.url;
      this.logodialogVisible = true;
    },
    logosuccess (data, file, fileList) {
      this.logodisable = false;
      if (data.ret!=1) {
      	this.$refs.iconref.clearFiles(); 
        return this.$alert(data.message, '提示：', {
          confirmButtonText: '确定'
        });
      }
      let datas = {};
      datas.url = data.result.imageSrc;
      datas.materialId = data.result.materialId;
      datas.materialType = data.result.materialType;
      this.materialids.push(datas);
      this.ruleForm.logofileList = fileList;
    },
    logobeforeupload (file) {
      this.logodisable = true;
      if (this.ruleForm.logofileList.length >= 1) {
        this.$alert('最多上传1张图片', '提示：', {
          confirmButtonText: '确定'
        });
        return false;
      }
    },
    logoerror (data) {
      return this.$alert(data.message, '提示：', {
        confirmButtonText: '确定'
      });
    },
    logochange (file, fileList) {
      // console.log(data);
    },
    // 添加点击、展现监测
    addreveal (index, text) {
      if(text==''){
        return this.$alert('输入为空时不得继续添加！', '提示：', {
          confirmButtonText: '确定'
        });
      }
      var item = {};
      item.text = "";
      this.revealurls.push(item);
    },
    deletereveal (index) {
      return this.$confirm('确定删除吗？').then((res) => {
        if (res === 'confirm') {
          this.revealurls.splice(index, 1);  
        }
      }).catch((res) => {console.log(res)});
    },
    addclick (index, text) {
      if(text==''){
        return this.$alert('输入为空时不得继续添加！', '提示：', {
          confirmButtonText: '确定'
        });
      }
      var item = {};
      item.text = "";
      this.clickurls.push(item);
    },
    deleteclick (index) {
      return this.$confirm('确定删除吗？').then((res) => {
        if (res === 'confirm') {
          this.clickurls.splice(index, 1); 
        }
      }).catch((res) => {console.log(res)});
    },
    // 获取修改值
    getdate () {
      if (this.signs) {
        return;
      }
      let meterials = this.createdetail.materialses;
      this.ruleForm.targetUrl = this.createdetail.targetUrl;
      this.ruleForm.codeName = this.createdetail.codeName;
      this.ruleForm.adTypeOnProduct = this.createdetail.adTypeOnProduct;
      this.ruleForm.adTypeOnInterface = this.createdetail.adTypeOnInterface;
      this.ruleForm.adTypeOnInteraction = this.createdetail.adTypeOnInteraction;
      this.ruleForm.headline = this.createdetail.headline;
      this.ruleForm.body = this.createdetail.body;
      this.ruleForm.createOptional = this.createdetail.createOptional.split(',');
      this.ruleForm.id = this.createdetail.id;
      this.ruleForm.showUrls = this.createdetail.showUrls;
      this.ruleForm.clickUrls = this.createdetail.clickUrls;
      // 获取监测链接
      if (this.createdetail.showUrls!=='') {
        this.revealurls = [];
        let showHref = this.createdetail.showUrls.split(',');
        for (let i = 0; i < showHref.length; i++) {
          let cenShow = {};
          cenShow.text = showHref[i];
          this.revealurls.push(cenShow);
        }
      } 
      if (this.createdetail.clickUrls!=='') {
        this.clickurls = [];
        let clickHref = this.createdetail.clickUrls.split(',');
        for (let j = 0; j < clickHref.length; j++) {
          let cenClick = {};
          cenClick.text = clickHref[j];
          this.clickurls.push(cenClick);
        }
      }
      console.log(this.ruleForm);
      // 处理图片相关
      if (meterials.length) {
      	for (let i = 0; i < meterials.length; i++) {
      	  let item = {};
      	  item.url = meterials[i].materialUrl;
      	  item.materialType = meterials[i].materialType;
      	  item.materialId = meterials[i].materialId;
      	  this.materialids.push(item);
      	  if (meterials[i].materialType === 'ICON_IMAGE') {
            let iconitem = {};
            iconitem.name = meterials[i].name;
            iconitem.url = meterials[i].materialUrl;
            this.iconsize = meterials[i].materialSizeType;
            this.ruleForm.logofileList.push(iconitem);
          } else {
            let imgitem = {};
            imgitem.name = meterials[i].name;
            imgitem.url = meterials[i].materialUrl;
            this.imgsize = meterials[i].materialSizeType;
            this.ruleForm.imgfileList.push(imgitem);
          }
        }
      }
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .ad-create-wrapper
    overflow: hidden  
    .el-form-item
      .ad-slot-wrapper
        position: relative
        .el-input
          width: 100% 
          padding-right: 40px
          box-sizing: border-box
        .delete-source
          position: absolute
          top: 5px 
          right: 5px
          color: red
          cursor: pointer
          font-size: 24px
        .add-source
          position: absolute
          top: 6px
          right: 5px
          color: #fff
          cursor: pointer
          font-size: 14px
          padding: 5px
          background: #20a0ff
          border-radius: 50%
      .upload-content-wrapper
        padding: 20px
        background: #f5f5f5
        border-radius: 4px
        .el-form-item
          margin-bottom: 20px
          &:last-child
            margin-bottom: 0
      .el-select
        display: block
      .checkbox-wrapper
        margin: -25px 0 -10px 0;
        display: block
        .el-checkbox
          color: #565656
          width: 7%
          margin-right: 30px
          &:last-child
            margin-right: 0
      .radio-wrapper
        margin: 5px 0
        display: block
        .el-radio
          color: #565656
          width: 10%
          &:last-child
            margin-right: 30px
      .dialog-footer
        float: right
      &:last-child
        margin-bottom: 0
    .app-top-wrapper
      margin-bottom: 20px
      .app-search
        max-width: 300px
        font-size: 0
        .el-input
          width: 230px
          input
            border-radius: 4px 0 0 4px
        button 
          border-radius: 0 4px 4px 0
    .apps-data-table
      margin-bottom: 15px
    // 侧向划出   
    .slide-fade-enter-active 
      transition: all .8s ease
    .slide-fade-leave-active 
      transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0)
    .slide-fade-enter, .slide-fade-leave-to
      transform: translateX(200px)
      opacity: 0
</style>
