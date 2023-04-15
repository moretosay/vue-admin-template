<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.roleCode" placeholder="角色Code关键字" style="width: 135px; height: 50px" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增角色
      </el-button>
      <!--<el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">-->
      <!--导出-->
      <!--</el-button>-->
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 640px;"
    >
      <el-table-column label="角色ID" prop="id" align="center" width="70px">
        <template slot-scope="{row}">
          <span>{{ row.roleId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色Code" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.roleCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色描述" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.roleDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="170px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- v-show：数据>0显示 page：第几页，对应后端pageNum，limit：每页记录数，对应后端pageSize -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- :visible.sync，vue标签，设置动态的显示内容与否 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">

        <el-form-item label="角色Code" prop="name" label-width="120px">
          <el-input v-model="temp.roleCode" placeholder="请输入角色Code" style="width: 200px;" />
        </el-form-item>

        <el-form-item label="角色描述" prop="name" label-width="120px">
          <el-input v-model="temp.roleDesc" placeholder="请输入角色描述" style="width: 200px;" />
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
import { addRoleInfo, editRoleInfo, deleteRoleInfo, findRoleList } from '@/api/seller/role'

import waves from '@/directive/waves' // waves directive
// import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  inject: ['reload'],
  name: 'Role',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        roleCode: undefined
      },
      showReviewer: false,
      sellerList: [],
      temp: {
        id: undefined,
        // importance: 1,
        remark: '',
        timestamp: new Date(),
        title: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑角色',
        create: '新增角色'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        roleCode: [{ required: true, message: '角色Code必填', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '角色描述必填', trigger: 'blur' }]
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
        roleCode: this.listQuery.roleCode
      }
      findRoleList(requestBody).then(response => {
        this.list = response.data.list
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
    resetTemp() {
      this.temp = {
        id: undefined,
        // importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: '',
        checkBoxSellerIdList: []
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
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          var requestBody = {
            roleCode: this.temp.roleCode,
            roleDesc: this.temp.roleDesc
          }
          addRoleInfo(requestBody).then(response => {
            // 单条新增角色，把角色手动添加到table中，不用reload刷，体验和性能赶不上这个
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
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
          var requestBody = {
            roleId: this.temp.roleId,
            roleCode: this.temp.roleCode,
            roleDesc: this.temp.roleDesc
          }
          editRoleInfo(requestBody).then(() => {
            // 将记录展示到table中，不通过reload刷新页面
            const index = this.list.findIndex(v => v.roleId === this.temp.roleId)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.temp = Object.assign({}, row) // copy obj
      var requestParam = { roleId: this.temp.roleId }
      deleteRoleInfo(requestParam).then(() => {
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
        // 展示框中删除对应记录
        this.list.splice(index, 1)
      })
    }
  }
}
</script>
