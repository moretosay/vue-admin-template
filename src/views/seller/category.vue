<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="类目名称关键字" style="width: 130px; height: 50px" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 5px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 5px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增类目
      </el-button>
    </div>

    <el-table
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 710px;"
    >
      <el-table-column label="类目ID" prop="id" align="center" width="70px">
        <template slot-scope="{row}">
          <span>{{ row.categoryId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类目名称" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关联商家" width="200px" align="left" header-align="center">
        <template slot-scope="{row}" style="align-content: left">
          <span>{{ row.sellerName }} 【商家ID:{{ row.sellerId }}】</span>
        </template>
      </el-table-column>
      <el-table-column label="排序参数" width="80px" align="left" header-align="center">
        <template slot-scope="{row}" style="align-content: left">
          <span>{{ row.sortNum }} </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="250px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
          <el-button size="mini" type="primary" @click="handleCommodity(row)">
            关联商品
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 新增类目，编辑类目 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">

        <el-form-item label="类目名称" prop="name" label-width="120px">
          <el-input v-model="temp.name" placeholder="请输入类目名称" style="width: 200px;" />
        </el-form-item>

        <el-form-item v-if="dialogStatus==='create'" label="关联商家" prop="checkBoxSellerIdList" label-width="120px">
          <el-checkbox-group v-model="temp.checkBoxSellerIdList">
            <el-checkbox v-for="item in sellerList" :key="item.sellerId" :label="item.sellerId">
              <span>{{ item.name }} 【商家ID:{{ item.sellerId }}】</span>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item v-if="dialogStatus!=='create'" label="关联商家" prop="radioSellerId" label-width="120px">
          <el-radio-group v-model="temp.radioSellerId">
            <el-radio v-for="item in sellerList" :key="item.sellerId" :label="item.sellerId">
              <span>{{ item.name }} 【商家ID:{{ item.sellerId }}】</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="* 排序参数" prop="sortNum" label-width="120px">
          <el-input v-model="temp.sortNum" placeholder="请输入排序参数" style="width: 200px;" />
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

    <!-- 类目商品关系维护 -->
    <el-dialog :title="ccrTextMap[ccrDialogStatus]" :visible.sync="ccrDialogFormVisible" label-width="800px">
      <div class="filter-container">
        <el-button class="filter-item" style="margin-left: 1px;margin-bottom: 8px; height: 38px;" type="primary" @click="ccrHandleCreate">
          添加关系
        </el-button>
      </div>

      <el-table
        :data="ccrList"
        border
        fit
        highlight-current-row
        style="width: 470px;"
      >
        <el-table-column label="类目名称" prop="id" align="center" width="110px">
          <template slot-scope="{row}">
            <span>{{ row.categoryName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" prop="id" align="center" width="110px">
          <template slot-scope="{row}">
            <span>{{ row.commodityName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="排序参数" width="80px" align="center">
          <template slot-scope="{row}" style="align-content: left">
            <span>{{ row.sortNum }} </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="170px" class-name="small-padding fixed-width">
          <template slot-scope="{row,$index}">
            <el-button type="primary" size="mini" @click="ccrHandleUpdate(row)">
              编辑
            </el-button>
            <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="ccrHandleDelete(row,$index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--@pagination="ccrGetList"-->
      <pagination v-show="total>0" :total="total" :page.sync="ccrListQuery.page" :limit.sync="ccrListQuery.limit" />
    </el-dialog>

    <!-- 新增类目商品关系，编辑类目商品关系 -->
    <el-dialog :title="ccr2TextMap[ccr2DialogStatus]" :visible.sync="ccr2DialogFormVisible">
      <el-form ref="ccrDataForm" :rules="ccrRules" :model="ccrTemp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">

        <el-form-item label="* 类目名称" prop="categoryName" label-width="120px">
          <el-input v-model="ccrTemp.categoryName" placeholder="请输入类目名称" style="width: 200px;" :disabled="true" />
        </el-form-item>

        <el-form-item v-if="ccr2DialogStatus==='create'" label="关联商品" prop="checkBoxCommodityIdList" label-width="120px">
          <el-checkbox-group v-model="ccrTemp.checkBoxCommodityIdList">
            <el-checkbox v-for="item in commodityList" :key="item.commodityId" :label="item.commodityId">
              <span>{{ item.name }} 【商品ID:{{ item.commodityId }}】</span>
            </el-checkbox>
          </el-checkbox-group>
          <!--<span style="color: green" >功能Tip：可关联多个商家，生成多个商品！</span>-->
        </el-form-item>

        <el-form-item v-if="ccr2DialogStatus!=='create'" label="关联商品" prop="radioCommodityId" label-width="120px">
          <el-radio-group v-model="ccrTemp.radioCommodityId">
            <el-radio v-for="item in commodityList" :key="item.commodityId" :label="item.commodityId">
              <span>{{ item.name }} 【商品ID:{{ item.commodityId }}】</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="* 排序参数" prop="sortNum" label-width="120px">
          <el-input v-model="ccrTemp.sortNum" placeholder="请输入排序参数" style="width: 200px;" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="ccr2DialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="ccr2DialogStatus==='create'?ccrCreateData():ccrUpdateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { findSellerList } from '@/api/seller/seller'
import { findCommodityList } from '@/api/seller/commodity'
import { addCategoryList, editCategoryInfo, deleteCategoryInfo, findCategoryList } from '@/api/seller/category'
import { addCCRList, editCCRInfo, deleteCCRInfo, findCCRList } from '@/api/seller/ccr'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  inject: ['reload'],
  name: 'Category',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      total: 0,
      // listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      textMap: {
        update: '编辑类目',
        create: '新增类目'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      temp: {
      },
      rules: {
        name: [{ required: true, message: '类目名称必填', trigger: 'blur' }],
        checkBoxSellerIdList: [{ required: true, message: '商家必选', trigger: 'change' }],
        radioSellerId: [{ required: true, message: '商家必选', trigger: 'change' }]
      },
      sellerList: [],

      ccrList: null,
      ccrTotal: 0,
      // ccrListLoading: true,
      ccrListQuery: {
        page: 1,
        limit: 20
      },
      ccrTextMap: {
        create: '类目商品关系维护'
      },
      ccrDialogFormVisible: false,
      ccrDialogStatus: '',
      ccrTemp: {
        checkBoxCommodityIdList: []
      },
      commodityList: [],
      ccrRules: {
        checkBoxCommodityIdList: [{ required: true, message: '商品必选', trigger: 'change' }],
        radioCommodityId: [{ required: true, message: '商品必选', trigger: 'change' }]
      },

      ccr2TextMap: {
        create: '关联商品'
      },
      ccr2DialogFormVisible: false,
      ccr2DialogStatus: ''
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
      findCategoryList(requestBody).then(response => {
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
    getSellerList(handleType) {
      var requestBody = {
        pageNum: 1,
        pageSize: 10 // 大概率不会超过10个商家
      }
      findSellerList(requestBody).then(response => {
        if (response.data != null) {
          this.sellerList = response.data.list
        }
        setTimeout(() => {
        }, 1.5 * 1000)
        if (handleType === 'create' && this.sellerList.length === 0) {
          this.$notify({
            message: '请先添加商家【移步商家管理】',
            type: 'error',
            duration: 2000
          })
          return
        }
      })
    },
    handleCreate() {
      this.getSellerList('create')
      this.$set(this.temp, 'checkBoxSellerIdList', [])
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
            name: this.temp.name,
            sellerIdList: this.temp.checkBoxSellerIdList,
            sortNum: this.temp.sortNum
          }
          addCategoryList(requestBody).then(response => {
            this.dialogFormVisible = false
            this.$notify({
              message: '新增类目成功',
              type: 'success',
              duration: 2000
            })
            this.reload()
          })
        }
      })
    },
    handleUpdate(row) {
      this.getSellerList('update')
      // 编辑时，回显已有数据
      this.temp = Object.assign({}, row) // copy obj
      this.$set(this.temp, 'radioSellerId', this.temp.sellerId)
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
            categoryId: this.temp.categoryId,
            name: this.temp.name,
            sellerId: this.temp.radioSellerId,
            sortNum: this.temp.sortNum
          }
          editCategoryInfo(requestBody).then(() => {
            const index = this.list.findIndex(v => v.sellerId === this.temp.sellerId)
            // 展示框中更新对应记录
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              message: '编辑类目成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.temp = Object.assign({}, row) // copy obj
      var requestParam = { categoryId: this.temp.categoryId }
      deleteCategoryInfo(requestParam).then(() => {
        this.$notify({
          message: '删除类目成功',
          type: 'success',
          duration: 2000
        })
        // // 展示框中删除对应记录
        this.list.splice(index, 1)
      })
    },

    handleCommodity(row) {
      this.temp = Object.assign({}, row)
      var requestBody = {
        pageNum: 1,
        pageSize: 30, // 不可能超过30个商品吧
        categoryId: this.temp.categoryId
      }
      findCCRList(requestBody).then(response => {
        this.ccrList = response.data.list
        setTimeout(() => {
        }, 1.5 * 1000)
      })
      // 向下传递类ss目基本信息，便于后续操作
      this.ccrTemp.categoryId = this.temp.categoryId
      this.ccrTemp.categoryName = this.temp.name
      this.ccrDialogStatus = 'create'
      this.ccrDialogFormVisible = true
      this.$nextTick(() => {
      })
    },
    ccrFindCommodityList(handleType) {
      var requestBody = {
        pageNum: 1,
        pageSize: 20// 不可能超过20个商家吧！
      }
      findCommodityList(requestBody).then(response => {
        this.commodityList = response.data.list
        setTimeout(() => {
        }, 1.5 * 1000)
        if (handleType === 'create' && this.commodityList.length === 0) {
          this.$notify({
            message: '请先添加商品【移步商品管理】',
            type: 'error',
            duration: 2000
          })
          return
        }
      })
    },
    ccrHandleCreate() {
      this.ccrFindCommodityList('create')
      // 初始化ccrTemp.checkBoxCommodityIdList，否则此标签不展示
      this.$set(this.ccrTemp, 'checkBoxCommodityIdList', [])
      this.ccr2DialogStatus = 'create'
      this.ccr2DialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['ccrDataForm'].clearValidate()
      })
    },
    ccrCreateData() {
      this.$refs['ccrDataForm'].validate((valid) => {
        if (valid) {
          var requestBody = {
            categoryId: this.ccrTemp.categoryId,
            commodityIdList: this.ccrTemp.checkBoxCommodityIdList,
            sortNum: this.ccrTemp.sortNum
          }
          addCCRList(requestBody).then(response => {
            this.ccr2DialogFormVisible = true
            // this.ccrDialogFormVisible = true 此处要回显数据，得将数据拆分后，添加到list中
            // this.list.unshift(this.temp)
            this.$notify({
              message: '添加关系成功',
              type: 'success',
              duration: 2000
            })
            this.reload()
          })
        }
      })
    },
    ccrHandleUpdate(row) {
      this.ccrFindCommodityList('update')
      this.ccrTemp = Object.assign({}, row)
      this.$set(this.ccrTemp, 'radioCommodityId', this.ccrTemp.commodityId)
      this.ccr2DialogStatus = 'update'
      this.ccr2DialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['ccrDataForm'].clearValidate()
      })
    },
    ccrUpdateData() {
      this.$refs['ccrDataForm'].validate((valid) => {
        if (valid) {
          var requestBody = {
            categoryCommodityId: this.ccrTemp.categoryCommodityId,
            categoryId: this.ccrTemp.categoryId,
            commodityId: this.ccrTemp.radioCommodityId,
            sortNum: this.ccrTemp.sortNum
          }
          editCCRInfo(requestBody).then(() => {
            const index = this.ccrList.findIndex(v => v.categoryCommodityId === this.ccrTemp.categoryCommodityId)
            this.ccrList.splice(index, 1, this.ccrTemp)
            this.ccr2DialogFormVisible = false
            this.$notify({
              message: '编辑关系成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    ccrHandleDelete(row, index) {
      this.ccrTemp = Object.assign({}, row)
      var requestParam = { categoryCommodityId: this.ccrTemp.categoryCommodityId }
      deleteCCRInfo(requestParam).then(() => {
        this.$notify({
          message: '删除关系成功',
          type: 'success',
          duration: 2000
        })
        this.ccrList.splice(index, 1)
      })
    }

  }
}
</script>
