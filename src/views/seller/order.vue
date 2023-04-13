<template>
  <div class="app-container">
    <div class="filter-container">

      <el-input
        v-model="listQuery.status"
        placeholder="状态关键字"
        style="width: 100px; height: 50px"
        class="filter-item"
        @keyup.enter.native="handleFilter" />
      <el-input
        v-model="listQuery.remark"
        placeholder="备注关键字"
        style="width: 120px; height: 50px"
        class="filter-item"
        @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
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
    >
      <el-table-column label="订单ID" prop="id" align="center" width="70px" >
        <template slot-scope="{row}">
          <span>{{ row.orderId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" width="60px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.gender == '0' ? '女' : '男'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.mobile}}</span>
        </template>
      </el-table-column>
      <el-table-column label="配送地址" width="250px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.area + row.detail }}</span> 元
        </template>
      </el-table-column>
      <el-table-column label="订单金额" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.total }}</span> 元
        </template>
      </el-table-column>
      <el-table-column label="用餐人数" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.useNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商家名称" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.sellerName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            <span v-if="row.status == 'TO_PAY'">已点单待支付</span>
            <span v-if="row.status == 'TO_RECEIVE'">已支付待接单</span>
            <span v-if="row.status == 'TO_ARRIVE'">已接单待配送</span>
            <span v-if="row.status == 'FINISHED'">已完成</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="235px" class-name="small-padding fixed-width" align="left" header-align="center" >
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleDetail(row)">
            商品详情
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
          <el-button v-if="row.status=='TO_RECEIVE'" size="mini" type="success" @click="handleModifyStatus(row,'TO_ARRIVE')">
            接单
          </el-button>
          <el-button v-if="row.status=='TO_ARRIVE'" size="mini" type="success" @click="handleModifyStatus(row,'FINISHED')">
            配送
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- v-show：数据>0显示 page：第几页，对应后端pageNum，limit：每页记录数，对应后端pageSize -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- :visible.sync，vue标签，设置动态的显示内容与否 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">

      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="temp.commodityDetailList"
        border
        fit
        highlight-current-row
        style="width: 400px;"
      >
        <el-table-column label="商品ID" align="center" width="70px" >
          <template slot-scope="{row}">
            <span>{{ row.commodityId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" align="center" width="110px" >
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
        <el-table-column label="商品价格" align="center" width="110px" >
          <template slot-scope="{row}">
            <span>{{ row.price }} 元</span>
          </template>
        </el-table-column>
        <el-table-column label="商品数量" align="center" width="110px" >
          <template slot-scope="{row}">
            <span>x {{ row.quantity }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
import { editOrderInfo, deleteOrderInfo, findOrderList } from '@/api/seller/order'

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
        TO_PAY: 'danger',
        TO_RECEIVE: 'info',
        TO_ARRIVE: 'success',
        FINISHED: 'success'
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
        status: 'draft'
      },
      fileList: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        detail: '商品详情'
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
      var status = this.listQuery.status
      var statusList = []
      if ('已点单待支付'.search(status) !== -1) {
        statusList.push('TO_PAY')
      }
      if ('已支付待接单'.search(status) !== -1) {
        statusList.push('TO_RECEIVE')
      }
      if ('已接单待配送'.search(status) !== -1) {
        statusList.push('TO_ARRIVE')
      }
      if ('已完成'.search(status) !== -1) {
        statusList.push('FINISHED')
      }
      var requestBody = {
        pageNum: this.listQuery.page,
        pageSize: this.listQuery.limit,
        statusList: statusList,
        remark: this.listQuery.remark
      }
      findOrderList(requestBody).then(response => {
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
        type: '',
        checkBoxCategoryIdList: []
      }
    },
    handleDetail(row) {
      this.temp = Object.assign({}, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'detail'
      this.dialogFormVisible = true
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    handleDelete(row, index) {
      this.temp = Object.assign({}, row) // copy obj
      var requestParam = { orderId: this.temp.orderId }
      deleteOrderInfo(requestParam).then(() => {
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
    },
    handleModifyStatus(row, status) {
      this.temp = Object.assign({}, row) // copy obj
      var requestBody = {
        orderId: this.temp.orderId,
        status: status
      }
      this.temp.status = status
      editOrderInfo(requestBody).then(() => {
        const index = this.list.findIndex(v => v.orderId === this.temp.orderId)
        // 展示框中更新对应记录
        this.list.splice(index, 1, this.temp)
        this.dialogFormVisible = false
        this.$notify({
          title: 'Success',
          message: status === 'TO_ARRIVE' ? '已接单待配送' : status === 'FINISHED' ? '已完成' : '非预期操作',
          type: 'success',
          duration: 2000
        })
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
