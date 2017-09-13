<template>
  <div class="data-index-wrapper">
    <h2>广告主财务概览</h2>
    <div class="data-total-wrapper">
      <totaldata :items="totalData" :nums="nums"></totaldata>
    </div>
    <div class="data-table-wrapper">
      <el-table :data="tableData" stripe style="width: 100%" v-loading.fullscreen.lock="loadings" element-loading-text="拼命加载中">
        <el-table-column label="日期" show-overflow-tooltip>
          <template scope="props">
            <span>{{props.row.date | date }}</span> 
          </template>
        </el-table-column>
        <el-table-column prop="CONSUME" label="消费（￥）" show-overflow-tooltip></el-table-column>
        <el-table-column prop="DEPOSIT" label="充值（￥）" show-overflow-tooltip></el-table-column>
        <el-table-column prop="REFUND" label="退款（￥）" show-overflow-tooltip></el-table-column>
      </el-table>
    </div>
    <div class="pager-wrapper clearfix" v-if="tableData.length">
      <pager :total-records="totalRecords" @pagechange="load" :page-sizes="pageSize" :page-nums="pageNum"></pager>
    </div>
  </div>
</template>

<script type="ecmascript-6">
import totaldata from '../../../components/totaldata/totaldata.vue';
import pager from '../../../components/pager/pager.vue';
export default {
  data () {
    return {
      totalData: [
        {icon: 'el-icon-star-on',num: 0,text: '账户余额'}
      ],
      nums: 6,
      tableData: [],
      loadings: false,
      totalRecords: -1,
      pageNum: 1,
      pageSize: 20
    };
  },
  mounted () {
    this.$nextTick(() => {
      this.load();
      this.loadAll();
    });
  },
  components: { pager, totaldata },
  methods: {
  	loadAll () {
      this.loadings = true;
      this.$http.get('/v1/adv/stats/finances/balance').then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.totalData[0].num = result.balance;
      }, () => {this.loadings = false;});
    },
    load (pageNum, pageSize) {
      this.loadings = true;
      let params = {};
      params.pageSize = pageSize || this.pageSize;
      params.pageNum = pageNum || this.pageNum;
      this.$http.get('/v1/adv/finances/settles/{pageNum}/{pageSize}', {params: params}).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result; 
        this.pageSize = result.pageSize;
        this.totalRecords = result.total;
        this.tableData = result.list;
      }, () => {this.loadings = false;});
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .data-index-wrapper    
    .data-total-wrapper
      margin-bottom: 15px
    .data-table-wrapper
      margin-bottom: 20px 
</style>
