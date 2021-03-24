<template>
  <div class="mod-user">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.liveName" placeholder="名字" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('live:info:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <!--        <el-button v-if="isAuth('live:info:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>-->
      </el-form-item>
    </el-form>
    <el-row class="box">
      <el-col class="box-content" :span="4" v-for="(item, index) in viewsList" :key="item.id">
        <el-card shadow="hover" :body-style="{ padding: '10px' }">
          <img src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png" class="image">
          <div style="padding: 14px;">
            <span>{{item.name}}</span>
            <div class="bottom clearfix">
              <el-button type="text" class="button" @click="jumpToViews(item)">加入</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList" :getTeacherId="teacherId"></add-or-update>
  </div>
</template>

<script>
  import AddOrUpdate from './views-add-or-update'
  import RTCClient from '../../../utils/agora-rtc-client'
import { log } from '../../../utils/utils'

export default {
    data () {
      return {
        dataForm: {
          liveName: ''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        propsCourse: {},
        currentDate: new Date(),
        viewsList: [],
        teacherId: '',
        rtc: ''
      }
    },
    components: {
      AddOrUpdate
    },
    activated () {
      this.getDataList()
    },
    methods: {

      // 获取数据列表
      async getDataList () {
        let api = '/live/info/list'
        let requestData = {}

        let res = await this.$https.axiosGet(api, requestData)
        if (res && res.code === 0) {
          this.viewsList = res.date.map((item) => {
            return item
          })
        }
      },

      // 每页数
      sizeChangeHandle (val) {
        this.pageSize = val
        this.pageIndex = 1
        this.getDataList()
      },
      // 当前页
      currentChangeHandle (val) {
        this.pageIndex = val
        this.getDataList()
      },
      // 多选
      selectionChangeHandle (val) {
        this.dataListSelections = val
      },
      // 新增 / 修改
      addOrUpdateHandle (id, props) {
        this.addOrUpdateVisible = true
        this.$nextTick(() => {
          this.$refs.addOrUpdate.init(id, props)
        })
      },
      // 删除
      deleteHandle (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/course/info/delete'),
            method: 'post',
            data: this.$http.adornData(ids, false)
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.getDataList()
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        }).catch(() => {})
      },

      jumpToViews (item) {
        let that = this
        this.$router.push({
          name: 'views-room',
          params: { appId: item.appId, token: item.token, name: item.name, rtc: that.rtc }
        })
      }
    },
    created () {
      this.rtc = new RTCClient()
      let rtc = this.rtc

      rtc.on('stream-added', (evt) => {
        let {stream} = evt
        log('[agora] [stream-added] stream-added', stream.getId())
        rtc.client.subscribe(stream)
      })

      rtc.on('stream-subscribed', (evt) => {
        let {stream} = evt
        log('[agora] [stream-subscribed] stream-added', stream.getId())
        if (!this.remoteStreams.find((it) => it.getId() === stream.getId())) {
          this.remoteStreams.push(stream)
        }
      })

      rtc.on('stream-removed', (evt) => {
        let {stream} = evt
        log('[agora] [stream-removed] stream-removed', stream.getId())
        this.remoteStreams = this.remoteStreams.filter((it) => it.getId() !== stream.getId())
      })
    }
  }
</script>
<style scoped>
  .time {
    font-size: 13px;
    color: #999;
  }
  .box {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    padding: 0 8px 0;
    box-sizing: border-box;
    overflow: hidden;
  }
  .box .box-content {
    margin-left: 10px;
  }
  .bottom {
    margin-top: 13px;
    line-height: 12px;
  }

  .button {
    padding: 0;
    float: right;
  }

  .image {
    width: 100%;
    display: block;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }
</style>
