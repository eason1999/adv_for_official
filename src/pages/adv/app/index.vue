<template>
  <div class="app-index-wrapper">
    <h2>应用管理</h2>
    <div class="app-top-wrapper clearfix">
      <el-button type="primary" class="pull-left"><router-link class="search" to="index/addapp">新增应用</router-link></el-button>
      <div class="app-search pull-right">
        <el-input placeholder="请输入内容" v-model="keyword" @keyup.native.enter="load()"></el-input>
        <el-button type="primary" @click="load()">搜索</el-button>
      </div>
    </div>
    <div class="apps-data-table">
      <el-table :data="tableData" stripe style="width: 100%" v-loading.fullscreen.lock="loadings" element-loading-text="拼命加载中">
        <el-table-column type="expand">
          <template scope="scope">
            <el-form label-position="left" inline class="demo-table-expand sub-app-form">
              <el-form-item label="投放状态：">
                <span>{{ scope.row.availabilityStatus | avastatus }}</span>
              </el-form-item>
              <el-form-item label="审核状态：">
                <span>{{ scope.row.verificationStatus | verstatus }}</span>
              </el-form-item>
              <el-form-item label="操作：">
                <template>
                  <el-button type="info" size="small" @click="updates(scope.row.id)">修改</el-button>
                  <el-button type="info" size="small" @click="putin(scope.$index, scope.row.id, 'ALLOWED')">投放</el-button>
                  <el-button type="info" size="small" @click="stopput(scope.$index, scope.row.id, 'DISALLOWED')">停止投放</el-button>
                  <el-button type="info" size="small" @click="addslots(scope.row.id)">新增广告位</el-button>
                  <el-button type="info" size="small" @click="openslots(scope.row.id)">开通内容广告位</el-button>
                  <el-button type="danger" size="small" @click="deletes(scope.row.id, scope.row.name)">删除</el-button>
                </template>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" show-overflow-tooltip sortable>
          <template scope="scope">
            <span>{{scope.row.createdAt | date }}</span> 
          </template>
        </el-table-column>
        <el-table-column label="应用名称/ID" show-overflow-tooltip>
          <template scope="scope">
            <a href="javascript:;" @click="getdetail(scope.row.id)">
              <div>{{scope.row.name }}</div> 
              <div>ID: {{scope.row.busId }}</div>
            </a>
          </template> 
        </el-table-column>
        <el-table-column label="应用包名" show-overflow-tooltip> 
          <template scope="scope">
            <a href="javascript:;" @click="getdetail(scope.row.id)">
              <div>{{scope.row.packageName }}</div> 
            </a>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" show-overflow-tooltip> 
          <template scope="scope">
            <span>{{ scope.row.verificationStatus | verstatus }}</span>
          </template>
        </el-table-column>
        <el-table-column label="投放状态" show-overflow-tooltip> 
          <template scope="scope">
            <span>{{ scope.row.availabilityStatus | avastatus }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pager-wrapper clearfix">
      <pager :total-records="totalRecords" @pagechange="load" :page-sizes="pageSize" :page-nums="pageNum"></pager>
    </div>
    <el-dialog title="ADroi映射" :visible.sync="dialogVisible">
      <el-table :data="gridData">
        <el-table-column property="name" label="广告位名称" show-overflow-tooltip></el-table-column>
        <el-table-column property="busId" label="广告位ID" show-overflow-tooltip></el-table-column>
        <el-table-column label="广告类型" show-overflow-tooltip>
          <template scope="scope">
            <p>{{ scope.row.type | type }}</p>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script type="ecmascript-6">
import pager from '../../../components/pager/pager.vue';
export default {
  data () {
    return {
      tableData: [],
      keyword: '',
      totalRecords: -1,
      pageNum: 1,
      pageSize: 20,
      value2: true,
      loadings: false,
      dialogVisible: false,
      gridData: []
    };
  },
  filters: {
    verstatus (value) {
      let item;
      switch (value) {
        case 'CREATING':
          item = '创建中';
          break;
        case 'PENGDING':
          item = '等待审核';
          break;
        case 'APPROVED':
          item = '审核通过';
          break; 
        default:
          item = '审核拒绝';
          break;  
      }
      return item;
    },
    avastatus (value) {
      let item;
      switch (value) {
        case 'DISALLOWED':
          item = '停止投放';
          break;
        case 'VM_ALLOWED':
          item = '虚拟投放';
          break;
        case 'ALLOWED':
          item = '投放中';
          break; 
        default:
          item = '待投放';
          break;  
      }
      return item;
    },
    type (value) {
      let item;
      switch (value) {
        case 'BANNER':
          item = '横幅广告';
          break;
        case 'SPLASH':
          item = '开屏广告';
          break;
        case 'NATIVE':
          item = '原生广告';
          break;
        case 'INTERSTITIAL':
          item = '插屏广告';
          break;  
        default:
          item = '内容广告'; 
          break;     
      }
      return item;
    }
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
      this.$http.get('/v1/dev/apps/{pageNum}/{pageSize}', {params: params}).then((res) => {
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
    getdetail (id) {
      this.loadings = true;
      let params = {};
      params.appId = id;
      this.$http.get('/v1/dev/apps/{appId}/adslots', {params: params}).then((res) => {
      	this.loadings = false;
      	let data = res.body;
        if (data.ret!=1) {
          this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        let result = data.result; 
        this.gridData = result; 
        this.dialogVisible = true; 
      }, () => {this.loadings = false});
    },
    updates (id) {
      this.$router.push({
      	path: 'index/update',
        query: {
          id: id
        }
      });
    },
    putin (index, appId, state) {
      return this.$confirm('确定开始投放吗？？？').then(() => {
        this.handlePut(index, appId, state);
      }).catch(() => {});
    },
    stopput (index, appId, state) {
      return this.$confirm('确定停止投放吗？？？').then(() => {
        this.handlePut(index, appId, state);
      }).catch(() => {});
    },
    handlePut (index, appId, state) {
      this.loadings = true;
      this.$http.put('/v1/dev/apps/'+appId+'/availabilities/'+state).then((res) => {
        this.loadings = false;
        let data = res.data;
        if (data.ret != 1) {
          this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
        this.tableData[index].availabilityStatus = state;
	  }, () => {this.loadings = false}); 
    },
    addslots (id) {
      this.$router.push({
      	path: 'index/addslot',
        query: {
          id: id
        }
      });
    },
    openslots (id) {
      return this.$confirm('确定开通吗？？？').then(() => {
        this.handleOpen(id);
      }).catch(() => {});
    },
    handleOpen (id) {
      this.loadings = true;
      this.$http.post('/v1/dev/apps/'+id+'/contentslots/add').then((res) => {
      	this.loadings = false;
      	let data = res.data;
      	if (data.ret != 1) {
          this.$alert(data.message, '提示：', {
            confirmButtonText: '确定'
          });
        }
      }, () => {this.loadings = false});
    },
    deletes (id, name) {
      return this.$confirm('确定删除吗？？？').then(() => {
        this.handleDelete(id, name);
      }).catch(() => {});
    },
    handleDelete (id, name) {
      this.loadings = true;
      this.$http.delete('/v1/apps/'+id).then((res) => {
      	this.loadings = false;
      	let data = res.data;
      	if (data.ret != 1) {
          return this.$alert('应用 ['+name+'] 删除失败：'+data.message, '提示：', {
            confirmButtonText: '确定'
          });
        } else {
          return this.$alert('应用 ['+name+'] 删除成功！！!', '提示：', {
            confirmButtonText: '确定',
            callback: () => {
              this.load();
            }
          });	
        }
      }, () => {this.loadings = false});	
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .app-index-wrapper
    overflow: hidden
    .app-top-wrapper
      margin-bottom: 15px
      .search 
        color: #fff
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
      .sub-app-form
        padding: 10px
        border-bottom: 1px dashed #bbb
        label
          width: 75px
          overflow: hidden
          white-space: nowrap
          text-overflow: ellipsis
          color: #99a9bf
        .el-form-item
          margin-right: 0
          margin-bottom: 0
          width: 48%  
      .sub-app-form:last-child
        border: none        
    .pager-wrapper
      margin-top: 15px 
    // .el-tooltip
      // color: #7e8c8d   
      // cursor: pointer    
</style>
