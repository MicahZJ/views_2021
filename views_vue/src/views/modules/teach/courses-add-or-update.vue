<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="课程名" prop="courseName">
        <el-input v-model="dataForm.courseName" placeholder="课程名字"></el-input>
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input v-model="dataForm.price" placeholder="价格"></el-input>
      </el-form-item>
      <el-form-item label="开始时间" prop="stime" :class="{ 'is-required': !dataForm.id }">
        <el-time-picker placeholder="选择时间" v-model="dataForm.stime" style="width: 100%;"></el-time-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="otime" :class="{ 'is-required': !dataForm.id }">
        <el-time-picker placeholder="选择时间" v-model="dataForm.otime" style="width: 100%;"></el-time-picker>
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
          courseName: '',
          stime: '',
          otime: ''
        },
        dataRule: {
          courseName: [
            { required: true, message: '课程名不能为空', trigger: 'blur' }
          ],
          price: [
            { required: true, message: '价格不能为空', trigger: 'blur' }
          ],
          stime: [
            { required: true, message: '开始时间不能为空', trigger: 'blur' }
          ],
          otime: [
            { required: true, message: '结束时间不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    props: [
      'getTeacherId'
    ],
    methods: {
      init (id, props) {
        console.log('props', id, props, this.getTeacherId)
        this.dataForm.id = id || 0
        this.visible = true
        this.dataForm.teacherId = this.getTeacherId
        if (this.dataForm.id) {
          this.dataForm.courseName = props.courseName
          this.dataForm.stime = ''
          this.dataForm.otime = ''
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
              url: this.$http.adornUrl(`/course/info/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'teacherId': this.dataForm.teacherId,
                'courseName': this.dataForm.courseName,
                'price': this.dataForm.price,
                'stime': that.$moment(this.dataForm.stime).format('HH:mm:ss'),
                'otime': that.$moment(this.dataForm.otime).format('HH:mm:ss')
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
