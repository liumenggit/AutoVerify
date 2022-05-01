<template>
  <a-form
    ref="formRef"
    :model="formState"
    :rules="rules"
    @finish="handleFinish"
    @finishFailed="handleFinishFailed"
  >
    <a-form-item ref="username" label="用户名" name="username">
      <a-input
        v-model:value="formState.username"
      >
      </a-input>
    </a-form-item>
    <a-form-item ref="password1" label="密码" name="password1">
      <a-input
        v-model:value="formState.password1"
        type="password"
      >
      </a-input>
    </a-form-item>
    <a-form-item ref="password2" label="密码" name="password2">
      <a-input
        v-model:value="formState.password2"
        type="password"
      >
      </a-input>
    </a-form-item>
    <a-form-item ref="email" label="邮箱" name="email">
      <a-input
        v-model:value="formState.email"
        type="email"
      >
      </a-input>
    </a-form-item>
    <a-form-item>
      <a-button
        :disabled="formState.username === '' || formState.password1 === '' || formState.password2 === '' || formState.email === ''"
        block
        html-type="submit"
        type="primary"
      >
        注册
      </a-button>
      <a-button type="link" @click="SwitchDrawer('loginui')">登录</a-button>
    </a-form-item>
  </a-form>
</template>
<script>
import { validateCode, validateEMail, validatePsdReg } from '../popup/validate'

export default {
  name: 'register',
  data () {
    return {
      formState: {
        username: '',
        password1: '',
        password2: '',
        email: ''
      },
      rules: {
        username: [
          {
            validator: validateCode,
            trigger: 'blur'
          }
        ],
        password1: [
          {
            validator: validatePsdReg,
            trigger: 'blur'
          }
        ],
        password2: [
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
  inject: ['Register', 'SwitchDrawer'],
  methods: {
    onSubmit () {
    },
    handleFinish (value) {
      this.Register(value)
    }
  }
}
</script>
