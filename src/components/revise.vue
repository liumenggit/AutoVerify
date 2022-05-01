<template>
  <a-form
    ref="formRef"
    :model="formState"
    :rules="rules"
    @finish="handleFinish"
    @finishFailed="handleFinishFailed"
  >
    <a-form-item ref="new_password1" label="新密码" name="new_password1">
      <a-input
        v-model:value="formState.new_password1"
        type="password"
      >
      </a-input>
    </a-form-item>
    <a-form-item ref="new_password2" label="新密码确认" name="new_password2">
      <a-input
        v-model:value="formState.new_password2"
        type="password"
      >
      </a-input>
    </a-form-item>
    <a-form-item>
      <a-button
        :disabled="formState.new_password1 === '' || formState.new_password1 === ''"
        block
        html-type="submit"
        type="primary"
        @click="onSubmit"
      >
        修改
      </a-button>
      <a-button type="link" @click="SwitchDrawer('loginui')">登录</a-button>
    </a-form-item>
  </a-form>
</template>
<script>

import { validatePsdReg } from '../popup/validate'

export default {
  name: 'revise',
  data () {
    return {
      formState: {
        new_password1: '',
        new_password2: ''
      },
      rules: {
        new_password1: [
          {
            validator: validatePsdReg,
            trigger: 'blur'
          }
        ],
        new_password2: [
          {
            validator: validatePsdReg,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  inject: ['Revies', 'SwitchDrawer'],
  methods: {
    onSubmit () {
    },
    handleFinish (value) {
      this.Revies(value)
      // this.Register(value)
    }
  }
}
</script>
