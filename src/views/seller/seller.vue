<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="商家名称关键字" style="width: 130px; height: 50px" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 5px" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 5px" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增商家
      </el-button>
    </div>

    <!-- v-loading="listLoading" 搜索时，刷页面转圈圈的效果，本来数据都出来了，因为这个效果让我等，感觉没意义 -->
    <el-table
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 1155px;"
    >
      <el-table-column label="商家ID" align="center" width="70px">
        <template slot-scope="{row}">
          <span>{{ row.sellerId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商家名称" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Logo" prop="logoPicUrl" width="100px" align="center">
        <!--scope相当于一行的数据， scope.row相当于当前行的数据对象-->
        <template slot-scope="scope">
          <el-avatar v-if="scope.row.logoPicUrl != null" shape="square" :size="60" :src="scope.row.logoPicUrl" />
          <span v-if="scope.row.logoPicUrl == null"> 待上传</span>
        </template>
      </el-table-column>
      <el-table-column label="商家简介" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.summary }}</span>
        </template>
      </el-table-column>
      <el-table-column label="营业开始时间" width="105px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.businessStartTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="营业结束时间" width="105px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.businessEndTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最小起送费" width="95px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.minAmount }}</span> 元
        </template>
      </el-table-column>
      <el-table-column label="配送费" width="95px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.expressFee }}</span> 元
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="95px" align="center">
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
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)" :disabled="true">
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

        <el-form-item label="商家名称" prop="name" label-width="120px">
          <el-input v-model="temp.name" placeholder="请输入商家名称" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="商家简介" prop="summary" label-width="120px">
          <el-input v-model="temp.summary" class="summary" placeholder="请输入商家简介" style="width: 200px;" />
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
          <el-input v-model="temp.minAmount" class="minAmount" placeholder="请输入最小起送费" style="width: 200px;" /> 元
        </el-form-item>
        <el-form-item label="# 配送费" prop="expressFee" label-width="120px" align="left">
          <el-input v-model="temp.expressFee" class="expressFee" placeholder="请输入配送费" style="width: 200px;" /> 元
        </el-form-item>

        <el-form-item label="# Logo图片" prop="logoPicUrl" label-width="120px">
          <el-upload
            ref="upfile"
            style="display: inline"
            :auto-upload="false"
            :on-change="handleChange"
            :file-list="fileList"
            :limit="1"
            action="#"
          >
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
import { addSellerInfo, addSellerInfoContainPic, editSellerInfo,
  editSellerInfoContainPic, deleteSellerInfo, findSellerList } from '@/api/seller/seller'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

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
      listQuery: {
        page: 1,
        limit: 10
      },
      statusOptions: ['published', 'draft', 'deleted'],
      temp: {
        status: 'draft'
      },
      fileList: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑商家',
        create: '新增商家'
      },
      rules: {
        name: [{ required: true, message: '商家名称必填', trigger: 'blur' }],
        summary: [{ required: true, message: '商家简介必填', trigger: 'blur' }],
        businessStartTime: [{ required: true, message: '营业开始时间必填', trigger: 'change' }],
        businessEndTime: [{ required: true, message: '营业结束时间必填', trigger: 'change' }],
        minAmount: [{ required: true, message: '最小起送费必填', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      var requestBody = {
        pageNum: this.listQuery.page,
        pageSize: this.listQuery.limit,
        name: this.listQuery.name
      }
      findSellerList(requestBody).then(response => {
        if (response.data != null) {
          this.list = response.data.list
          this.total = response.data.total
        }
        setTimeout(() => {
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.getList()
    },
    // 此方法触发获得上传列表
    handleChange(file, fileList) {
      this.fileList = fileList
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
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
      // 新增商家回显
      this.temp.sellerId = response.data
      this.list.unshift(this.temp)
      // 关闭新增商家窗口
      this.dialogFormVisible = false
      this.$notify({
        message: '新增商家成功',
        type: 'success',
        duration: 2000
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
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
      // 编辑商家回显
      const index = this.list.findIndex(v => v.sellerId === this.temp.sellerId)
      // 展示框中更新对应记录
      this.list.splice(index, 1, this.temp)
      this.dialogFormVisible = false
      this.$notify({
        message: '编辑商家成功',
        type: 'success',
        duration: 2000
      })
    },
    handleDelete(row, index) {
      this.temp = Object.assign({}, row)
      var requestParam = { sellerId: this.temp.sellerId }
      deleteSellerInfo(requestParam).then(() => {
        this.$notify({
          message: '删除商家成功',
          type: 'success',
          duration: 2000
        })
        // 展示框中删除对应记录
        this.list.splice(index, 1)
      })
    },
    handleModifyStatus(row, status) {
      this.temp = Object.assign({}, row)
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
          message: status === 'published' ? '商家发布成功' : '商家已下线',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>
