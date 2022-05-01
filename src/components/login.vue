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
      </a-input>
    </a-form-item>
    <a-form-item ref="password" label="密码" name="password">
      <a-input
        v-model:value="formState.password"
        type="password"
      >
      </a-input>
    </a-form-item>
    <a-form-item>
      <a-button
        :disabled="formState.email === '' || formState.password === ''"
        block
        html-type="submit"
        type="primary"
      >
        登录
      </a-button>
      <a-button type="link" @click="SwitchDrawer('registerui')">去注册</a-button>
      <a-button type="link" @click="SwitchDrawer('resetpassui')">忘记密码</a-button>
    </a-form-item>
  </a-form>
</template>
<script>
import { validateEMail, validatePsdReg } from '../popup/validate'

export default {
  name: 'login',
  data () {
    return {
      formState: {
        email: '',
        password: ''
      },
      rules: {
        password: [
          {
            validator: validatePsdReg,
            trigger: 'blur'
          }
        ],
        email: [
          {
            validator: validateEMail,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  inject: ['Login', 'SwitchDrawer'],
  methods: {
    onSubmit () {
    },
    handleFinish (value) {
      this.Login(value)
    }
  }
}
</script>
