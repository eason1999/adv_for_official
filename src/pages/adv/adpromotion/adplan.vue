<template>
  <div class="ad-plan-wrapper">
    <h2>广告计划</h2>
    <div class="app-top-wrapper clearfix">
      <el-button type="primary" class="pull-left" @click="dialogVisible = true">新增计划</el-button>
      <div class="app-search pull-right">
        <el-input placeholder="请输入内容" v-model="keyword" @keyup.native.enter="load()"></el-input>
        <el-button type="primary" @click="load()">搜索</el-button>
      </div>
    </div>
    <div class="apps-data-table">
      <el-table :data="tableData" stripe style="width: 100%" v-loading.fullscreen.lock="loadings" element-loading-text="拼命加载中">
        <el-table-column label="计划名称/ID" show-overflow-tooltip> 
          <template scope="scope">
            <a href="javascript:;" @click="godetail(scope.row.id, scope.row.name)">
              <p>{{scope.row.name}}</p>
              <p>ID: {{scope.row.id}}</p> 
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="budgetAmountTotal" label="计划预算（￥）" show-overflow-tooltip></el-table-column>
        <el-table-column label="投放时间" show-overflow-tooltip>
          <template scope="scope">
            <span>{{scope.row.dateStart | date }} ~ {{scope.row.dateEnd | date }}</span> 
          </template>
        </el-table-column>
        <el-table-column label="修改时间" show-overflow-tooltip>
          <template scope="scope">
            <span>{{scope.row.createdAt | date }}</span> 
          </template>
        </el-table-column>
        <el-table-column label="计划状态" show-overflow-tooltip>
          <template scope="scope">
            <span>{{scope.row.availabilityStatus }}</span> 
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" show-overflow-tooltip>
          <template scope="scope">
            <el-button type="info" size="small" @click="updates(scope.row.id, scope.row.name, scope.row.budgetAmountTotal)">修改</el-button>
            <el-button type="info" size="small" @click="startuse(scope.row.id, 'ALLOWED')">启用</el-button>
            <el-button type="info" size="small" @click="stopuse(scope.row.id, 'DISALLOWED')">停用</el-button>
            <el-button type="danger" size="small" @click="deletes(scope.row.id)">删除</el-button>
          </template> 
        </el-table-column>
      </el-table>
    </div>
    <div class="pager-wrapper clearfix" v-if="tableData.length">
      <pager :total-records="totalRecords" @pagechange="load" :page-sizes="pageSize" :page-nums="pageNum"></pager>
    </div>
    <el-dialog title="新增/修改计划" :visible.sync="dialogVisible">
      <el-form :model="ruleForm" :rules="rules" :label-position="labelPosition" ref="ruleForm">
        <el-form-item label="计划名称"  prop="planname">
          <el-input v-model="ruleForm.planname" placeholder="请输入计划名称"></el-input>
        </el-form-item>
        <el-form-item label="计划预算"  prop="budget">
          <el-input v-model="ruleForm.budget" placeholder="请输入预算金额"></el-input>
        </el-form-item>
        <el-form-item>
          <div class="dialog-footer">
            <el-button type="default" @click="cancels('ruleForm')">取 消</el-button>
            <el-button type="primary" @click="creates('ruleForm')">确 定</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script type="ecmascript-6">
import pager from '../../../components/pager/pager.vue';
export default {
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
    return {
      planId: '',
      tableData: [],
      keyword: '',
      totalRecords: -1,
      pageNum: 1,
      pageSize: 20,
      loadings: false,
      dialogVisible: false,
      ruleForm: {
      	planname: '',
        budget: ''
      },
      rules: {
        planname: [
          { required: true, message: '请输入计划名称', trigger: 'blur' },
          { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
        ],
        budget: [
          { required: true, validator: checks, trigger: 'blur' }
        ]
      },
      labelPosition: 'top' 
    };
  },
  mounted () {
    this.$nextTick(() => {
      this.load();
    });
  },
  components: { pager },
  methods: {
    load (pageNum, pageSize) {
      let params = {};
      params.keyword = this.keyword;
      params.pageSize = pageSize || this.pageSize;
      params.pageNum = pageNum || this.pageNum;
      this.loadings = true;
      this.$http.get('/v1/adv/campaigns/{pageNum}/{pageSize}', {params: params}).then((res) => {
        this.loadings = false;
        let data = res.body;
        if (data.ret!=1) {
          this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result;  
        this.pageNum = result.pageNum;     
        this.pageSize = result.pageSize;
        this.totalRecords = result.total;
        this.tableData = result.list;
      }, () => {
        this.loadings = false;
      });
    },
    updates (id, name, budget) {
      this.planId = id;
      this.ruleForm.planname = name;
      this.ruleForm.budget = budget;
      this.dialogVisible = true;
    },
    startuse (id, state) {
      return this.$confirm('确定启用吗？？？').then(() => {
        this.controlUse(id, state);
      }).catch(() => {});
    },
    stopuse (id, state) {
      return this.$confirm('确定停用吗？？？').then(() => {
        this.controlUse(id, state);
      }).catch(() => {});
    },
    controlUse (id, state) {
      this.loadings = true;
      this.$http.post('/v1/adv/campaigns/'+id+'/availabilities/'+state).then((res) => {
      	this.loadings = false;
      	let data = res.data;
      	if (data.ret != 1) {
          this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        this.load();
      }, () => {this.loadings = false});
    },
    deletes (id) {
      return this.$confirm('确定删除吗？？？').then(() => {
        this.handleDelete(id);
      }).catch(() => {});
    },
    handleDelete (id) {
      this.loadings = true;
      this.$http.delete('/v1/adv/campaigns/'+id).then((res) => {
        this.loadings = false;
        let data = res.data;
        if (data.ret != 1) {
          return this.$alert('删除失败：'+data.message, '提示：', {
            confirmButtonText: '确定'
          });
        } else {
          return this.$alert('删除成功！！!', '提示：', {
            confirmButtonText: '确定',
            callback: () => {
              this.load();
            }
          });
        }
      }, () => {this.loadings = false});
    },
    creates (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.planId != '') {
            this.update(formName);
          } else {
            this.submit(formName);
          }
        } else {
          return this.$alert('请正确输入相应选项！！！', '提示：', {
            confirmButtonText: '确定'
          });
        }
      });
    },
    update (formName) {
      this.loadings = true;
      let params = {};
      params.name = this.ruleForm.planname;
      params.budgetAmountTotal = this.ruleForm.budget;
      this.$http.put('/v1/adv/campaigns/'+this.planId, params).then((res) => {
        this.loadings = false;
        let data = res.data;
        if (data.ret != 1) {
          return this.$alert('修改失败：'+data.message, '提示：', {
            confirmButtonText: '确定'
          });
        } 
        this.load();
        this.cancels(formName);
      }, () => {this.loadings = false});
    },
    submit (formName) {
      this.loadings = true;
      let params = {};
      params.name = this.ruleForm.planname;
      params.budgetAmountTotal = this.ruleForm.budget;
      this.$http.post('/v1/adv/campaigns', params).then((res) => {
        this.loadings = false;
        let data = res.data;
        if (data.ret != 1) {
          return this.$alert('删除失败：'+data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        this.load();
        this.cancels(formName);
      }, () => {this.loadings = false});
    },
    cancels (formName) {
      this.planId = '';
      this.$refs[formName].resetFields();
      this.dialogVisible = false;
    },
    godetail (id, name) {
      this.$router.push({
      	path: 'plan/detail',
      	query: {
      	  id: id,
      	  name: name
      	}
      });
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .ad-plan-wrapper
    overflow: hidden
    .app-top-wrapper
      margin-bottom: 15px
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
      font-size: 0
      .el-select
        width: 90px
        .el-input__inner
          height: 28px       
    .pager-wrapper
      margin-top: 15px    
    .el-form-item
      .dialog-footer
        float: right
      &:last-child
        margin-bottom: 0
</style>
