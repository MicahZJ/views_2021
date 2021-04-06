<template>
  <el-dialog
    :title="'评论'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <div>
      <div @click="inputFocus" class="my-reply">
        <div class="reply-info" >
          <div
            tabindex="0"
            contenteditable="true"
            id="replyInput"
            spellcheck="false"
            placeholder="输入评论..."
            class="reply-input"
            @focus="showReplyBtn"
            @input="onDivInput($event)"
          >
          </div>
        </div>
        <div class="reply-btn-box" v-show="btnShow">
          <el-button class="reply-btn" size="medium" @click="dataFormSubmit" type="primary">发表评论</el-button>
        </div>
      </div>
      <div v-for="(item,i) in comments" :key="i" class="author-title reply-father">
        <div class="author-info">
          <span class="author-name">{{item.userName}}</span>
          <span class="author-time">{{item.createTimeNew}}</span>
        </div>
        <div class="talk-box">
          <p>
            <span class="reply">{{item.content}}</span>
          </p>
        </div>
      </div>
    </div>
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
        },
        activities: [],
        reverse: true,
        btnShow: false,
        index: '0',
        replyComment: '',
        myName: 'Lana Del Rey',
        myHeader: 'https://ae01.alicdn.com/kf/Hd60a3f7c06fd47ae85624badd32ce54dv.jpg',
        myId: 19870621,
        to: '',
        toId: -1,
        comments: []
      }
    },
    props: [
      'getStu'
    ],
    methods: {
      inputFocus () {
        var replyInput = document.getElementById('replyInput')
        replyInput.style.padding = '8px 8px'
        replyInput.style.border = '2px solid #17B3A3'
        replyInput.focus()
      },
      showReplyBtn () {
        this.btnShow = true
      },

      showReplyInput (i, name, id) {
        this.comments[this.index].inputShow = false
        this.index = i
        this.comments[i].inputShow = true
        this.to = name
        this.toId = id
      },
      _inputShow (i) {
        return this.comments[i].inputShow
      },
      sendComment () {
        if (!this.replyComment) {
          this.$message({
            showClose: true,
            type: 'warning',
            message: '评论不能为空'
          })
        } else {
        }
      },

      onDivInput: function (e) {
        this.replyComment = e.target.innerHTML
      },

      dateStr (date) {
        // 获取js 时间戳
        var time = new Date().getTime()
      // 去掉 js 时间戳后三位，与php 时间戳保持一致
        time = parseInt((time - date) / 1000)
      // 存储转换值
        var s
        if (time < 60 * 10) { // 十分钟内
          return '刚刚'
        } else if ((time < 60 * 60) && (time >= 60 * 10)) {
          // 超过十分钟少于1小时
          s = Math.floor(time / 60)
          return s + '分钟前'
        } else if ((time < 60 * 60 * 24) && (time >= 60 * 60)) {
          // 超过1小时少于24小时
          s = Math.floor(time / 60 / 60)
          return s + '小时前'
        } else if ((time < 60 * 60 * 24 * 30) && (time >= 60 * 60 * 24)) {
          // 超过1天少于30天内
          s = Math.floor(time / 60 / 60 / 24)
          return s + '天前'
        } else {
          // 超过30天ddd
          var date = new Date(parseInt(date))
          return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate()
        }
      },

      // 获取数据
      async init (id, props) {
        console.log('props', id, props)
        this.visible = true
        this.studentId = id
        this.courseId = props.id
        let api = '/course/comment/list'
        let requestData = {
          courseId: props.id
        }

        let res = await this.$https.axiosGet(api, requestData)
        if (res && res.code === 0) {
          this.comments = res.data.map((item) => {
            item.createTimeNew = this.$moment(item.createTime).format('YYYY-MM-DD HH:mm')
            return item
          })
        }
      },

      // 表单提交
      dataFormSubmit () {
        let that = this
        this.$http({
            // url: this.$http.adornUrl(`/course/student/${!this.dataForm.id ? 'save' : 'update'}`),
          url: this.$http.adornUrl(`/course/comment/save`),
          method: 'post',
          data: this.$http.adornData({
            'userId': this.studentId,
            'courseId': this.courseId,
            'parentId': 0,
            'content': this.replyComment
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
                this.replyComment = ''
                this.$emit('refreshDataList')
              }
            })
          } else {
            this.$message.error(data.msg)
          }
        })
      }
    }
  }
</script>
<style scoped lang="stylus">
  .my-reply
    padding 10px
    background-color #fafbfc
    .header-img
      display inline-block
      vertical-align top
    .reply-info
      display inline-block
      margin-left 5px
      width 90%
      @media screen and (max-width:1200px)
        width 80%
      .reply-input
        min-height 20px
        line-height 22px
        padding 10px 10px
        color #ccc
        background-color #fff
        border-radius 5px
        &:empty:before
          content attr(placeholder)
        &:focus:before
          content none
        &:focus
          padding 8px 8px
          /*border 2px solid blue*/
          box-shadow none
          outline none
    .reply-btn-box
      height 25px
      margin 10px 0
      .reply-btn
        position relative
        float right
        margin-right 15px
  .my-comment-reply
    margin-left 50px
    .reply-input
      width flex
  .author-title:not(:last-child)
    border-bottom: 1px solid rgba(178,186,194,.3)
  .author-title
    padding 10px
    .header-img
      display inline-block
      vertical-align top
    .author-info
      display inline-block
      margin-left 5px
      width 60%
      height 40px
      line-height 20px
      >span
        display block
        cursor pointer
        overflow hidden
        white-space nowrap
        text-overflow ellipsis
      .author-name
        color #000
        font-size 18px
        font-weight bold
      .author-time
        font-size 14px
    .icon-btn
      width 30%
      padding 0 !important
      float right
      @media screen and (max-width : 1200px)
        width 20%
        padding 7px
      >span
        cursor pointer
      .iconfont
        margin 0 5px
    .talk-box
      margin 0 50px
      >p
        margin 0
      .reply
        font-size 16px
        color #000
    .reply-box
      margin 10px 0 0 50px
      background-color #efefef
</style>
