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
        style="width: 100px; height: 50px;margin-left: 5px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button v-waves class="filter-item" style="margin-left: 5px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <span style="color: green">{{ listQuery.message }}</span>
    </div>

    <el-table
      :key="tableKey"
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
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" :disabled="true" @click="handleDelete(row,$index)">
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

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" style="width: 900px">

      <el-table
        :key="tableKey"
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
import { editOrderInfo, deleteOrderInfo, findOrderList } from '@/api/seller/order'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { EventSourcePolyfill } from 'event-source-polyfill' // npm install --save event-source-polyfill
import store from '@/store'

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
      listQuery: {
        page: 1,
        limit: 20
      },
      temp: {
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        detail: '商品详情'
      },
      // 创建sse
      eventSource: null,
      // 模拟登录用户 1681443270209
      userId: store.getters.userId
    }
  },
  created() {
    this.getList()
    // created:在模板渲染成html前调用， mounted:在模板渲染成html后调用
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
      var status = this.listQuery.status
      var statusList = []
      // 添加文字，以文字筛选；未添加为true
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
        if (response.data != null) {
          this.list = response.data.list
          this.total = response.data.total
        }
        setTimeout(() => {
        }, 1.5 * 1000)
      })
    },
    createSse() {
      if (window.EventSource) {
        // 浏览器控制台：TypeError: NetworkError when attempting to fetch resource.
        // 浏览器网络：  ns_binding_aborted
        // 原因：是因为fetch中异步提交方式,在请求该链接的时候第一次请求还没有执行完毕，如果又发生了第二次请求的话，
        //     第一个请求就会中断，从而返回NS_BINDING_ABORTED。
        // this.userId = store.getters.userId
        const url = process.env.VUE_APP_BASE_URL + '/sse/connect?userId=' + this.userId
        // this.eventSource = new EventSourcePolyfill(url)
        this.eventSource = new EventSourcePolyfill(url)
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
    handleFilter() {
      this.getList()
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
          message: '删除订单成功',
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
          message: status === 'TO_ARRIVE' ? '已接单待配送' : status === 'FINISHED' ? '已完成' : '非预期操作',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>
