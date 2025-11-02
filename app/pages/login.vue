<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

import { loginSchema, type LoginSchemaType } from '#shared/zod/login.schema'

const toast = useToast()

const errorServer = ref(false)

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  required: true
}, {
  name: 'remember',
  label: 'Remember me',
  type: 'checkbox'
}]

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => {
    toast.add({ title: 'Google', description: 'Login with Google' })
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => {
    toast.add({ title: 'GitHub', description: 'Login with GitHub' })
  }
}]

async function onSubmit(payload: FormSubmitEvent<LoginSchemaType>) {
  try {
    // console.log('Submitted', payload)

    const response = await $fetch('/api/login', {
      method: 'POST',
      body: payload.data
      // body: {
      //   // email: payload.data.email,
      //   password: payload.data.password,
      // }
    });

    toast.add({ title: 'Success', description: 'You have logged in successfully!' })
    // Handle successful login (e.g., redirect, store token, etc.)
  } catch (error) {
    
    // Handle login error (e.g., show error message)
    if(error instanceof Error && "statusMessage" in error) {
      errorServer.value = true
      toast.add({ title: 'Error', description: error.statusMessage as string, color: 'error' })
      // console.error('Login error:', error.statusMessage as string);
    }
  }


}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm :schema="loginSchema" :fields="fields" :providers="providers" title="Welcome back!"
        icon="i-lucide-lock" @submit="onSubmit">
        <template #description>
          Don't have an account? <ULink to="#" class="text-primary font-medium">Sign up</ULink>.
        </template>
        <template #password-hint>
          <ULink to="#" class="text-primary font-medium" tabindex="-1">Forgot password?</ULink>
        </template>
        <template #validation>
          <UAlert v-if="errorServer" color="error" icon="i-lucide-info" title="Error signing in" />
        </template>
        <template #footer>
          By signing in, you agree to our <ULink to="#" class="text-primary font-medium">Terms of Service</ULink>.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
