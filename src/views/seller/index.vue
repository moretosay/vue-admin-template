<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="商家名称关键字检索" style="width: 220px; height: 50px" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate" >
        新增商家
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出商家
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="商家ID" align="center" width="80px" >
        <template slot-scope="{row}">
          <span>{{ row.sellerId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商家名称" width="130px" align="center" >
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Logo" prop="logoPicUrl" width="130px" align="center" >
        <!--scope相当于一行的数据， scope.row相当于当前行的数据对象-->
        <template slot-scope="scope">
          <el-avatar shape="square" :size="60" :src="scope.row.logoPicUrl" v-if="scope.row.logoPicUrl != null" ></el-avatar>
          <span v-if="scope.row.logoPicUrl == null" > 待上传</span>
        </template>
      </el-table-column>
      <el-table-column label="商家简介" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.summary }}</span>
        </template>
      </el-table-column>
      <el-table-column label="营业开始时间" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.businessStartTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="营业结束时间" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.businessEndTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最小起送费" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.minAmount }}</span> 元
        </template>
      </el-table-column>
      <el-table-column label="配送费" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.expressFee }}</span> 元
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="105px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="235px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
          <el-button v-if="row.status!='published'" size="mini" type="success" @click="handleModifyStatus(row,'published')">
            发布
          </el-button>
          <el-button v-if="row.status!='draft'" size="mini" @click="handleModifyStatus(row,'draft')">
            下线
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- v-show：数据>0显示 page：第几页，对应后端pageNum，limit：每页记录数，对应后端pageSize -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- :visible.sync，vue标签，设置动态的显示内容与否 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">

        <el-form-item label="商家名称" prop="name" label-width="120px" >
          <el-input v-model="temp.name" placeholder="请输入商家名称" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="商家简介" prop = "summary" label-width="120px">
          <el-input v-model="temp.summary" class="summary" placeholder="请输入商家简介" style="width: 200px;"/>
        </el-form-item>

        <el-form-item label="营业开始时间" prop="businessStartTime" label-width="120px">
          <el-col :span="11">
            <el-input v-model="temp.businessStartTime" placeholder="如 09:00" style="width: 200px;" />
          </el-col>
        </el-form-item>

        <el-form-item label="营业结束时间" prop="businessEndTime" label-width="120px">
          <el-col :span="11">
            <el-input v-model="temp.businessEndTime" placeholder="如 22:00" style="width: 200px;" />
          </el-col>
        </el-form-item>

        <el-form-item label="最小起送费" prop="minAmount" label-width="120px">
          <el-input v-model="temp.minAmount" class="minAmount" placeholder="请输入最小起送费" style="width: 200px;"/> 元
        </el-form-item>
        <el-form-item label="# 配送费" prop="expressFee" label-width="120px" align="left">
          <el-input v-model="temp.expressFee" class="expressFee" placeholder="请输入配送费" style="width: 200px;"/> 元
        </el-form-item>

        <el-form-item label="# 商家logo图片" prop="logoPicUrl" label-width="120px" >
          <el-upload
           ref="upfile"
           style="display: inline"
           :auto-upload="false"
           :on-change="handleChange"
           :file-list="fileList"
           :limit="1"
           action="#">
            <el-button type="primary" size="small">
              上传
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { addSellerInfo, addSellerInfoContainPic, editSellerInfo, editSellerInfoContainPic, deleteSellerInfo, findSellerList } from '@/api/seller'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  inject: ['reload'],
  name: 'Seller',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      // calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'draft'
      },
      fileList: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑商家',
        create: '新增商家'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: '商家名称必填', trigger: 'blur' }],
        summary: [{ required: true, message: '商家简介必填', trigger: 'blur' }],
        businessStartTime: [{ required: true, message: '营业开始时间必填', trigger: 'change' }],
        businessEndTime: [{ required: true, message: '营业结束时间必填', trigger: 'change' }],
        minAmount: [{ required: true, message: '最小起送费必填', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      var requestBody = {
        pageNum: this.listQuery.page,
        pageSize: this.listQuery.limit,
        name: this.listQuery.name
      }
      findSellerList(requestBody).then(response => {
        this.list = response.data.list
        console.log('111' + JSON.stringify(this.list))
        this.total = response.data.total
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'draft',
        type: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 通过onchanne触发方法获得文件列表
    handleChange(file, fileList) {
      this.fileList = fileList
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.fileList.length === 0) {
            // 不上传logoPic提交
            addSellerInfo(this.temp).then(response => {
              this.commonCreateData(response)
            })
          } else {
            // 上传logoPic提交
            const fd = new FormData()
            fd.append('name', this.temp.name)
            fd.append('summary', this.temp.summary)
            fd.append('businessStartTime', this.temp.businessStartTime)
            fd.append('businessEndTime', this.temp.businessEndTime)
            fd.append('minAmount', this.temp.minAmount)
            fd.append('expressFee', this.temp.expressFee)
            fd.append('status', this.temp.status)
            this.fileList.forEach(item => {
              // 文件信息中raw才是真的文件
              fd.append('logoPicFile', item.raw)
            })
            addSellerInfoContainPic(fd).then(response => {
              this.commonCreateData(response)
            })
          }
        }
      })
    },
    commonCreateData(response) {
      // 将最新sellerId赋值展示
      // this.temp.sellerId = response.data
      // this.list.unshift(this.temp)
      // this.dialogFormVisible = false
      // // 上传成功后，将空间释放，不展示文件图标
      // this.fileList = []
      this.$notify({
        title: 'Success',
        message: 'Created Successfully',
        type: 'success',
        duration: 2000
      })
      this.reload()
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.fileList.length === 0) {
            // 不上传logoPic提交
            editSellerInfo(this.temp).then(() => {
              this.commonUpdateData()
            })
          } else {
            // 上传logoPic提交
            const fd = new FormData()
            fd.append('sellerId', this.temp.sellerId)
            fd.append('name', this.temp.name)
            fd.append('summary', this.temp.summary)
            fd.append('businessStartTime', this.temp.businessStartTime)
            fd.append('businessEndTime', this.temp.businessEndTime)
            fd.append('minAmount', this.temp.minAmount)
            fd.append('expressFee', this.temp.expressFee)
            fd.append('status', this.temp.status)
            this.fileList.forEach(item => {
              fd.append('logoPicFile', item.raw)
            })
            editSellerInfoContainPic(fd).then(() => {
              this.commonUpdateData()
            })
          }
        }
      })
    },
    commonUpdateData() {
      // const index = this.list.findIndex(v => v.sellerId === this.temp.sellerId)
      // // 展示框中更新对应记录
      // this.list.splice(index, 1, this.temp)
      // this.dialogFormVisible = false
      // 编辑上传成功后，将空间释放，不展示文件图标
      // this.fileList = []
      this.$notify({
        title: 'Success',
        message: 'Update Successfully',
        type: 'success',
        duration: 2000
      })
      this.reload()
    },
    handleDelete(row, index) {
      this.temp = Object.assign({}, row) // copy obj
      var requestParam = { sellerId: this.temp.sellerId }
      deleteSellerInfo(requestParam).then(() => {
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
        // 展示框中删除对应记录
        this.list.splice(index, 1)
      })
    },
    handleModifyStatus(row, status) {
      this.temp = Object.assign({}, row) // copy obj
      var requestBody = {
        sellerId: this.temp.sellerId,
        status: status
      }
      this.temp.status = status
      editSellerInfo(requestBody).then(() => {
        const index = this.list.findIndex(v => v.sellerId === this.temp.sellerId)
        // 展示框中更新对应记录
        this.list.splice(index, 1, this.temp)
        this.dialogFormVisible = false
        this.$notify({
          title: 'Success',
          message: status === 'published' ? '商家发布成功' : '商家已下线',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['商家ID', '商家名称', '商家简介', '营业开始时间', '营业结束时间', '最小起送费', '配送费', 'status']
        const filterVal = ['sellerId', 'name', 'summary', 'businessStartTime', 'businessEndTime', 'minAmount', 'expressFee', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      // const sort = this.listQuery.sort
      // return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
