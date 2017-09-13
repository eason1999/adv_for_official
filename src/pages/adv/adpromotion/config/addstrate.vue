<template>
  <div class="add-strategy-wrapper">
    <!-- 新增、修改策略部分 -->
    <el-dialog title="新增/修改策略" :visible.sync="dialogVisible" v-loading.fullscreen.lock="loadings" element-loading-text="拼命加载中">
      <el-form :model="ruleForm" :rules="rules" :label-position="labelPosition" ref="ruleForm">
        <el-form-item label="计划名称"  prop="planname">
          <el-input v-model="ruleForm.planname" placeholder="请输入计划名称"></el-input>
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
          <el-input v-model="ruleForm.commitcycle" placeholder="请输入预算金额"></el-input>
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
                minTime: startTime
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
            <el-button @click="cancels">取 消</el-button>
            <el-button type="primary" @click="creates('ruleForm')">确 定</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script type="ecmascript-6">
export default {
  props: {
    showdialog: {
      type: Boolean,
      default: false
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
      }
    };
    var checknetwork = (rule, value, callback) => {
      if (!value.length) {
        return callback(new Error('投放网络不能为空'));
      }
    };
    var checkos = (rule, value, callback) => {
      if (!value.length) {
        return callback(new Error('操作系统不能为空'));
      }
    };
    var checkcities = (rule, value, callback) => {
      if (this.regions==='1'&&!value.length) {
        return callback(new Error('地域不能为空'));
      }
    };
    var checktimes = (rule, value, callback) => {
      if (this.times==='1'&&value >= this.endTime) {
        return callback(new Error('起始时间不能大于等于结束时间'));
      }
    };
    return {
      networks: ['WIFI', '2G', '3G', '4G'],
      systems: ['Android', 'iOS'],
      loadings: false,
      dialogVisible: this.showdialog,
      times: '0',
      regions: '0',
      bidtypes: [{id: 'CPC', text: 'CPC'}, {id: 'CPM', text: 'CPM'}],
      endTime: '01: 00',
      cities: [],
      ruleForm: {
      	planname: '',
      	strategyname: '',
      	bidtype: '',
      	os: ['Android', 'iOS'],
      	bidprice: '',
      	amountdaily: '',
      	amounttotal: '',
      	commitcycle: [],
      	network: ['WIFI', '2G', '3G', '4G'],
        cityValues: [],
        startTime: '00: 00',
        budget: ''
      },
      rules: {
      	strategyname: [
          { required: true, message: '请输入计划名称', trigger: 'blur' },
          { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
        ],
        planname: [
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
        budget: [
          { required: true, validator: checks, trigger: 'blur' }
        ],
        cityValues: [
          { required: true, validator: checkcities }
        ],
        startTime: [
          { required: true, validator: checktimes, trigger: 'change' }
        ]
      },
      labelPosition: 'top'
    };
  },
  mounted () {
    this.$nextTick(() => {
      this.getcities();
    });
  },
  components: { },
  methods: {
    creates (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$refs[formName].resetFields();
        } else {
          return this.$alert('请正确输入相应选项！！！', '提示：', {
            confirmButtonText: '确定'
          });
        }
      });
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
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .add-strategy-wrapper
    overflow: hidden     
    .el-form-item
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
</style>
