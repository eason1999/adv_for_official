<template>
  <div class="ad-strategy-wrapper">
    <div class="app-top-wrapper clearfix">
      <el-button type="primary" class="pull-left" @click="addstrate">新增策略</el-button>
      <div class="app-search pull-right">
        <el-input placeholder="请输入内容" v-model="keyword" @keyup.native.enter="load()"></el-input>
        <el-button type="primary" @click="load()">搜索</el-button>
      </div>
    </div>
    <div class="apps-data-table">
      <el-table :data="tableData" stripe style="width: 100%" v-loading.fullscreen.lock="loadings" element-loading-text="拼命加载中">
        <el-table-column label="策略名称" show-overflow-tooltip> 
          <template scope="scope">
            <a href="javascript:;" @click="getdetail(scope.row.id)">
              <p>{{scope.row.name }}</p> 
              <p>ID: {{scope.row.id }}</p> 
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="bidType" label="计费类型" show-overflow-tooltip></el-table-column>
        <el-table-column prop="bidPrice" label="单价（￥）" show-overflow-tooltip></el-table-column>
        <el-table-column prop="budgetAmountDaily" label="日预算（￥）" show-overflow-tooltip></el-table-column>
        <el-table-column prop="budgetAmountTotal" label="总预算（￥）" show-overflow-tooltip></el-table-column>
        <el-table-column label="策略状态" show-overflow-tooltip>
          <template scope="scope">
            <span>{{scope.row.availabilityStatus }}</span> 
          </template>
        </el-table-column>
        <el-table-column label="修改时间" show-overflow-tooltip>
          <template scope="scope">
            <span>{{scope.row.modifiedAt | date }}</span> 
          </template>
        </el-table-column>
        <el-table-column label="操作" show-overflow-tooltip>
          <template scope="scope">
            <el-switch v-model="scope.row.verificationStatus" on-color="#13ce66" off-color="#ff4949" on-value="ALLOWED" off-value="DISALLOWED" @change="sendAvail(scope.row.id, scope.row.verificationStatus)"></el-switch>
          </template> 
        </el-table-column>
      </el-table>
    </div>
    <div class="pager-wrapper clearfix" v-if="tableData.length">
      <pager :total-records="totalRecords" @pagechange="load" :page-sizes="pageSize" :page-nums="pageNum"></pager>
    </div>
    <!-- 新增、修改策略部分 -->
    <el-dialog title="新增/修改策略" :visible.sync="dialogVisible" @open="getdate" @close="closedate">
      <el-form :model="ruleForm" :rules="rules" :label-position="labelPosition" ref="ruleForm">
        <el-form-item label="计划名称">
          <el-input v-model="planname" disabled placeholder="请输入计划名称"></el-input>
        </el-form-item>
        <el-form-item label="策略名称"  prop="strategyname">
          <el-input v-model="ruleForm.strategyname" placeholder="请输入策略名称"></el-input>
        </el-form-item>
        <el-form-item label="计费类型"  prop="bidtype">
          <el-select v-model="ruleForm.bidtype" filterable placeholder="请选择">
              <el-option
                v-for="item in bidtypes"
                :key="item.id"
                :label="item.text"
                :value="item.id">
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="单价"  prop="bidprice">
          <el-input v-model="ruleForm.bidprice" placeholder="请输入单价金额"></el-input>
        </el-form-item>
        <el-form-item label="日预算"  prop="amountdaily">
          <el-input v-model="ruleForm.amountdaily" placeholder="请输入日预算金额"></el-input>
        </el-form-item>
        <el-form-item label="总预算"  prop="amounttotal">
          <el-input v-model="ruleForm.amounttotal" placeholder="请输入总预算金额"></el-input>
        </el-form-item>
        <el-form-item label="投放周期"  prop="commitcycle">
          <div v-for="(date, index) in ruleForm.commitcycle" class="date-list">{{date}} <span class="el-icon-circle-cross deletes" @click="deletedate(index)"></span></div>
          <div class="add-cycle-wrapper">
            <el-button type="info" size="small" @click="update()">创建投放周期</el-button>
            <el-date-picker
              class="put-date-range-wrapper"
              :editable="false"
              v-model="datepickers.value"
              :type="datepickers.type"
              :align="datepickers.align"
              :picker-options="pickerOptions"
              @change="getDate"
              placeholder="选择日期范围">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item label="操作系统"  prop="os">
          <el-checkbox-group v-model="ruleForm.os" class="checkbox-wrapper">
            <el-checkbox v-for="system in systems" :label="system" :key="system">{{system}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="投放时间段" prop="startTime">
          <el-radio-group v-model="times" class="radio-wrapper">
            <el-radio class="radio" label="0">不限</el-radio>
            <el-radio class="radio" label="1">指定时间段</el-radio>
          </el-radio-group>
          <div class="time-datepicker" v-if="times==='1'"> 
            <el-time-select
              placeholder="起始时间"
              :clearable="false"
              v-model="ruleForm.startTime"
              :picker-options="{
                start: '00:00',
                step: '01:00',
                end: '23:00'
            }">
            </el-time-select> ---
            <el-time-select
              placeholder="结束时间"
              :clearable="false"
              v-model="endTime"
              :picker-options="{
                start: '01:00',
                step: '01:00',
                end: '24:00',
                minTime: ruleForm.startTime
            }">
            </el-time-select>
          </div>
        </el-form-item>
        <el-form-item label="投放地域" prop="cityValues">
          <el-radio-group v-model="regions" class="radio-wrapper">
            <el-radio class="radio" label="0">不限</el-radio>
            <el-radio class="radio" label="1">指定地域</el-radio>
          </el-radio-group>
          <div v-if="regions==='1'"> 
            <el-transfer
              v-loading.body="cities.length===0"
              filterable
              :titles="['省市列表','已选省市']"
              filter-placeholder="请输入搜索项"
              v-model="ruleForm.cityValues"
              :data="cities">
          </el-transfer>
          </div>
        </el-form-item>
        <el-form-item label="投放网络"  prop="network">
          <el-checkbox-group v-model="ruleForm.network" class="checkbox-wrapper">
            <el-checkbox v-for="network in networks" :label="network" :key="network">{{network}}</el-checkbox>
          </el-checkbox-group>
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
      <stratedetail
        v-if="resourceshow" 
        :planname="planname"
        :id="id"
        :strategydetail="strategydetail"
        @update:show="val => resourceshow = val"
        @update:visible="val => dialogVisible = val"
        @refreshbizlines="dorefresh"
      ></stratedetail>
    </transition>
  </div>
</template>

<script type="ecmascript-6">
import pager from '../../../components/pager/pager.vue';
import stratedetail from './config/stratedetail.vue';
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
  	var checks = (rule, value, callback) => {
      let req = /^(\d*\.)?\d+$/;
      if (!value) {
        return callback(new Error('金额不能为空'));
      }
      setTimeout(() => {
        if (!req.test(value)) {
          callback(new Error('请输入非负数'));
        } else {
          callback();
        }
      }, 1000);
    };
    var checkcycle = (rule, value, callback) => {
      if (!value.length) {
        return callback(new Error('投放周期不能为空'));
      } else {
        callback();
      }
    };
    var checknetwork = (rule, value, callback) => {
      if (!value.length) {
        return callback(new Error('投放网络不能为空'));
      } else {
        callback();
      }
    };
    var checkos = (rule, value, callback) => {
      if (!value.length) {
        return callback(new Error('操作系统不能为空'));
      } else {
        callback();
      }
    };
    var checkcities = (rule, value, callback) => {
      if (this.regions==='1'&&!value.length) {
        return callback(new Error('地域不能为空'));
      } else {
        callback();
      }
    };
    var checktimes = (rule, value, callback) => {
      let starts = value.substring(0, 2), ends = this.endTime.substring(0, 2);
      if (this.times==='1'&&Number(starts) >= Number(ends)) {
        return callback(new Error('起始时间不能大于等于结束时间'));
      } else {
        callback();
      }
    };
    return {
      id: this.campaignid,
      tableData: [],
      networks: ['WIFI', '2G', '3G', '4G'],
      systems: ['Android', 'iOS'],
      keyword: '',
      totalRecords: -1,
      pageNum: 1,
      pageSize: 20,
      loadings: false, 
      times: '0',
      regions: '0',
      bidtypes: [{id: 'CPC', text: 'CPC'}, {id: 'CPM', text: 'CPM'}],
      endTime: '01: 00',
      cities: [],
      datelist: [],
      realdate: [],
      planname: this.planname,
      ruleForm: {
        strategyname: '',
        bidtype: '',
        os: ['Android', 'iOS'],
        bidprice: '',
        amountdaily: '',
        amounttotal: '',
        commitcycle: [],
        network: ['WIFI', '2G', '3G', '4G'],
        cityValues: [],
        startTime: '00: 00'
      },
      rules: {
      	strategyname: [
          { required: true, message: '请输入计划名称', trigger: 'blur' },
          { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
        ],
        bidtype: [
          { required: true, message: '请输入计划名称', trigger: 'change' }
        ],
        bidprice: [
          { required: true, validator: checks, trigger: 'blur' }
        ],
        amountdaily: [
          { required: true, validator: checks, trigger: 'blur' }
        ],
        amounttotal: [
          { required: true, validator: checks, trigger: 'blur' }
        ],
        commitcycle: [
          { required: true, validator: checkcycle }
        ],
        network: [
          { required: true, validator: checknetwork }
        ],
        os: [
          { required: true, validator: checkos }
        ],
        cityValues: [
          { required: true, validator: checkcities }
        ],
        startTime: [
          { required: true, validator: checktimes, trigger: 'change' }
        ]
      },
      labelPosition: 'top',
      datepickers: {value: [], align: 'left', type: 'daterange'},
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < (new Date().getTime()-1*24*3600*1000);
        },
        onPick (data) {
          // console.log(data);
        }
      },
      resourceshow: false,
      dialogVisible: false,
      signs: false,
      strateid: -1,
      // 策略详细
      strategyid: -1,
      strategydetail: {}
    };
  },
  computed: {
    
  },
  mounted () {
    this.$nextTick(() => {
      this.load();
      this.getcities();
    });
  },
  components: { pager, stratedetail },
  methods: {
  	dorefresh (val) {
      console.log(val);
      this.load();
    },
    load (pageNum, pageSize) {
      let params = {};
      params.keyword = this.keyword;
      params.pageSize = pageSize || this.pageSize;
      params.pageNum = pageNum || this.pageNum;
      params.campaignId = this.id;
      this.loadings = true;
      this.$http.get('/v1/adv/campaigns/{pageNum}/{pageSize}/{campaignId}/strategies', {params: params}).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;   
        this.pageSize = result.pageSize;
        this.totalRecords = result.totalRecords;
        this.tableData = result.list;
      }, () => {
        this.loadings = false;
      });
    },
    sendAvail (id, verificationStatus) {
      let params = {};
      if (verificationStatus === 'ALLOWED') {
        params.verificationStatus = 'DISALLOWED';
      } else {
        params.verificationStatus = 'ALLOWED';
      }
      params.strategyId = id;
      this.loadings = true;
      this.$http.put('/v1/adv/strategy/'+id+'/verificationStatus/'+verificationStatus).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
      }, () => {this.loadings = false;});
    },
    creates (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.signs) {
            this.upstrate(formName);
          } else {
            this.changestrate(formName);
          }
        } else {
          return this.$alert('请正确输入相应选项！！！', '提示：', {
            confirmButtonText: '确定'
          });
        }
      });
    },
    // 修改策略
    changestrate (formName) {
      let params = {};
      params.name = this.ruleForm.strategyname;
      params.bidType = this.ruleForm.bidtype;
      params.bidPrice = this.ruleForm.bidprice;
      params.budgetAmountDaily = this.ruleForm.amountdaily;
      params.budgetAmountTotal = this.ruleForm.amounttotal;
      let dateArr = this.realdate.join('$');
      params.deliveryCycle = dateArr;
      this.loadings = true;
      this.$http.put('/v1/adv/'+this.strategyid+'/strategy', params).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        this.changeorient(formName);
      }, () => {
        this.loadings = false;
      });
    },
    // 修改定向
    changeorient (formName) {
      let params = {};
      params.os = this.ruleForm.os.join(",");
      if(this.regions === '0'){
        params.region = "-1";		
      } else {
        params.region = this.ruleForm.cityValues.join(',');
      }
      params.network = this.ruleForm.network.length === 4 ? "-1" : this.ruleForm.network.join(",");
      if(this.times === '0'){
        params.hour = -1;
      } else {
        let hours = [] , hoursStr;
        let a = parseInt(this.ruleForm.startTime.substring(0, 2)), b = parseInt(this.endTime.substring(0, 2));
        for(let i = a; i <= b; i++){
          hours.push(i);
        }
        hoursStr = hours.join(",");
        params.hour = hoursStr;
      }
      this.loadings = true;
      this.$http.post('/v1/adv/strategy/'+this.strategyid+'/targets', params).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        this.cancels(formName);
        this.load();
        this.getdetail(this.strateid);
      }, () => {
        this.loadings = false;
      });
    },
    // 新增策略
    upstrate (formName) {
      let params = {};
      params.campaignId = this.id;
      params.name = this.ruleForm.strategyname;
      params.bidType = this.ruleForm.bidtype;
      params.bidPrice = this.ruleForm.bidprice;
      params.budgetAmountDaily = this.ruleForm.amountdaily;
      params.budgetAmountTotal = this.ruleForm.amounttotal;
      let dateArr = this.realdate.join('$');
      params.deliveryCycle = dateArr;
      this.loadings = true;
      this.$http.post('/v1/adv/strategy', params).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.uporient(result, formName);
      }, () => {
        this.loadings = false;
      });
    },
    // 新建定向
    uporient (data, formName) {
      let params = {};
      params.os = this.ruleForm.os.join(",");
      if(this.regions === '0'){
        params.region = "-1";		
      } else {
        params.region = this.ruleForm.cityValues.join(',');
      }
      params.network = this.ruleForm.network.length === 4 ? "-1" : this.ruleForm.network.join(",");
      if(this.times === '0'){
        params.hour = -1;
      } else {
        let hours = [] , hoursStr;
        let a = parseInt(this.ruleForm.startTime.substring(0, 2)), b = parseInt(this.endTime.substring(0, 2));
        for(let i = a; i <= b; i++){
          hours.push(i);
        }
        hoursStr = hours.join(",");
        params.hour = hoursStr;
      }
      this.loadings = true;
      this.$http.post('/v1/adv/strategy/'+data+'/targets', params).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        this.cancels(formName);
        this.load();
      }, () => {
        this.loadings = false;
      });
    },
    cancels (formName) {
      console.log('修改---重置');
      this.$refs[formName].resetFields();
      this.dialogVisible = false;
      this.signs = false;
      this.datelist = [];
      this.realdate = [];
      this.times = '0';
      this.regions = '0';
      this.datepickers.value = [];
    },
    getcities () {
      this.loadings = true;
      this.$http.get('/v1/dict/regions/allCities').then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result, cities = [];
        for (let i = 0, a = result.length; i< a; i++) {
          let item = {};
          item.label = result[i].text;
          item.key = result[i].id;
          cities.push(item);
        }
        for (let i = 0, a = result.length; i< a; i++) {
          if (result[i].items.length > 1) {
            for (let j = 0, b = result[i].items.length; j < b; j++) {
              let item = {};
              item.label = result[i].items[j].text;
              item.key = result[i].items[j].id;
              cities.push(item);
            }
          }
        }
        this.cities = cities;
      }, () => {this.loadings = false;});
    },
    getDate (data) {
      if (data === undefined || data === '') {
      	return false;
      }
      let item = {};
      let dates = data.split(' - ');
      let firstdate = new Date(dates[0]).getTime();
      let lastdate = new Date(dates[1]).getTime();
      if (!this.datelist.length) {
        item.startDate = firstdate;
        item.endDate = lastdate;
        this.datelist.push(item);
        this.ruleForm.commitcycle.push(data);
        this.realdate.push(firstdate + ',' + lastdate);
      } else {
        for(let i = 0, m = this.datelist.length; i < m; i++){
          if(!(firstdate > this.datelist[i].endDate || lastdate < this.datelist[i].startDate)){
            return this.$alert('与已选时间段有重复，请重新选择！', '提示：', {
              confirmButtonText: '确定'
            });
          }	
        }
        item.startDate = firstdate; 
        item.endDate = lastdate;
        this.datelist.push(item);
        this.ruleForm.commitcycle.push(data);
        this.realdate.push(firstdate + ',' + lastdate);
      }
    },
    deletedate (index) {
      this.datelist.splice(index, 1);
      this.realdate.splice(index, 1);
      this.ruleForm.commitcycle.splice(index, 1);
    },
    getdetail (id) {
      this.loadings = true;
      this.$http.get('/v1/adv/strategys/'+id).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          return this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;
        this.strategydetail = result;
        this.strateid = id;
        this.shows();
      }, () => {this.loadings = false;});
    },
    addstrate () {
      this.dialogVisible = true; 
      // 标记修改或新增
      this.signs = true;
    },
    // 获得修改数据
    getdate () { 
      if (this.signs) {
        return;
      }
      let strategys = this.strategydetail.strategy;
      let targets = this.strategydetail.target;
      //修改策略名称\类型\预算等
      this.ruleForm.strategyname = strategys.name;
      this.ruleForm.bidtype = strategys.bidType;
      this.ruleForm.bidprice = strategys.bidPrice;
      this.ruleForm.amountdaily = strategys.budgetAmountDaily;
      this.ruleForm.amounttotal = strategys.budgetAmountTotal;
      this.strategyid = strategys.id;
      // 修改日期相关
      let newArr = [], cenArr = [], item;
      let arr0 = strategys.deliveryCycle;
      this.realdate = strategys.deliveryCycle.split('$');
      // 填回已选时间段用于筛选选择时间段是否与已有时间段重复
      let cerItem = {},otherArr = [];
      for (let I = 0; I < this.realdate.length; I++) {
        otherArr.push(this.realdate[I].split(','));
      }
      for (let J = 0; J < otherArr.length; J++) {
        this.datelist.push({startDate:otherArr[J][0], endDate:otherArr[J][1]});
      }
      //  时间段处理
      if (arr0.indexOf('$') > -1) {
        let arrs = arr0.split('$');
        for (let i = 0; i < arrs.length; i++) {
          cenArr.push(arrs[i].split(','));
        }
        for (let j = 0; j < cenArr.length; j++) {
          item = moment(Number(cenArr[j][0])).format("YYYY-MM-DD")+" / "+moment(Number(cenArr[j][1])).format("YYYY-MM-DD");
          newArr.push(item);
        }
      } else {
        let arrs1 = arr0.split(',');
        item = moment(Number(arrs1[0])).format("YYYY-MM-DD")+" / "+moment(Number(arrs1[1])).format("YYYY-MM-DD");
        newArr.push(item);
      }
      this.ruleForm.commitcycle = newArr;
      // 修改时获取网络相关
      if (targets.NETWORK_TYPE.indexOf(',') > -1) {
        this.ruleForm.network = targets.NETWORK_TYPE.split(',');
      } else if (targets.NETWORK_TYPE=='-1') {
        this.ruleForm.network = ["WIFI","2G","3G","4G"];
      }else {
        let arr1 = [];
        arr1.push(targets.NETWORK_TYPE);
        this.ruleForm.network = arr1;
      }
      // 处理获取时间相关
      if (targets.DAY_PART === '-1') {
        this.times = '0';
      }else{
        this.times = '1';
        let hours=targets.DAY_PART.split(',');
        this.ruleForm.startTime = hours[0] + ':00';
        this.endTime = hours[hours.length-1] + ':00';
      }
      // 修改操作系统相关
      if (targets.OS.indexOf(',') > -1) {
        this.ruleForm.os = targets.OS.split(',');
      } else {
        let arr2 = [];
        arr2.push(targets.OS);
        this.ruleForm.os = arr2;
      }
      //  处理地域问题
      let region = targets.LOCATIONIDS;
      if (region != "-1") {
        this.regions = '1';
        /*处理返回城市id*/
        this.ruleForm.cityValues = region.split(",");
      }else{
        this.regions = '0';
      }  
    },
    closedate () {
      // 标记修改或新增
      this.signs = false;
      this.times = '0';
      this.regions = '0';
      this.endTime = '01: 00';
      this.ruleForm = {
        strategyname: '',
        bidtype: '',
        os: ['Android', 'iOS'],
        bidprice: '',
        amountdaily: '',
        amounttotal: '',
        commitcycle: [],
        network: ['WIFI', '2G', '3G', '4G'],
        cityValues: [],
        startTime: '00: 00'
      };
    },
    shows () {
      this.resourceshow = true;
    },
    closes () {
      this.resourceshow = false;
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .ad-strategy-wrapper
    overflow: hidden
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
    .el-form-item
      .add-cycle-wrapper
        position: relative
        .put-date-range-wrapper
          position: absolute
          left: 0
          top: 5px
          opacity: 0 
          width: 92px
          height: 28px
      .date-list
        padding-left: 10px	
        .deletes 
          color: #FF4949
          font-size: 14px
          cursor: pointer
          margin-left: 20px  
      .el-select
        display: block
      .checkbox-wrapper
        margin: 5px 0
        display: block
        .el-checkbox
          color: #565656
          width: 10%
          margin-right: 30px
          &:last-child
            margin-right: 0
      .radio-wrapper
        margin: 5px 0
        display: block
        .radio
          color: #565656
          width: 10%
          &:first-child
            margin-right: 30px
      .dialog-footer
        float: right
      &:last-child
        margin-bottom: 0
      .time-datepicker
        .el-date-editor
          width: 105px
    // 侧向划出   
    .slide-fade-enter-active 
      transition: all .8s ease
    .slide-fade-leave-active 
      transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0)
    .slide-fade-enter, .slide-fade-leave-to
      transform: translateX(200px)
      opacity: 0     
</style>
