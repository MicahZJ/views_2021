<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="课程ID" prop="courseId">
        <el-input disabled v-model="dataForm.courseId" placeholder="课程名字"></el-input>
      </el-form-item>
      <el-form-item label="学生ID" prop="studentId">
        <el-input disabled v-model="dataForm.studentId" placeholder="价格"></el-input>
      </el-form-item>
      <el-form-item label="成绩" prop="grade">
        <el-input v-model="dataForm.grade" placeholder="价格"></el-input>
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
          courseId: 0,
          studentId: '',
          grade: '',
          zf: ''
        },
        dataRule: {
          courseId: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ],
          studentId: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ],
          grade: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ],
          zf: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    props: [
      'getTeacherId'
    ],
    methods: {
      init (id, props) {
        console.log('props', id, props)
        this.dataForm.id = id || 0
        this.visible = true
        if (this.dataForm.id) {
          this.dataForm.courseId = props.courseId
          this.dataForm.studentId = props.studentId
          this.dataForm.grade = props.grade
        } else {
          this.$nextTick(() => {
            this.$refs['dataForm'].resetFields()
          })
        }
      },

      // 表单提交
      dataFormSubmit () {
        let that = this
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/course/student/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'grade': this.dataForm.grade
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
    }
  }
</script>
