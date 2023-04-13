<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="商品名称关键字检索" style="width: 220px; height: 50px" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate" >
        新增商品
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
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="商品ID" prop="id" align="center" width="70px" >
        <template slot-scope="{row}">
          <span>{{ row.commodityId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主图" prop="mainUrl" width="100px" align="center" >
        <!--scope相当于一行的数据， scope.row相当于当前行的数据对象-->
        <template slot-scope="scope">
          <el-avatar shape="square" :size="60" :src="scope.row.mainUrl" v-if="scope.row.mainUrl != null" ></el-avatar>
          <span v-if="scope.row.mainUrl == null" > 待上传</span>
        </template>
      </el-table-column>
      <el-table-column label="商品简介" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.summary }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品价格" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.price }}</span> 元
        </template>
      </el-table-column>
      <el-table-column label="关联类目" width="330px" align="left" header-align="center">
        <template slot-scope="{row}">
          <span>{{ row.categoryName }} 【类目ID:{{ row.categoryId }}, 所属商家: {{ row.sellerName }}】</span>
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

        <el-form-item label="商品名称" prop="name" label-width="120px" >
          <el-input v-model="temp.name" placeholder="请输入商品名称" style="width: 200px;" />
        </el-form-item>

        <el-form-item label="# 商品简介" prop="summary" label-width="120px" >
          <el-input v-model="temp.summary" placeholder="请输入商品简介" style="width: 200px;" />
        </el-form-item>

        <el-form-item label="商品价格" prop="price" label-width="120px" >
          <el-input v-model="temp.price" placeholder="请输入商品价格" style="width: 200px;" /> 元
        </el-form-item>

        <el-form-item label="关联类目" prop="checkBoxCategoryIdList" label-width="120px" v-if="dialogStatus==='create'" >
          <el-checkbox-group v-model="temp.checkBoxCategoryIdList">
            <el-checkbox :label="item.categoryId" v-for="item in categoryList" :key="item.categoryId" >
              <span>{{ item.name }} 【类目ID:{{ item.categoryId }}, 所属商家: {{ item.sellerName }}】</span>
            </el-checkbox>
          </el-checkbox-group>
          <span style="color: green" >功能Tip：可关联多条类目，生成多个商品！</span>
        </el-form-item>

        <el-form-item label="关联类目" prop="radioCategoryId" label-width="120px" v-if="dialogStatus!=='create'" >
          <el-radio-group v-model="temp.radioCategoryId">
            <el-radio :label="item.categoryId" v-for="item in categoryList" :key="item.categoryId" >
              <span>{{ item.name }} 【类目ID:{{ item.categoryId }}, 所属商家: {{ item.sellerName }}】</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="# 商品主图" prop="mainUrl" label-width="120px" >
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
import { addCommodityList, addCommodityListContainPic, editCommodityInfo, editCommodityInfoContainPic, deleteCommodityInfo, findCommodityList } from '@/api/seller-commodity'
import { findCategoryList } from '@/api/seller-category'

import waves from '@/directive/waves' // waves directive
// import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  inject: ['reload'],
  name: 'Order',
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
      // calendarTypeOptions,
      // sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      categoryList: [],
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published'
      },
      fileList: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑商品',
        create: '新增商品'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: '商品名称必填', trigger: 'blur' }],
        price: [{ required: true, message: '商品价格必填', trigger: 'blur' }],
        checkBoxCategoryIdList: [{ required: true, message: '类目必选', trigger: 'change' }],
        radioCategoryId: [{ required: true, message: '类目必选', trigger: 'change' }]
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
      findCommodityList(requestBody).then(response => {
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
        status: 'published',
        type: '',
        checkBoxCategoryIdList: []
      }
    },
    handleCreate() {
      // 新增商品时，查询当前用户下的类目，后续进行权限控制  todo
      // this.categoryList = this.list
      var requestBody = {
        pageNum: 1,
        pageSize: 20// 不可能超过20个商家吧！
      }
      findCategoryList(requestBody).then(response => {
        this.categoryList = response.data.list
        // this.total = response.data.total
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
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
          // 不上传主图
          if (this.fileList.length === 0) {
            var requestBody = {
              name: this.temp.name,
              summary: this.temp.summary,
              price: this.temp.price,
              categoryIdList: this.temp.checkBoxCategoryIdList
            }
            addCommodityList(requestBody).then(response => {
              this.commonCreateData(response)
            })
          } else {
            // 上传主图
            const fd = new FormData()
            fd.append('name', this.temp.name)
            fd.append('summary', this.temp.summary)
            fd.append('price', this.temp.price)
            fd.append('categoryIdList', this.temp.checkBoxCategoryIdList)
            this.fileList.forEach(item => {
              fd.append('mainFile', item.raw)
            })
            addCommodityListContainPic(fd).then(response => {
              this.commonCreateData(response)
            })
          }
        }
      })
    },
    commonCreateData(response) {
      this.$notify({
        title: 'Success',
        message: 'Created Successfully',
        type: 'success',
        duration: 2000
      })
      this.reload()
    },
    handleUpdate(row) {
      // 编辑类目时，查询当前用户下的商家，后续进行权限控制  todo
      // this.categoryList = this.list
      var requestBody = {
        pageNum: 1,
        pageSize: 20// 不可能超过20个商家吧！
      }
      findCategoryList(requestBody).then(response => {
        this.categoryList = response.data.list
        // this.total = response.data.total
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
      // todo
      this.temp = Object.assign({}, row) // copy obj
      // 此种方式赋值，radioCategoryId 对应的组件不可修改
      // this.temp.radioCategoryId = this.temp.categoryId
      // radioCategoryId 对应的组件可修改
      this.$set(this.temp, 'radioCategoryId', this.temp.categoryId)
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
            var requestBody = {
              commodityId: this.temp.commodityId,
              name: this.temp.name,
              summary: this.temp.summary,
              price: this.temp.price,
              categoryId: this.temp.radioCategoryId
            }
            // 不上传主图
            editCommodityInfo(requestBody).then(() => {
              this.commonUpdateData()
            })
          } else {
            // 上传logoPic提交
            const fd = new FormData()
            fd.append('commodityId', this.temp.commodityId)
            fd.append('name', this.temp.name)
            fd.append('summary', this.temp.summary)
            fd.append('price', this.temp.price)
            fd.append('categoryId', this.temp.radioCategoryId)
            this.fileList.forEach(item => {
              fd.append('mainFile', item.raw)
            })
            editCommodityInfoContainPic(fd).then(() => {
              this.commonUpdateData()
            })
          }
        }
      })
    },
    commonUpdateData() {
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
      var requestParam = { commodityId: this.temp.commodityId }
      deleteCommodityInfo(requestParam).then(() => {
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
        // // 展示框中删除对应记录
        this.list.splice(index, 1)
        // this.reload()
      })
    }
    // handleDownload() {
    //   this.downloadLoading = true
    //   import('@/vendor/Export2Excel').then(excel => {
    //     const tHeader = ['商家ID', '商家名称', '商家简介', '营业开始时间', '营业结束时间', '最小起送金额', '配送费', 'status']
    //     const filterVal = ['sellerId', 'name', 'summary', 'businessStartTime', 'businessEndTime', 'minAmount', 'expressFee', 'status']
    //     const data = this.formatJson(filterVal)
    //     excel.export_json_to_excel({
    //       header: tHeader,
    //       data,
    //       filename: 'table-list'
    //     })
    //     this.downloadLoading = false
    //   })
    // },
    // formatJson(filterVal) {
    //   return this.list.map(v => filterVal.map(j => {
    //     if (j === 'timestamp') {
    //       return parseTime(v[j])
    //     } else {
    //       return v[j]
    //     }
    //   }))
    // },
    // getSortClass: function(key) {
    //   // const sort = this.listQuery.sort
    //   // return sort === `+${key}` ? 'ascending' : 'descending'
    // }
  }
}
</script>
