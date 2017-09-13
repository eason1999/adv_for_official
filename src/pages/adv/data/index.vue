<template>
  <div class="data-index-wrapper">
    <h2>数据管理</h2>
    <div class="data-title-wrapper clearfix">
      <div class="data-select-wrapper pull-right">
        <div class="plan-select inline-block">
          <el-select v-model="planId" filterable @change="loadcreates" placeholder="全部应用" v-loading.fullscreen.lock="loadings" element-loading-text="拼命加载中">
            <el-option
              v-for="item in plans"
              :key="item.id"
              :label="item.text"
              :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div class="create-select inline-block">
          <el-select v-model="createId" @change="load" filterable placeholder="全部广告位">
            <el-option
              v-for="item in creates"
              :key="item.id"
              :label="item.text"
              :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div class="datepicker-wrapper inline-block">
          <datepicker :datepickers="datepickers" @datechange="load" :picker-options="pickerOptions"></datepicker>
        </div>
      </div>
    </div>
    <div class="echarts-wrapper">
      <div id="charts" class="chart-cnt"></div>
    </div>
    <div class="data-table-wrapper">
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column label="日期" show-overflow-tooltip>
          <template scope="props">
            <span>{{props.row.date | date }}</span> 
          </template>
        </el-table-column>
        <el-table-column prop="numOfAdImpressions" label="展现数" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="numOfAdClicks" label="点击数" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="chargeInitalData" label="消费（￥）" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="ctr" label="点击率（%）" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="cpm" label="eCPM（￥）" sortable show-overflow-tooltip></el-table-column>
      </el-table>
    </div>
    <div class="data-footer-wrapper clearfix" v-if="tableData.length">
      <el-button type="primary" class="pull-left"><a :href="exportURL" download="123">导出EXCEL</a></el-button>
      <div class="page-wrapper pull-right">
        <pager :total-records="totalRecords" @pagechange="load" :page-sizes="pageSize" :page-nums="pageNum"></pager>
      </div>
    </div>
  </div>
</template>

<script type="ecmascript-6">
import apiUtil from '../../../util/api.js';
import datepicker from '../../../components/datepicker/datepicker.vue';
import pager from '../../../components/pager/pager.vue';
import echarts from 'echarts';
export default {
  data () {
    return {
      planId: -1,
      plans: [{id: -1, text: '全部计划'}],
      createId: -1,
      creates: [{id: -1, text: '全部创意'}],
      tableData: [],
      totalRecords: -1,
      pageNum: 1,
      pageSize: 20,
      datepickers: {value: [new Date(new Date().getTime()-7*24*3600*1000), new Date()], align: 'right', type: 'daterange'},
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > new Date().getTime();
        },
        onPick (data) {
        }
      },
      loadings: false
    };
  },
  computed: {
    exportURL () {
      let url = apiUtil.url('/v1/adv/stats/creativeOfDay/'+this.planId+'/'+this.createId+'/export');
      let params = [];
      params.push("startDate="+this.datepickers.value[0].getTime());
      params.push("endDate="+this.datepickers.value[1].getTime()); 
      if (params.length) {
        url+="?"+params.join("&");
      }
      return url;
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.loadplans();
    });
  },
  components: { datepicker, pager },
  methods: {
    loadplans () {
      this.loadings = true;
      this.$http.get('/v1/adv/names/campaigns').then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.plans = [{id: -1, text: '全部计划'}].concat(result);
        this.creates = [{id: -1, text: '全部创意'}];
        this.planId = -1;
        this.createId = -1;
        this.load();
      }, () => {this.loadings = false;});
    },
    loadcreates () {
      this.loadings = true;
      let params = {};
      params.campaignId = this.planId;
      this.$http.get('/v1/adv/names/campaigns/{campaignId}/creatives', {params: params}).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.creates = [{id: -1, text: '全部创意'}].concat(result);
        this.createId = -1;
        this.load();
      }, () => {this.loadings = false;});
    },
    load (pageNum, pageSize) {
      let params = {};
      params.startDate = this.datepickers.value[0].getTime();
      params.endDate = this.datepickers.value[1].getTime();
      params.pageSize = pageSize || this.pageSize;
      params.pageNum = pageNum || this.pageNum;
      params.campaignId = this.planId;
      params.creativeId = this.createId;
      this.loadings = true;
      this.$http.get('/v1/adv/stats/creativeOfDay/{campaignId}/{creativeId}/{pageNum}/{pageSize}', {params: params}).then((res) => {
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
        this.echartsdata();
      }, () => {this.loadings = false;});
    },
    echartsdata () {
      var params = {};
      params.startDate = this.datepickers.value[0].getTime();
      params.endDate = this.datepickers.value[1].getTime();
      params.campaignId = this.planId;
      params.creativeId = this.createId;
      this.loadings = true;
      this.$http.get('/v1/adv/stats/creativeOfDay/{campaignId}/{creativeId}', {params: params}).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.drawChart(result);
      }, () => {this.loadings = false;});
    },
    drawChart (result) {
      let myChart = echarts.init(document.getElementById('charts'));    
      let option = {
          title: {
            text: '数据区域图',
            textAlign: 'left',
            textStyle: {
              color: '#333',
              fontWeight: 'normal',
              fontFamily: '微软雅黑',
              fontSize: 14
            },
            top: 5,
            left: 5
          },
          tooltip : {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                  backgroundColor: '#6a7985'
              }
            },
            formatter: function(a){
              var returnData = "";
              returnData += a[0].name+'<br/>';
              for(var i=0;i<a.length;i++){
                var data = a[i].data;
                if(a[i].seriesName == '点击率'){
                  data = data+"%";
                }
                returnData += '<div><i style="display:inline-block;height:10px;width:10px;border-radius:50%;background:'+a[i].color+';"></i>'+' '+a[i].seriesName+' : '+data+'</div>';
              }
              return returnData;
            }
          },
          legend: {
            top: 'bottom',
            data: ['展现数', '点击数', '点击率', 'eCPM']
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap : false,
              data: result.axisX,
              axisLine: {
                lineStyle: {
                  color: '#ccc'
                }
              }
            }
          ],
          yAxis: [
            {
              type: 'value',
              splitLine: {
                show: false
              },
              axisLine: {
                lineStyle: {
                  color: '#ccc'
                }
              }
            },
            {
              type: 'value',
              splitLine: {
                show: false
              },
              axisLine: {
                lineStyle: {
                  color: '#ccc'
                }
              }
            }
          ],
          series : [{
            name:'展现数',
            type:'line',
            yAxisIndex: 0,
            smooth: true,
            lineStyle:{
              normal:{
                width:2,
                color:'#ACDD96'
              }
            },
            itemStyle : {
              normal : {
                color:'#ACDD96'
              }
            },
            areaStyle:{
              normal:{
                color:'#EEF8EA'
              }
            },
            data:result.numOfAdImpressions
          },{
            name:'点击数',
            type:'line',
            yAxisIndex: 0,
            smooth: true,
            lineStyle:{
              normal:{
                width:2,
                color:'#FF7124'
              }
            },
            itemStyle : {
              normal : {
                color:'#FF7124'
              }
            },
            areaStyle:{
              normal:{
                color:'#FFC19B'
              }
            },
            data:result.numOfAdClicks
          },{
            name:'点击率',
            type:'line',
            smooth: true,
            yAxisIndex: 1,
            lineStyle:{
              normal:{
                width:2,
                color:'#7AAFB5'
              }
            },
            itemStyle: {
              normal: {
                color: '#7AAFB5'
              }
            },
            areaStyle: {
              normal: {
                color: '#B0D0D4',
                opacity: 0.3
              }
            },
            data:result.ctr
          },{
            name:'eCPM',
            type:'line',
            smooth: true,
            yAxisIndex: 1,
            label: {
              normal: {
                show: true,
                position: 'top'
              }
            },
            lineStyle: {
              normal: {
                width: 2,
                color: '#FFD155'
              }
            },
            itemStyle: {
              normal: {
                  color: '#FFD155'
              }
            },
            areaStyle: {
              normal: {
                color: '#FFF6DD'
              }
            },
            data: result.cpm
          }]
      };
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .data-index-wrapper
    .data-title-wrapper
      margin-bottom: 15px
      .data-select-wrapper
        font-size: 0
        .inline-block
          margin-left: 10px
      @media screen and (max-width: 1280px)
        .inline-block
          width: 150px      
    .echarts-wrapper
      width: 100% 
      border: 1px solid #eee
      background: #fff 
      margin-bottom: 20px
      .chart-cnt
        width: 100%
        height: 400px  
    .data-table-wrapper
      margin-bottom: 20px     
    .data-footer-wrapper
      .el-button
        a
          color: #fff
          text-decoration: none
</style>
