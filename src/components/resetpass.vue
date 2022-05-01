<template>
  <a-form
    ref="formRef"
    :model="formState"
    :rules="rules"
    @finish="handleFinish"
    @finishFailed="handleFinishFailed"
  >
    <a-form-item ref="email" label="邮箱" name="email">
      <a-input
        v-model:value="formState.email"
        type="email"
      >
        <template #addonAfter>
          <a-button :disabled="formState.email === ''" size="small" type="link" @click="SendEmail(email)">发送</a-button>
        </template>
      </a-input>

    </a-form-item>
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

    <a-form-item ref="uid" label="UID" name="uid">
      <a-input
        v-model:value="formState.uid"
        type="numberNew"
      >
      </a-input>
    </a-form-item>

    <a-form-item ref="token" label="TOKEN" name="token">
      <a-input
        v-model:value="formState.token"
        type="text"
      >
      </a-input>
    </a-form-item>

    <a-form-item>
      <a-button
        :disabled="formState.new_password1 === '' || formState.new_password2 === '' || formState.uid === '' || formState.token === '' || email === ''"
        block
        html-type="submit"
        type="primary"
        @click="onSubmit"
      >
        修改
      </a-button>
    </a-form-item>
  </a-form>
</template>
<script>

import { validateToken, validateEMail, validatePsdReg, isInteger } from '../popup/validate'

export default {
  name: 'resetpass',
  data () {
    return {
      formState: {
        new_password1: '',
        new_password2: '',
        uid: '',
        token: ''
      },
      rules: {
        email: [
          {
            validator: validateEMail,
            trigger: 'blur'
          }
        ],
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
        ],
        uid: [
          {
            validator: isInteger,
            trigger: 'blur'
          }
        ],
        token: [
          {
            validator: validateToken,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  inject: ['ResetPass', 'SwitchDrawer', 'SendEmail'],
  methods: {
    onSubmit () {
    },
    handleFinish (value) {
      this.ResetPass(value)
    }
  }
}
</script>
