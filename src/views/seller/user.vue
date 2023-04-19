<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.userName" placeholder="用户名关键字" style="width: 130px; height: 50px" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增用户
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 1085px;"
    >
      <el-table-column label="用户ID" align="center" width="70px">
        <template slot-scope="{row}">
          <span>{{ row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.mobile }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" width="155px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column>
      <!--<el-table-column label="头像" width="100px" align="center">-->
      <!--&lt;!&ndash;scope相当于一行的数据， scope.row相当于当前行的数据对象&ndash;&gt;-->
      <!--<template slot-scope="scope">-->
      <!--<el-avatar v-if="scope.row.headPicUrl != null" shape="square" :size="60" :src="scope.row.headPicUrl" />-->
      <!--<span v-if="scope.row.headPicUrl == null"> 待上传</span>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column label="个人简介" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.introduction }}</span>
        </template>
      </el-table-column>
      <el-table-column label="添加角色" width="220px" align="left" header-align="center">
        <template slot-scope="{row}">
          <span v-for="item in row.roleCodeList" :key="item" :v-bind:key="item">{{ '【' + item + '】' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关联商家" width="110px" align="left" header-align="center">
        <template slot-scope="{row}">
          <span v-for="item in row.sellerIdList" :key="item" :v-bind:key="item">{{ '【商家ID:' + item + '】' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="170px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
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

        <el-form-item label="用户名" prop="userName" label-width="120px">
          <el-input v-model="temp.userName" placeholder="请输入用户名" style="width: 200px;" />
        </el-form-item>

        <el-form-item label="初始密码" prop="password" label-width="120px">
          <el-input v-model="temp.password" placeholder="请输入初始密码" style="width: 200px;" />
        </el-form-item>

        <el-form-item label="* 手机号" prop="mobile" label-width="120px">
          <el-input v-model="temp.mobile" placeholder="请输入手机号" style="width: 200px;" />
        </el-form-item>

        <el-form-item label="* 邮箱" prop="email" label-width="120px">
          <el-input v-model="temp.email" placeholder="请输入邮箱" style="width: 200px;" />
        </el-form-item>

        <el-form-item label="* 个人简介" prop="introduction" label-width="120px">
          <el-input v-model="temp.introduction" placeholder="请输入介绍" style="width: 200px;" />
        </el-form-item>

        <el-form-item label="* 添加角色" prop="roleCodeList" label-width="120px">
          <el-checkbox-group v-model="temp.roleCodeList">
            <el-checkbox v-for="item in roleList" :key="item.roleCode" :label="item.roleCode">
              <span>角色Code:{{ item.roleCode }}</span>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="* 关联商家" prop="sellerIdList" label-width="120px">
          <el-checkbox-group v-model="temp.sellerIdList">
            <el-checkbox v-for="item in sellerList" :key="item.sellerId" :label="item.sellerId">
              <span>{{ item.name }} 【商家ID:{{ item.sellerId }}】</span>
            </el-checkbox>
          </el-checkbox-group>
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
import { addUserInfo, editUserInfo, deleteUserInfo, findUserList } from '@/api/seller/user'
import { findSellerList } from '@/api/seller/seller'
import { findRoleList } from '@/api/seller/role'

import waves from '@/directive/waves' // waves directive
// import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  inject: ['reload'],
  name: 'User',
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
        userName: undefined
      },
      showReviewer: false,
      sellerList: [],
      roleList: [],
      temp: {
        id: undefined,
        remark: '',
        timestamp: new Date(),
        title: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑用户',
        create: '新增用户'
      },
      rules: {
        userName: [{ required: true, message: '用户名必填', trigger: 'blur' }]
        // password: [{ required: true, message: '初始密码必填', trigger: 'blur' }]
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
        userName: this.listQuery.userName
      }
      findUserList(requestBody).then(response => {
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
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        roleCodeList: [],
        sellerIdList: []
      }
    },
    handleCreate() {
      this.commonCreateUpdateData()
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    commonCreateUpdateData() {
      // 查询商家列表
      var sellerRequestBody = {
        pageNum: 1,
        pageSize: 30// 不可能超过20个商家吧！
      }
      findSellerList(sellerRequestBody).then(response => {
        // Uncaught (in promise) TypeError: response.data is null
        if(null != reponse.data){
          this.sellerList = response.data.list
        }
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })

      // 查询角色列表
      var roleRequestBody = {
        pageNum: 1,
        pageSize: 30// 不可能超过20个商家吧！
      }
      findRoleList(roleRequestBody).then(response => {
        this.roleList = response.data.list
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          var requestBody = {
            userName: this.temp.userName,
            password: this.temp.password,
            mobile: this.temp.mobile,
            email: this.temp.email,
            introduction: this.temp.introduction,
            roleCodeList: this.temp.roleCodeList,
            sellerIdList: this.temp.sellerIdList,
            // 头像，只用于后台系统的右上角的头像展示，没必要提供添加和编辑功能，后续用户真有需求，可以完善下
            headPicUrl: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
          }
          addUserInfo(requestBody).then(response => {
            // 将记录添加到Table中，不再reload页面
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
            this.reload()
          })
        }
      })
    },
    handleUpdate(row) {
      this.commonCreateUpdateData()
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
            userId: this.temp.userId,
            userName: this.temp.userName,
            // 此处不更新密码，为啥，因为
            // password: this.temp.password,
            mobile: this.temp.mobile,
            email: this.temp.email,
            introduction: this.temp.introduction,
            roleCodeList: this.temp.roleCodeList,
            sellerIdList: this.temp.sellerIdList
          }
          editUserInfo(requestBody).then(() => {
            // const index = this.list.findIndex(v => v.sellerId === this.temp.sellerId)
            // // 展示框中更新对应记录
            // this.list.splice(index, 1, this.temp)
            // this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
            this.reload()
          })
        }
      })
    },
    handleDelete(row, index) {
      this.temp = Object.assign({}, row) // copy obj
      var requestParam = { userId: this.temp.userId }
      deleteUserInfo(requestParam).then(() => {
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
