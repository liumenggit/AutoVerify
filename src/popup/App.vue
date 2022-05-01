<template>
  <div class="divcontent">
    <a-card style="width: 100vw" title="自动输入验证码">
      <template #extra>
        <a-button
          v-if="Object.keys(userinfo).length !== 0"
          size="small" type="link"
          @click="SwitchDrawer('reviseui')">修改密码
        </a-button>
        <a-button
          v-if="Object.keys(userinfo).length !== 0"
          size="small" type="link" @click="LogOut">退出
        </a-button>
        <a-button v-if="Object.keys(userinfo).length !== 0" size="small" type="link" @click="drawer = 'rechargeui'">充值
        </a-button>
        <a-button v-if="Object.keys(userinfo).length === 0" size="small" type="link" @click="drawer = 'loginui'">登录
        </a-button>
        <a-button
          v-if="Object.keys(userinfo).length === 0"
          size="small" type="link"
          @click="drawer = 'registerui'"
        >注册
        </a-button>
        <a-button
          v-if="Object.keys(userinfo).length === 0"
          size="small" type="link"
          @click="drawer = 'resetpassui'"
        >重置密码
        </a-button>
      </template>

      <a-card-meta :description="Object.keys(userinfo).length === 0 ? '请登录': '余额:' + userinfo.balance_fee"
                   :title="userinfo.email">
        <template #avatar>
          <a-progress

            :percent="99"
            :width="60"
            type="circle"
          />
        </template>
      </a-card-meta>

    </a-card>

    <a-tabs size="small" type="card">
      <a-tab-pane key="1" tab="本地规则">
        <a-table
          :columns="LocalRuleColumns"
          :dataSource="LocalRuleDataSource"
          :scroll="{ y: '52vh' }"
          rowKey="idcard"
          size="small"
        >
          <!--域名-->
          <template #url="{ text }">
            <a :href="text" target="view_window">{{ text.replace(/^https?:\/\//, '') }}</a>
          </template>
          <!--操作-->
          <template #operation="{ text, record }">
            <a-select
              v-model:value="record.status"
              size="small"
              @change="SetAutoMatic"
              @click="CurrentLine = record"
            >
              <a-select-option :value="true">自动</a-select-option>
              <a-select-option :value="false">手动</a-select-option>
              <a-select-option :value="null">全局</a-select-option>
            </a-select>
          </template>
          <!--黑名单-->
          <template #backlist="{ text, record }">
            <a-switch
              v-model:checked="record.back"
              :disabled="!record.img.length"
              size="small"
              @change="CurrentLine = record"
              @click="SetBackList"
            />
          </template>
          <template #delete="{ text, record }">
            <a-popconfirm
              v-if="LocalRuleDataSource.length"
              cancel-text="No" ok-text="Yes"
              placement="leftBottom"
              title="确定删除？"
              @confirm="DeleteLocaRule(record.idcard)"
            >
              <DeleteOutlined/>
            </a-popconfirm>
          </template>

          <template #expandedRowRender="{ record }">
            <a-descriptions size="small">
              <a-descriptions-item
                v-for="(item ,key) in record"
                :key="key"
                :label="key"
              >
                {{ item }}
              </a-descriptions-item>
            </a-descriptions>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="2" tab="历史数据">
        <a-table
          :columns="OcrColumns"
          :dataSource="OcrDataSource"
          :pagination="OcrPagination"
          :scroll="{ y: '52vh' }"
          rowKey="order_id"
          size="small"
          @change="GetOcrHistory"
        >
          <template #img="{ text }">
            <img :src="'data:image/png;base64,' + text"/>
          </template>
        </a-table>

      </a-tab-pane>
      <a-tab-pane key="3" tab="设置">
        <a-form
          :colon="true"
          :model="SetInfo"
          :style="{padding:'20px'}"
          :wrapper-col="{ span: 14 }"
          layout="horizontal"
          size="small"
          style="overflow-y: scroll;height: 70vh;"
        >
          <a-form-item colon label="插件开关">
            <a-switch v-model:checked="SetInfo.Run" size="small"/>
          </a-form-item>
          <a-form-item colon label="全局自动输入">
            <a-switch v-model:checked="SetInfo.GlobalAutoSwitch" size="small"/>
          </a-form-item>

          <a-form-item label="识别类型">
            <a-checkbox-group v-model:value="SetInfo.OcrType">
              <a-checkbox disabled name="type" value="img">图片</a-checkbox>
              <!--              <a-checkbox name="type" value="slider">滑块</a-checkbox>-->
            </a-checkbox-group>
          </a-form-item>
          <!--排除域名-->
          <a-form-item label="排除域名">
            <a-select
              v-model:value="SetInfo.ExcludeUrl"
              :defaultOpen="false"
              :open="false"
              :token-separators="[',']"
              mode="tags"
              placeholder="Automatic tokenization"
              style="width: 100%"
            ></a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <!--              <a-button danger size="small" type="dashed" @click="ClearLocalSet">清除本地设置</a-button>-->
              <a-button danger size="small" type="dashed" @click="ClearLocalRule">清除本地规则</a-button>
              <!--              <a-button size="small" type="primary" @click="GetLocalRule">打印本地规则</a-button>-->
            </a-space>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="4" tab="关于">
        <a-space :style="{padding:'20px'}" direction="vertical">
          <a-typography>
            <a-typography-title :level="5">{{ GetI18n('IntroductionTitle') }}</a-typography-title>
            <a-typography-paragraph
              :content="GetI18n('Introduction')"
            />
            <a-typography-paragraph
              :content="GetI18n('CreateRulesManually')"
            />
            <a-typography-title :level="5">{{ GetI18n('TollTitle') }}</a-typography-title>
            <a-typography-paragraph
              :content="GetI18n('AboutFees')"
              AboutFees
            />
            <a-typography-title :level="5">{{ GetI18n('UrlTitle') }}</a-typography-title>
            <a-typography-link
              href="https://greasyfork.org/zh-CN/scripts/397139-%E4%B8%87%E8%83%BD%E9%AA%8C%E8%AF%81%E7%A0%81%E8%87%AA%E5%8A%A8%E8%BE%93%E5%85%A5"
              target="_blank">
              {{ GetI18n('EarlierVersion') }}
            </a-typography-link>
            <a-typography-link href="www.google.com" target="_blank">
              {{ GetI18n('SupportSite') }}
            </a-typography-link>
            <a-typography-link href="www.google.com" target="_blank">
              {{ GetI18n('DevelopmentCooperation') }}
            </a-typography-link>
          </a-typography>
        </a-space>
      </a-tab-pane>
    </a-tabs>
    <!--登录-->
    <a-drawer
      :visible="loginui"
      placement="right"
      title="登录"
      width="100vw"
      @close="drawer = ''"
    >
      <template #extra><a href="#">more</a></template>
      <login/>
    </a-drawer>
    <!--    注册-->
    <a-drawer
      :visible="registerui"
      placement="right"
      title="注册"
      width="100vw"
      @close="drawer = ''"
    >
      <register/>
    </a-drawer>
    <!--    充值-->
    <a-drawer
      :visible="rechargeui"
      placement="right"
      title="充值"
      width="100vw"
      @close="drawer = ''"
    >
      <recharge/>
    </a-drawer>
    <!--    修改密码-->
    <a-drawer
      :visible="reviseui"
      placement="right"
      title="更改密码"
      width="100vw"
      @close="drawer = ''"
    >
      <revise/>
    </a-drawer>
    <!--重置密码-->
    <a-drawer
      :visible="resetpassui"
      placement="right"
      title="重置密码"
      width="100vw"
      @close="drawer = ''"
    >
      <resetpass/>
    </a-drawer>
  </div>
</template>

<script>
import login from '@/components/login'
import register from '@/components/register'
import recharge from '@/components/recharge'
import revise from '@/components/revise'
import resetpass from '@/components/resetpass'
import { DeleteOutlined } from '@ant-design/icons-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { message } from 'ant-design-vue'
import { defineComponent } from 'vue'
import axios from './axios'

export default defineComponent({
  name: 'App',
  components: {
    DeleteOutlined,
    register,
    login,
    recharge,
    revise,
    resetpass
  },
  provide () {
    return {
      locale: zhCN,
      Register: this.Register,
      Login: this.Login,
      GetUserInfo: this.GetUserInfo,
      PayRecharge: this.PayRecharge,
      Revies: this.Revies,
      SendEmail: this.SendEmail,
      SwitchDrawer: this.SwitchDrawer,
      ResetPass: this.ResetPass
    }
  },
  data: () => ({
    CurrentLine: {},
    LocalRuleDataSource: [],
    LocalRuleColumns: [
      {
        title: '域名',
        dataIndex: 'url',
        key: 'idcard',
        width: '40%',
        ellipsis: true,
        slots: { customRender: 'url' }
      },
      {
        title: '操作',
        dataIndex: 'idcard',
        key: 'idcard',
        width: '25%',
        slots: { customRender: 'operation' }
      },
      {
        title: '拉黑',
        dataIndex: 'idcard',
        key: 'idcard',
        width: '21%',
        slots: { customRender: 'backlist' },
        sorter: (a, b) => a.back - b.back
      },
      {
        dataIndex: 'idcard',
        width: '14%',
        key: 'idcard',
        slots: { customRender: 'delete' }
      }
    ],
    OcrDataSource: [],
    OcrColumns: [
      {
        title: '图片',
        dataIndex: 'ask_record.image',
        key: 'ask_record.image',
        width: '40%',
        slots: { customRender: 'img' }
      },
      {
        title: '消费',
        key: 'order_id',
        dataIndex: 'total_fee'
      },
      {
        title: '结果',
        key: 'order_id',
        dataIndex: 'back_record.result.code'
      }
    ],
    OcrPagination: {
      total: 200,
      current: 1,
      pageSize: 10
    },
    drawer: '',
    userinfo: {},
    SetInfo: {
      Run: true,
      GlobalAutoSwitch: true,
      OcrType: ['img', 'slider'],
      ExcludeUrl: ['www.google.com']
    }
  }),
  methods: {
    // 注册
    Register (RegisterForm) {
      axios.post('http://py.wan7.cc/user/register/', RegisterForm)
        .then(function (response) {
          alert(response.status)
          alert(JSON.stringify(response.data))
          message.info('请查看邮件激活账户', JSON.stringify(response))
        })
        .catch(function (error) {
          message.warn('失败', JSON.stringify(error))
        })
    },
    // 登录
    Login (LoginForm) {
      this.ClearUserInfo()
      var that = this
      axios.post('http://py.wan7.cc/user/login/', LoginForm).then(function (response) {
        // alert('登录成功' + JSON.stringify(response.data))
        if (response.data.non_field_errors) {
          message.warn(response.data.non_field_errors)
          return
        }
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('refresh_token', response.data.refresh_token)
        that.GetUserInfo()
        that.SwitchDrawer()
        message.success('登录成功')
      }).catch(function (error) {
        message.error('登录失败')
      })
    },
    // 获取用户信息
    GetUserInfo () {
      var that = this
      axios.get('http://py.wan7.cc/user/user/', {}).then(function (response) {
        // alert('个人信息' + JSON.stringify(response))
        if (response.status === 401) {
          that.SwitchDrawer('loginui')
          return
        }
        that.userinfo = response.data
        that.GetOcrHistory(1)
        that.GetLocalRule()
      }).catch(function (error) {
        message.error('获取用户信息失败')
      })
    },
    // 清除用户信息
    ClearUserInfo () {
      this.userinfo = {}
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      chrome.cookies.remove({
        url: 'http://py.wan7.cc',
        name: 'csrftoken'
      })
      chrome.cookies.remove({
        url: 'http://py.wan7.cc',
        name: 'my-app-auth'
      })
    },
    // 退出
    LogOut () {
      this.ClearUserInfo()
      message.success('已退出')
    },
    // 充值
    PayRecharge (amounts, callback) {
      axios.post('http://py.wan7.cc/pay/recharge/', {
        amounts: amounts
      }, {}).then(function (response) {
        // alert(JSON.stringify(response.data))
        message.success('请使用微信扫码支付')
        callback(response.data.code_url)
      }).catch(function (error) {
        message.error('获取充值失败' + JSON.stringify(error))
      })
    },
    // 修改密码
    Revies (ReviesForm) {
      var that = this
      axios.post('http://py.wan7.cc/user/password/change/', ReviesForm)
        .then(function (response) {
          message.success('修改成功')
          that.ClearUserInfo()
          that.SwitchDrawer('loginui')
        })
        .catch(function (error) {
          message.warn('修改失败')
        })
    },
    // 找回密码
    SendEmail (email) {
      axios.post('http://py.wan7.cc/user/password/reset/', { email: email })
        .then(function (response) {
          alert(JSON.stringify(response.data))
          message.success('邮件发送成功' + JSON.stringify(response))
        })
        .catch(function (error) {
          alert(JSON.stringify(error))
          message.warn('邮件发送失败')
        })
    },
    // 邮箱修改密码
    ResetPass (ResetPassForm) {
      axios.post('http://py.wan7.cc/user/password/reset/confirm/' + ResetPassForm.uid + '/' + ResetPassForm.token + '/', ResetPassForm)
        .then(function (response) {
          message.success('密码修改成功')
        })
        .catch(function (error) {
          message.warn('密码修改失败')
        })
    },
    // 开关抽屉
    SwitchDrawer (DrawerName = null) {
      this.drawer = DrawerName
    },
    // 获取识别历史
    GetOcrHistory (pagination) {
      var that = this
      axios.get('http://py.wan7.cc/api/ocr/1/', { params: { page: pagination.current } }).then(function (response) {
        // alert('历史信息' + JSON.stringify(response.data.results))
        that.OcrPagination.total = response.data.count
        that.OcrPagination.current = pagination.current
        that.OcrDataSource = response.data.results
      }).catch(function (error) {
        message.warn('历史拉取失败' + JSON.stringify(error))
      })
    },
    // 清除本地规则
    ClearLocalRule () {
      chrome.storage.local.clear()
      this.LocalRuleDataSource = []
      message.success('清除成功')
    },
    // 删除本地规则
    DeleteLocaRule (idcard) {
      chrome.storage.local.remove([idcard])
      this.GetLocalRule()
      message.success('删除成功')
    },
    // 获取本地规则
    GetLocalRule () {
      var that = this
      // chrome.storage.local.get(null,function (value){
      //   console.log(value)
      // })
      chrome.storage.local.get(null, (obj) => {
        const arr = []
        Object.keys(obj).forEach(v => {
          arr.push(obj[v])
        })
        console.log(arr)
        that.LocalRuleDataSource = arr
        // that.LocalRule = obj
      })
    },
    // 设置黑名单
    SetBackList (back) {
      this.CurrentLine.back = back
      chrome.storage.local.set({ [this.CurrentLine.idcard]: this.CurrentLine }, function () {
      })
    },
    // 设置规则的运行方式 手动 自动 全局
    SetAutoMatic (value) {
      this.CurrentLine.status = value
      chrome.storage.local.set({ [this.CurrentLine.idcard]: this.CurrentLine }, function () {
      })
    },
    GetI18n (content) {
      return chrome.i18n.getMessage(content)
    }
  },
  computed: {
    registerui () {
      return (this.drawer === 'registerui')
    },
    loginui () {
      return (this.drawer === 'loginui')
    },
    rechargeui () {
      return (this.drawer === 'rechargeui')
    },
    reviseui () {
      return (this.drawer === 'reviseui')
    },
    resetpassui () {
      return (this.drawer === 'resetpassui')
    }
  },
  created () {
  },
  mounted () {
    // 创建后运行
    if (localStorage.getItem('setinfo') === null) {
      localStorage.setItem('setinfo', JSON.stringify(this.SetInfo))
    } else {
      this.SetInfo = JSON.parse(localStorage.getItem('setinfo'))
    }
    this.$nextTick(() => {
      this.GetUserInfo()
    })
  },
  watch: {
    SetInfo: {
      handler: function (val) {
        localStorage.setItem('setinfo', JSON.stringify(val))
      },
      deep: true
    }
  }
})
</script>

<style>
</style>
