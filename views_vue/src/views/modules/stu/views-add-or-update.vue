<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="名字">
        <el-input v-model="dataForm.viewsName" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item label="课程">
        <el-select v-model="dataForm.courseId" placeholder="请选择课程">
          <el-option v-for="(item, index) in courseList" :label="item.courseName" :value="item.id" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="介绍">
        <el-input type="textarea" v-model="dataForm.content" placeholder="介绍"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  // import { isEmail, isMobile } from '@/utils/validate'
  export default {
    data () {
      return {
        visible: false,
        roleList: [],
        dataForm: {
          id: 0,
          viewsName: '',
          courseId: '',
          content: ''
        },
        dataRule: {
          viewsName: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ],
          price: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ],
          content: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ]
        },
        courseList: []
      }
    },
    props: [
      'getTeacherId'
    ],
    methods: {
      // 获取课程列表
      async getList () {
        let requestData = {
          'page': 1,
          'limit': 10000,
          'teacherId': '',
          'courseName': ''
        }
        let qpi = '/course/info/list'

        let res = await this.$https.axiosGet(qpi, requestData)
        if (res && res.code === 0) {
          this.courseList = res.page.list
        }
      },

      // 新增或者修改
      init (id, props) {
        console.log('props', id, props, this.getTeacherId)
        this.dataForm.id = id || 0
        this.visible = true
        if (this.dataForm.id) {
          this.dataForm.courseId = props.courseId
          this.dataForm.content = props.content
          this.dataForm.viewsName = props.name
        } else {
          this.$nextTick(() => {
            this.$refs['dataForm'].resetFields()
            this.dataForm.courseId = ''
            this.dataForm.content = ''
            this.dataForm.viewsName = ''
          })
        }
      },

      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/live/info/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'courseId': this.dataForm.courseId,
                'name': this.dataForm.viewsName,
                'content': this.dataForm.content
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      }

      //
    },
    mounted () {
      this.getList()
    }
  }
</script>
