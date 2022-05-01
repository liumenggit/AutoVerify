<template>
  <a-card hoverable style="width:auto">
    <template #cover>
      <qrcode-vue v-if="RechargeUrl" :size="200" :value="RechargeUrl" alt="example" level="H"/>
    </template>
    <a-card-meta title="选择充值金额">
      <template #description>
        <a-radio-group v-model:value="Amount" @change="GetRechargeUrl">
          <a-radio-button
            v-for="item in AmountList"
            :key="item"
            :disabled="item.amount == Amount"
            :value="item.amount"
          >
            {{ item.amount }} RMB
          </a-radio-button>
        </a-radio-group>
      </template>
    </a-card-meta>
  </a-card>
</template>

<script>
import QrcodeVue from 'qrcode.vue'

export default {
  name: 'recharge',
  components: {
    QrcodeVue
  },
  data () {
    return {
      RechargeUrl: '',
      Amount: null,
      AmountList: [
        {
          amount: 1,
          content: '充值1元'
        },
        {
          amount: 5,
          content: '充值5元'
        },
        {
          amount: 10,
          content: '充值10元'
        }
      ]
    }
  },
  inject: ['PayRecharge', 'SwitchDrawer'],
  methods: {
    GetRechargeUrl () {
      var that = this
      this.PayRecharge(this.Amount, function (RechargeUrl) {
        that.RechargeUrl = RechargeUrl
      })
    }
  }
}
</script>

<style scoped>

</style>
