<template>
  <div class="strategy-detail-wrapper">
    <div class="btn-wrapper">
      <el-button type="info" size="small" @click="select()">创意选择</el-button>
      <el-button type="info" size="small" @click="update()">修改</el-button>
      <el-button type="danger" size="small" @click="deletes()">删除</el-button>
    </div>
    <h1 class="title">{{ strategys.name }}</h1>
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="content-module">
          <h2>广告投放</h2>
          <div class="dowm-forward">
            <span class="list-title">所属计划：</span>
            <div class="font-style">{{ plannames }}</div>
          </div>
          <div class="dowm-forward">
            <span class="list-title">投放时段：</span>
            <div class="font-style" v-for="result in deliveryCycle">{{ result }}</div>
          </div>
          <div class="dowm-forward">
            <span class="list-title">计费类型：</span>
            <div class="font-style">{{ strategys.bidType }}</div>
          </div>
          <div class="dowm-forward">
            <span class="list-title">单价：</span>
            <div class="font-style">{{ strategys.bidPrice }}</div>
          </div>
          <div class="dowm-forward">
            <span class="list-title">日预算：</span>
            <div class="font-style">{{ strategys.budgetAmountDaily }}</div>
          </div>
          <div class="dowm-forward">
            <span class="list-title">总预算：</span>
           <div class="font-style">{{ strategys.budgetAmountTotal }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="12">  
        <div class="content-module">
          <h2>广告定向</h2>
          <div class="dowm-forward">
            <span class="list-title">操作系统：</span>
            <div class="font-style">{{ targets.OS }}</div>
          </div>
          <div class="dowm-forward">
            <span class="list-title">时间段：</span>
            <div class="font-style">{{ dateRange }}</div>
          </div>
          <div class="dowm-forward">
            <span class="list-title">网络类型：</span>
            <div class="font-style">{{ netWork }}</div>
          </div>
          <div class="dowm-forward">
            <span class="list-title">定向地域：</span>
            <div class="word-over-hidden font-style">{{ locations }}</div>
          </div>
        </div>
      </el-col>
    </el-row> 
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="content-module" v-if="createives.length">
          <h2>广告创意</h2>
          <div class="dowm-forward">
            <span class="list-title">创意列表：</span>
            <div class="create-list" v-for="(result, index) in createives">
              <span class="word-over-hidden">{{ result.codeName }}</span>
              <span class="el-icon-edit edits"></span>
              <span class="el-icon-circle-cross deletes" @click="deletes(index, result.id)"></span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="12"></el-col>
    </el-row>
    <el-dialog title="收货地址" :visible.sync="dialogTableVisible" :modal-append-to-body="false">
      <el-table :data="gridData" v-loading.body="loadings">
        <el-table-column label="全选"></el-table-column>
        <el-table-column property="name" label="创意名称"></el-table-column>
        <el-table-column property="type" label="广告类型"></el-table-column>
        <el-table-column property="name" label="预览"></el-table-column>
        <el-table-column property="type" label="审核状态"></el-table-column>
      </el-table>
      <div class="pager-wrapper clearfix" v-if="gridData.length">
        <pager :total-records="totalRecords" @pagechange="load" :page-sizes="pageSize" :page-nums="pageNum"></pager>
      </div>
      <div class="dialog-footer clearfix" v-if="gridData.length">
        <el-button class="pull-right" type="primary" @click="creates">确 定</el-button>
        <el-button class="pull-right" @click="cancels">取 消</el-button>
      </div>
    </el-dialog>
  </div> 
</template>

<script type="ecmascript-6">
import pager from '../../../../components/pager/pager.vue';
export default {
  props: {
    strategydetail: {
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
      gridData: [],
      pageNum:1,
      pageSize:20,
      totalRecords:-1,
      campaignid: this.id,
      loadings: false,
      dialogTableVisible: false
    };
  },
  computed: {
    strategys () {
      return this.strategydetail.strategy; 
    },
    targets () {
      return this.strategydetail.target; 
    },
    createives () {
      return this.strategydetail.createives; 
    },
    dateRange () {
      let item;
      if(this.targets.DAY_PART === '-1'){
        item = "不限";
      }else{
        let arr = this.targets.DAY_PART.split(',');
        item = arr[0]+':00 - '+arr[arr.length-1]+':00';
      }
      return item;
    },
    netWork () {
      let strings;
      if(this.targets.NETWORK_TYPE=='-1'){
        strings = "wifi, 2G, 3G, 4G";
      }else{
        strings = this.targets.NETWORK_TYPE;
      }
      return strings;
    },
    locations () {
      let item;
      if(this.targets.LOCATION === ''){
        item = "不限";
      }else{
        item = this.targets.LOCATION;
      }
      return item;
    },
    deliveryCycle () {
      let newArr = [],cenArr = [],item;
      let arr = this.strategys.deliveryCycle;
      // 时间段处理
      if (arr === '') {
        newArr.push('无数据');
      } else if (arr.indexOf('$') > -1) {
        let arrs = arr.split('$');
        for(let i = 0; i < arrs.length; i++){
          cenArr.push(arrs[i].split(','));
        }
        for(let j = 0; j < cenArr.length; j++){
          item = moment(Number(cenArr[j][0])).format("YYYY-MM-DD")+" / "+moment(Number(cenArr[j][1])).format("YYYY-MM-DD");
          newArr.push(item);
        }
        
      }else{
        let arrs = arr.split(',');
        item = moment(Number(arrs[0])).format("YYYY-MM-DD")+" / "+moment(Number(arrs[1])).format("YYYY-MM-DD");
        newArr.push(item);
      }
      
      return newArr;
    }
  },
  components: { pager },
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
          let params = {};
          params.strategyId = this.strategys.id;
          this.$http.get('/v1/adv/strategys/strategy', {params: params}).then((res) => {
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
    select (pageNum, pageSize) {
      this.dialogTableVisible = true;
      this.load();
    },
    load (pageNum, pageSize) {
      this.loadings = true;
      let params = {};
      params.campaignId = this.campaignid;
      params.strategyId = this.strategys.id;
      params.pageIndex = pageNum || this.pageNum;
      params.pageSize = pageSize || this.pageSize;
      params.keyword = '';
      this.$http.get('/v1/adv/strategy/{campaignId}/{strategyId}/getcreatives/{pageIndex}/{pageSize}', {params: params}).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.messge, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.gridData = result.list;
        this.pageNum = result.pageNum;
        this.pageSize = result.pageSize;
        this.totalRecords = result.total;
      }, () => {this.loadings = false;});
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .strategy-detail-wrapper
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
          color: #333
          font-size: 14px
          margin-bottom: 5px  
          .edits
            color: #48B9FF
            cursor: pointer
            margin-right: 5px
          .deletes 
            color: #FF4949
            cursor: pointer
        .font-style
          color: #324057
          font-size: 14px
          margin-bottom: 5px 
          display: block
    .el-dialog
      .pager-wrapper
        margin-top: 20px
      .dialog-footer
        margin-top: 10px
        padding-top: 10px
        border-top: 1px dashed #ccc
        .el-button
          margin-left: 5px
</style>
