<template>
  <div class="create-detail-wrapper">
    <div class="btn-wrapper">
      <el-button type="info" size="small" @click="copy()">复制</el-button>
      <el-button type="info" size="small" @click="update()">修改</el-button>
      <el-button type="danger" size="small" @click="deletes()">删除</el-button>
    </div>
    <h1 class="title">{{ creates.codeName }}</h1>
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="content-module">
          <h2>创意所属</h2>
          <div class="dowm-forward">
            <span class="list-title">所属计划：</span>
            <div class="font-style">{{ plannames }}</div>
          </div>
          <div class="dowm-forward" v-if="creates.strategyNames&&creates.strategyNames.length">
            <span class="list-title">所属策略：</span>
            <div class="font-style" v-for="result in creates.strategyNames">{{ result }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="12">  
        <div class="content-module">
          <h2>创意详情</h2>
          <div class="dowm-forward">
            <span class="list-title">审核状态：</span>
            <div class="font-style">{{ creates.verificationStatus | states }}</div>
          </div>
          <div class="dowm-forward">
            <span class="list-title">广告形式：</span>
            <div class="font-style">{{ creates.adTypeOnProduct | adtype }}</div>
          </div>
          <div class="dowm-forward" v-if="creates.headline">
            <span class="list-title">广告语：</span>
            <div class="font-style">{{ creates.headline }}</div>
          </div>
          <div class="dowm-forward" v-if="creates.body">
            <span class="list-title">描述语：</span>
            <div class="font-style">{{ creates.body }}</div>
          </div>
          <div class="dowm-forward" v-if="creates.materialses&&creates.materialses.length">
            <span class="list-title">创意列表：</span>
            <div v-for="(result, index) in creates.materialses">
              <div class="create-list" v-if="result.materialType!='ICON_IMAGE'">
                <img :src="result.materialUrl"/> 
                <p class="discribe-content">{{ creates.body }}</p> 
              </div>
              <div class="create-list clearfix" v-else>
                <img :src="result.materialUrl" class="pull-left icon-img"/> 
                <div class="pull-left describe-wrapper"> 
                  <p class="discribe-content">{{ creates.headline }}</p>
                  <p class="discribe-content">{{ creates.body }}</p> 
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div> 
</template>

<script type="ecmascript-6">
export default {
  props: {
    createdetail: {
      type: Object,
      default: {}
  	},
    planname: {
      type: String
    },
    id: {
      type: String
    }
  },
  data () {
    return {
      plannames: this.planname,
      campaignid: this.id
    };
  },
  filters: {
    states (value) {
      let item;
      switch (value){
        case 'CREATING':
          item = '创建中';
          break;
        case 'PENGDING':
          item = '等待审核';
          break;
        case 'APPROVED':
          item = '审核通过';
          break;
        case 'DENIED':
          item = '审核拒绝';
          break;
      }
      return item;
    },
    adtype (value) {
      let item;
      switch (value){
        case 'NATIVE':
          item = '原生广告';
          break;
        case 'BANNER':
          item = '横幅广告';
          break;
        case 'SPLASH':
          item = '开屏广告';
          break;
        case 'INTERSTITIAL':
          item = '插屏广告';
          break;
      }
      return item;
    }
  },
  computed: {
    creates () {
      return this.createdetail; 
    }
  },
  components: { },
  methods: {
    back () {
      this.$emit('update:show', false);
    },
    update () {
      this.$emit('update:visible', true);
    },
    deletes () {
      return this.$confirm('确定删除吗？？？').then((res) => {
        if (res === 'confirm') {
          this.loadings = true;
          this.$http.delete('/v1/adv/campaigns/creatives/'+this.creates.id).then((res) => {
            this.loadings = false;
            let data = res.body;
            if (data.ret!=1) {
              return this.$alert(data.message, '提示：', {
                confirmButtonText: '确定'
              });
            } else {
              return this.$alert('删除成功！！！', '提示：', {
                confirmButtonText: '确定',
                callback: () => {
                  this.back();
                  this.$emit('refreshbizlines', '刷新列表'); 
                }
              });
            }
          }, () => {this.loadings = false;});
        }  
      }).catch((res) => {console.log(res)});
    },
    copy (pageNum, pageSize) {
      this.dialogTableVisible = true;
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .create-detail-wrapper
    background: #fff
    position: fixed
    top: 0
    left: 20%
    width: 80%
    height: 100%
    overflow: auto
    z-index: 100
    padding: 20px
    box-sizing: border-box
    .word-over-hidden
      line-height: 20px
      display: inline-block
      width: 50%
    .btn-wrapper
      padding-bottom: 10px
      border-bottom: 1px dashed #50bfff
      margin-bottom: 15px
    .title 
      font-size: 24px
      margin-bottom: 15px
      color: #2CA1DD 
    .content-module
      margin-bottom: 15px  
      .dowm-forward
        margin-bottom: 10px
        padding-left: 10px
        .create-list
          width: 80%
          height: auto
          padding: 2px
          background: #fff
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.2)
          border: 1px dotted #eee
          border-radius: 4px
          margin-bottom: 5px   
          cursor: pointer
          img
            display: block
            width: 100%
            height: auto
          .describe-wrapper
            margin-left: 5%
            margin-top: 3%
          .icon-img
            width: 15%
          .discribe-content
            font-size: 14px
            color: #475669
            padding: 5px 0
        .font-style
          color: #324057
          font-size: 14px
          margin-bottom: 5px 
          display: block
</style>
