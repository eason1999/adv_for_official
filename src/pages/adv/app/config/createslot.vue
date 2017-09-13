<template>
  <div class="step-slot-wrapper">
    <div class="data-content-wrapper">
      <el-form :model="ruleForm" :rules="rules" :label-position="labelPosition" ref="ruleForm" v-loading.fullscreen.lock="loadings" element-loading-text="拼命加载中">
        <el-form-item 
          v-for="(result, index) in ruleForm.adslots" 
          :label="index === 0 ? '广告位：' : ''" 
          :prop="'adslots.' + index + '.name'"
          :key="result._timestamp"
          :rules="{
            required: true, message: '广告位不能为空', trigger: 'blur'
          }">
          <div class="ad-slot-wrapper">
            <el-input v-model="result.name" placeholder="请输入应用名称"></el-input>
            <el-select v-model="result.type" filterable placeholder="请选择">
              <el-option
                v-for="item in slots"
                :key="item.id"
                :label="item.text"
                :value="item.id"> 
              </el-option>
            </el-select>
            <span class="delete-source el-icon-circle-cross" @click="deletes(index)"></span>
          </div>
      	</el-form-item>
        <div class="dowm-forward">
          <el-button type="info" @click="addslots">+创建更多广告位</el-button>
        </div>	
        <el-form-item>
          <el-button type="default" @click="back">上一步</el-button>
          <el-button type="primary" @click="config('ruleForm')">提交审核</el-button>
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
    return {
      slots: [],
      ruleForm: {
        adslots: [{
          name: '',
          type: 'BANNER',
          _timestamp: -1
	    }],
	  },
	  labelPosition: 'top',  
      loadings: false,
      active: this.actives,
      appId: this.$store.state.appsteps.appId
    };
  },
  mounted () {
    this.$nextTick(() => {
      this.loadtypes();
    });
  },
  components: { },
  methods: {
  	addslots () {
      this.ruleForm.adslots.push({
        name: "",
        type: this.slots[0].id,
        _timestamp: +(new Date())
      });
  	},
    loadtypes () {
      this.loadings = true;
      this.$http.get('/v1/dict/types/adslots').then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.slots = result;
      }, () => {this.loadings = false});
    },
    deletes (index) {
      if (this.ruleForm.adslots.length === 1) {
      	return this.$alert('至少保留一个广告位数据！', '提示：', {
          confirmButtonText: '确定'
      	});
      }
      this.ruleForm.adslots.splice(index, 1);
    },
    config (formName) {	
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.creates();
        } else {
          return this.$alert('请正确输入相应选项！！！', '提示：', {
            confirmButtonText: '确定'
          });
        }
      });
    },
    creates () {
      this.loadings = true;
      let params = {}; 
      params.adslots = JSON.stringify(this.ruleForm.adslots);
      this.$http.post('/v1/dev/apps/'+this.appId+'/adslots', params).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        this.updates();
      }, () => {
        this.loadings = false;
      });
    },
    updates () {
      this.loadings = true;
      this.$http.put('/v1/dev/apps/'+this.appId+'/audit').then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        this.active = 2;
        this.$emit('update:actives', 2); 
      }, () => {
        this.loadings = false;
      });
    },
    back () {
      this.active = 0;
      this.$emit('update:actives', 0);
      this.$store.commit('EDIT_ID', this.appId);
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .step-slot-wrapper
    background: #fff 
    margin-top: 20px
    .data-content-wrapper
      .dowm-forward
        width: 280px
        margin-bottom: 20px
      .el-form-item
        width: 280px
        .ad-slot-wrapper
          position: relative
          .delete-source
            position: absolute
            top: 10px 
            right: -20px
            color: red
            cursor: pointer
            font-size: 16px 	 
          .el-select
            display: inline-block
            width: 100px
            .el-input
              display: block
              width: 100%
          .el-input
            width: 170px  
          &:last-child
            margin-bottom: 0 
        &:last-child
          margin-bottom: 0       
</style>
