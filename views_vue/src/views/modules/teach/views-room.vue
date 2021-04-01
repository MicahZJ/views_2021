<template>
  <div class="hello">
    <div class='agora-box'>
        <!-- 饿了么按钮-->
      <div class="agora-button">
          <!-- 饿了么行布局-->
        <el-row>
          <el-button type="primary" @click="joinEvent" :disabled='showJoin' style="width: 90px; margin: 10px">join</el-button>
          <el-button type="primary" @click='leaveEvent' plain :disabled='!showJoin' style="width: 90px; margin: 10px">leave</el-button>
        </el-row>
      </div>
    </div>
    <div class="agora-view">
      <div class="agora-video">
          <!-- 自定义控件-->
        <StreamPlayer :stream="localStream" :domId="localStream.getId()" v-if="localStream"></StreamPlayer>
      </div>
      <div class="agora-video" :key="index" v-for="(remoteStream, index) in remoteStreams">
        <StreamPlayer :stream="remoteStream" :domId="remoteStream.getId()"></StreamPlayer>
      </div>
    </div>
  </div>
</template>

<script>
import RTCClient from '../../../utils/agora-rtc-client'
import StreamPlayer from './stream-player'
import { log } from '../../../utils/utils'

export default {
  components: {
    StreamPlayer
  },
  data () {
    return {
      options: {
        appid: '',
        token: '',
        uid: null,
        channel: ''
      },
      showJoin: false,
      localStream: null,
      remoteStreams: [],
      appId: '',
      token: ''
    }
  },
  props: {
    msg: String
  },

  methods: {
    // 获取传参
    getParams () {
      let params = this.$route.params
      console.log('params', params)
      this.options.appid = params.appId
      this.options.token = params.token
      this.options.channel = params.name
      this.rtc = params.rtc
      this.joinEvent()
    },

    joinEvent () {
      if (!this.options.appid) {
        this.judge('Appid')
        return
      }
      if (!this.options.channel) {
        this.judge('Channel Name')
        return
      }
      this.rtc.joinChannel(this.options).then(() => {
        this.$message({
          message: 'Join Success',
          type: 'success'
        })
        this.rtc.publishStream().then(() => {
          this.$message({
            message: 'Publish Success',
            type: 'success'
          })
          this.localStream = this.rtc.localStream
        }).catch((err) => {
          this.$message.error('Publish Failure')
          log('publish local error', err)
        })
      }).catch((err) => {
        this.$message.error('Join Failure')
        log('join channel error', err)
      })
      this.showJoin = true
    },
    leaveEvent () {
      this.showJoin = false
      this.rtc.leaveChannel().then(() => {
        this.$message({
          message: 'Leave Success',
          type: 'success'
        })
      }).catch((err) => {
        this.$message.error('Leave Failure')
        log('leave error', err)
      })
      this.localStream = null
      this.remoteStreams = []
    },
    judge (detail) {
      this.$notify({
        title: 'Notice',
        message: `Please enter the ${detail}`,
        position: 'top-left',
        type: 'warning'
      })
    }
  },
  mounted () {
    this.getParams()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .agora-box {

  }
  .agora-title {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    font-size: 32px;
    font-weight: bold;
    text-align: center;
    color: #2c3e50;
  }
  .agora-view {
    display: flex;
  }
  .agora-video {
    width: 320px;
    height: 240px;
    margin: 20px;
  }
  .agora-input {
    margin: 20px;
  }
  .agora-text {
    margin: 5px;
    font-size: 16px;
    font-weight: bold;
  }
  .agora-button {
    margin-left: 10px;
  }
  .agora-video {
    width: 320px;
    height: 240px;
  }
  .text-agora {
    font-weight: bold;
  }
</style>
