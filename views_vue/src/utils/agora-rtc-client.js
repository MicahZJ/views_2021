import AgoraRTC from 'agora-rtc-sdk'
import EventEmitter from 'events'
import https from '@/utils/httpTool' // api: https://github.com/axios/axios

export default class RTCClient {
  constructor () {
        // 加入一个频道的基本参数
    this.option = {
      appId: '',
      channel: '',
      uid: '',
      token: ''
    }
    this.client = null
    this.localStream = null
    this._eventBus = new EventEmitter()
    this.$Https = https
  }

    // 初始化客户端并加入一个频道
  joinChannel (option) {
    return new Promise((resolve, reject) => {
      this.client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'})
      this.client.init(option.appid, () => {
        console.log('init success')
        this.clientListener()
        this.client.join(option.token ? option.token : null, option.channel, null, (uid) => {
          console.log('join channel: ' + this.option.channel + ' success, uid: ', uid)
          this.option = {
            appid: option.appid,
            token: option.token,
            channel: option.channel,
            uid: uid
          }
          resolve()
        }, (err) => {
          // debugger
          console.log('this', this)
          this.restart(option)
          console.error('client join failed', err)
        })
      }, (err) => {
        reject()
        console.error(err)
      })
      console.log('[agora-vue] appId', option.appid)
    })
  }

  async restart (option) {
    let api = '/live/info/updateToken'
    let requestData = {
      roomName: option.channel
    }

    let res = await this.$Https.axiosPost(api, requestData)
    if (res && res.code === 0) {
      // this.joinChannel(option)
    }
  }
    // 推流
  publishStream () {
    return new Promise((resolve, reject) => {
            // Create a local stream
      this.localStream = AgoraRTC.createStream({
        streamID: this.option.uid,
        audio: true,
        video: true,
        screen: false
      })
            // Initialize the local stream
      this.localStream.init(() => {
        console.log('init local stream success')
        resolve()
                // Publish the local stream
        this.client.publish(this.localStream, (err) => {
          console.log('publish failed')
          console.error(err)
        })
      }, (err) => {
        reject()
        console.error('init local stream failed ', err)
      })
    })
  }

    // 事件监听
  clientListener () {
    const client = this.client

    client.on('stream-added', (evt) => {
            // The stream is added to the channel but not locally subscribed
      this._eventBus.emit('stream-added', evt)
    })
    client.on('stream-subscribed', (evt) => {
      this._eventBus.emit('stream-subscribed', evt)
    })
    client.on('stream-removed', (evt) => {
      this._eventBus.emit('stream-removed', evt)
    })
    client.on('peer-online', (evt) => {
      this._eventBus.emit('peer-online', evt)
    })
    client.on('peer-leave', (evt) => {
      this._eventBus.emit('peer-leave', evt)
    })
  }

  on (eventName, callback) {
    this._eventBus.on(eventName, callback)
  }

    // 离开频道
  leaveChannel () {
    return new Promise((resolve, reject) => {
            // Leave the channel
      this.client.unpublish(this.localStream, (err) => {
        console.log(err)
      })
      this.client.leave(() => {
                // Stop playing the local stream
        if (this.localStream.isPlaying()) {
          this.localStream.stop()
        }
                // Close the local stream
        this.localStream.close()
        this.client = null
        resolve()
        console.log('client leaves channel success')
      }, (err) => {
        reject()
        console.log('channel leave failed')
        console.error(err)
      })
    })
  }
}
