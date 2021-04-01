<template>
  <el-dialog
    :title="'支付'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="价格" prop="price">
        <el-input v-model="dataForm.price" placeholder="价格"></el-input>
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
          price: ''
        },
        dataRule: {
          price: [
            { required: true, message: '价格不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    props: [
      'getStu'
    ],
    methods: {
      init (id, props) {
        console.log('props', id, props)
        this.dataForm.id = id || 0
        this.visible = true
        if (this.dataForm.id) {
          this.dataForm.price = props.price
          this.dataForm.courseId = props.id
          this.dataForm.studentId = this.getStu
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
              // url: this.$http.adornUrl(`/course/student/${!this.dataForm.id ? 'save' : 'update'}`),
              url: this.$http.adornUrl(`/course/student/save`),
              method: 'post',
              data: this.$http.adornData({
                'studentId': this.dataForm.studentId,
                'courseId': this.dataForm.courseId,
                'price': this.dataForm.price,
                'grade': 0,
                'zf': 1
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
