<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="商品名称关键字" style="width: 130px; height: 50px" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 5px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 5px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增商品
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 940px;"
    >
      <el-table-column label="商品ID" prop="id" align="center" width="70px">
        <template slot-scope="{row}">
          <span>{{ row.commodityId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主图" prop="mainUrl" width="100px" align="center">
        <template slot-scope="scope">
          <el-avatar v-if="scope.row.mainUrl != null" shape="square" :size="60" :src="scope.row.mainUrl" />
          <span v-if="scope.row.mainUrl == null"> 待上传</span>
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

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">

        <el-form-item label="商品名称" prop="name" label-width="120px">
          <el-input v-model="temp.name" placeholder="请输入商品名称" style="width: 200px;" />
        </el-form-item>

        <el-form-item label="* 商品简介" prop="summary" label-width="120px">
          <el-input v-model="temp.summary" placeholder="请输入商品简介" style="width: 200px;" />
        </el-form-item>

        <el-form-item label="商品价格" prop="price" label-width="120px">
          <el-input v-model="temp.price" placeholder="请输入商品价格" style="width: 200px;" /> 元
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

        <el-form-item label="* 商品主图" prop="mainUrl" label-width="120px">
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

  </div>
</template>

<script>
import { addCommodityList, addCommodityListContainPic, editCommodityInfo,
  editCommodityInfoContainPic, deleteCommodityInfo, findCommodityList } from '@/api/seller/commodity'
import { findSellerList } from '@/api/seller/seller'

import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  inject: ['reload'],
  name: 'Commodity',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10
      },
      sellerList: [],
      temp: {
      },
      fileList: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑商品',
        create: '新增商品'
      },
      rules: {
        name: [{ required: true, message: '商品名称必填', trigger: 'blur' }],
        price: [{ required: true, message: '商品价格必填', trigger: 'blur' }],
        checkBoxSellerIdList: [{ required: true, message: '商家必选', trigger: 'change' }],
        radioSellerId: [{ required: true, message: '商家必选', trigger: 'change' }]
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
      findCommodityList(requestBody).then(response => {
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
    findSellerList(){
      var requestBody = {
        pageNum: 1,
        pageSize: 20// 不可能超过20个商家吧！
      }
      findSellerList(requestBody).then(response => {
        if (response.data != null) {
          this.sellerList = response.data.list
        }
        setTimeout(() => {
        }, 1.5 * 1000)
      })
    },
    handleChange(file, fileList) {
      this.fileList = fileList
    },
    handleCreate() {
      this.findSellerList()
      if (this.sellerList.length === 0) {
        this.$notify({
          message: '请先添加商家【移步商家管理】',
          type: 'error',
          duration: 2000
        })
        return
      }
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
          // 不上传主图
          if (this.fileList.length === 0) {
            var requestBody = {
              name: this.temp.name,
              summary: this.temp.summary,
              price: this.temp.price,
              sellerIdList: this.temp.checkBoxSellerIdList,
              sortNum: this.temp.sortNum
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
            fd.append('sellerIdList', this.temp.checkBoxSellerIdList)
            fd.append('sortNum', this.temp.sortNum)
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
      this.dialogFormVisible = false
      this.$notify({
        message: '新增商品成功',
        type: 'success',
        duration: 2000
      })
      this.reload()
    },
    handleUpdate(row) {
      this.findSellerList()
      this.temp = Object.assign({}, row) // copy obj
      // this.temp.radioSellerId = this.temp.sellerId，此种方式赋值，radioSellerId对应的组件不可修改
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
          if (this.fileList.length === 0) {
            var requestBody = {
              commodityId: this.temp.commodityId,
              name: this.temp.name,
              summary: this.temp.summary,
              price: this.temp.price,
              sellerId: this.temp.radioSellerId,
              sortNum: this.temp.sortNum
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
            fd.append('sellerId', this.temp.radioSellerId)
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
      const index = this.list.findIndex(v => v.commodityId === this.temp.commodityId)
      this.list.splice(index, 1, this.temp)
      this.dialogFormVisible = false
      this.$notify({
        message: '编辑商品成功',
        type: 'success',
        duration: 2000
      })
    },
    handleDelete(row, index) {
      this.temp = Object.assign({}, row)
      var requestParam = { commodityId: this.temp.commodityId }
      deleteCommodityInfo(requestParam).then(() => {
        this.$notify({
          message: '删除商品成功',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
      })
    }
  }
}
</script>
