<template>
  <div class="mod-user">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.courseName" placeholder="课程名字" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('course:info:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('course:info:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;">
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50">
      </el-table-column>
      <el-table-column
        prop="id"
        header-align="center"
        align="center"
        width="80"
        label="ID">
      </el-table-column>
      <el-table-column
        prop="courseName"
        header-align="center"
        align="center"
        label="课程">
      </el-table-column>
      <el-table-column
        prop="price"
        header-align="center"
        align="center"
        label="价格">
      </el-table-column>
<!--      <el-table-column-->
<!--        prop="status"-->
<!--        header-align="center"-->
<!--        align="center"-->
<!--        label="状态">-->
<!--        <template slot-scope="scope">-->
<!--          <el-tag v-if="scope.row.status === 0" size="small" type="danger">禁用</el-tag>-->
<!--          <el-tag v-else size="small">正常</el-tag>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column
        prop="sTimeNew"
        header-align="center"
        align="center"
        width="200"
        label="开始时间">
      </el-table-column>
      <el-table-column
        prop="oTimeNew"
        header-align="center"
        align="center"
        width="200"
        label="结束时间">
      </el-table-column>
      <el-table-column
        prop="createTimeNew"
        header-align="center"
        align="center"
        width="200"
        label="创建时间">
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('course:info:update')" type="text" size="small" @click="addOrUpdateHandle(scope.row.id, scope.row)">修改</el-button>
          <el-button v-if="isAuth('course:info:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
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
  import AddOrUpdate from './courses-add-or-update'

export default {
    data () {
      return {
        dataForm: {
          courseName: ''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        propsCourse: {}
      }
    },
    components: {
      AddOrUpdate
    },
    activated () {
      this.getDataList()
      // this.getUserList()
    },
    methods: {
      // 获取角色列表
      getUserList () {
        this.$http({
          url: this.$http.adornUrl('/sys/user/roleList'),
          method: 'get',
          params: this.$http.adornParams({
            'roleId': '2'
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.dataList = data.page.list
          } else {
            this.dataList = []
          }
        })
      },

      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        let that = this
        this.$http({
          url: this.$http.adornUrl(`/sys/user/info`),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          if (data && data.code === 0) {
            console.log('data', data)
            that.teacherId = data.user.userId
            that.$http({
              url: that.$http.adornUrl('/course/info/list'),
              method: 'get',
              params: that.$http.adornParams({
                'page': that.pageIndex,
                'limit': that.pageSize,
                'teacherId': data.user.userId,
                'courseName': that.dataForm.courseName
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                that.dataList = data.page.list.map((item) => {
                  item.createTimeNew = that.$moment(item.createTime).format('YYYY-MM-DD HH:mm')
                  item.sTimeNew = item.stime
                  item.oTimeNew = item.otime
                  return item
                })
                that.totalPage = data.page.totalCount
              } else {
                that.dataList = []
                that.totalPage = 0
              }
              that.dataListLoading = false
            })
          }
        })
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
      }
    }
  }
</script>
