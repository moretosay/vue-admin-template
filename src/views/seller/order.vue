<template>
  <div class="app-container">
    <div class="filter-container">

      <el-input
        v-model="listQuery.status"
        placeholder="状态关键字"
        style="width: 100px; height: 50px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.remark"
        placeholder="备注关键字"
        style="width: 100px; height: 50px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <!--<el-table-column label="商品ID" align="center" width="70px" >-->
      <span style="color: green">{{ listQuery.message }}</span>
      <!--</el-table-column>-->
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
      <el-table-column label="订单ID" prop="id" align="center" width="70px">
        <template slot-scope="{row}">
          <span>{{ row.orderId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" width="60px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.gender == '0' ? '女' : '男' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.mobile }}</span>
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
      <el-table-column label="操作" width="235px" class-name="small-padding fixed-width" align="left" header-align="center">
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
        <el-table-column label="商品ID" align="center" width="70px">
          <template slot-scope="{row}">
            <span>{{ row.commodityId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" align="center" width="110px">
          <template slot-scope="{row}">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品价格" align="center" width="110px">
          <template slot-scope="{row}">
            <span>{{ row.price }} 元</span>
          </template>
        </el-table-column>
        <el-table-column label="商品数量" align="center" width="110px">
          <template slot-scope="{row}">
            <span>x {{ row.quantity }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
import { editOrderInfo, deleteOrderInfo, findOrderList, closeSse } from '@/api/seller/order'

import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { EventSourcePolyfill } from 'event-source-polyfill' // npm install --save event-source-polyfill

export default {
  inject: ['reload'],
  name: 'Order',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        TO_PAY: 'danger',
        TO_RECEIVE: 'success',
        TO_ARRIVE: 'success',
        FINISHED: 'info'
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
        title: undefined,
        type: undefined,
        message: ''
      },
      showReviewer: false,
      categoryList: [],
      temp: {
        id: undefined,
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
      downloadLoading: false,
      // 创建sse
      eventSource: null,
      // 模拟登录用户 1681443270209
      userId: new Date().getTime()
    }
  },
  // created:在模板渲染成html前调用， mounted:在模板渲染成html后调用
  created() {
    this.getList()
    // 页面加载时只执行 onload 事件。
    // 页面关闭时，先 onbeforeunload 事件，再 onunload 事件。
    // 页面刷新时先执行 onbeforeunload事件，然后 onunload 事件，最后 onload 事件。
    // window.addEventListener('beforeunload事件', this.closeSse())
  },
  mounted() {
    this.createSse()
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
    createSse() {
      if (window.EventSource) {
        // 根据环境的不同，变更url
        // const url = process.env.VUE_APP_MSG_SERVER_URL
        // 用户userId
        // const { userId } = this.$store.state.user
        const url = 'http://localhost:5000/sse/connect/' + this.userId
        // this.eventSource = new EventSourcePolyfill(url)
        this.eventSource = new EventSourcePolyfill(url)
        // , {
        // 设置重连时间
        // heartbeatTimeout: 60 * 60 * 1000
        // 添加token
        // headers: {
        //   'Authorization': 'test token'
        // }
        // })
        this.eventSource.onopen = (e) => {
          console.log(this.getCurrentTime() + '步骤1：建立SSE连接~userId:' + this.userId)
          // console.log('步骤1：已建立SSE连接~:' + JSON.stringify(e))
        }
        this.eventSource.onmessage = (e) => {
          console.log(this.getCurrentTime() + '步骤2：已接受到push消息:', e.data)
          // 接收到新的订单，调用搜索方法，不能直接调用this.reload，因为这个机制会触发页面的关闭和打开，会创建大量sse连接
          this.listQuery.message = e.data
          this.getList()
        }
        this.eventSource.onerror = (e) => {
          console.log(this.getCurrentTime() + '步骤4：SSE连接失败~userId:' + this.userId)
          // if (e.readyState === EventSource.CLOSED) {
          //   console.log('SSE连接关闭~userId:' + this.userId)
          // } else {
          //   console.log('error', e)
          // }
          // Firefox 无法建立到 http://localhost:5000/sse/connect?userId=1681436073256 服务器的连接。
          // Uncaught TypeError: _this2.eventSource is null
          // onerror order.vue:288
          // else if (this.eventSource.readyState === EventSource.CONNECTING) {
          //   console.log('SSE正在重连~userId:' + this.userId)
          //   // 重新设置token
          //   // this.eventSource.headers = {
          //   //   'Authorization': 'test token'
          //   // };
        }
      } else {
        console.log('你的浏览器不支持SSE~')
      }
    },
    getCurrentTime() {
      var _this = this
      const yy = new Date().getFullYear()
      const mm = new Date().getMonth() + 1
      const dd = new Date().getDate()
      const hh = new Date().getHours()
      const mf = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()
      const ss = new Date().getSeconds() < 10 ? '0' + new Date().getSeconds() : new Date().getSeconds()
      _this.gettime = '【' + yy + '-' + mm + '-' + dd + ' ' + hh + ':' + mf + ':' + ss + '】'
      return _this.gettime
    },
    // beforeDestroy() {
    //   this.closeSse()
    //   if (this.eventSource) {
    //     // 前端关闭Sse
    //     this.eventSource.close()
    //     // 通知后端关闭Sse
    //     this.closeSse()
    //   }
    // },
    closeSse() {
      // 退出登录或关闭浏览器
      console.log(this.getCurrentTime() + '步骤3：关闭SSE连接~userId:' + this.userId)
      var requestParam = {
        userId: this.userId
      }
      closeSse(requestParam).then(() => {
        this.eventSource = null
      })
    },
    // destroyed() {
    //   window.removeEventListener('beforeunload', this.closeSse())
    // },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
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
      this.dialogStatus = 'detail'
      this.dialogFormVisible = true
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
  }
}
</script>
