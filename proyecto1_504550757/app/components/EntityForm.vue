<script setup lang="ts">
type Option = { value: string | number; label: string }
type Field = {
  key: string
  label: string
  type?: 'text' | 'date' | 'number' | 'select' | 'textarea'
  options?: Option[]
}

defineProps<{ fields: Field[] }>()
const model = defineModel<Record<string, any>>({ required: true })
</script>

<template>
  <div v-for="f in fields" :key="f.key" :class="['field', f.type === 'textarea' ? 'field-full' : '']">
    <span>{{ f.label }}</span>
    <select v-if="f.type === 'select'" v-model="model[f.key]">
      <option value="" disabled>Selecciona...</option>
      <option v-for="o in f.options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
    <textarea v-else-if="f.type === 'textarea'" v-model="model[f.key]" />
    <input v-else :type="f.type || 'text'" v-model="model[f.key]" />
  </div>
</template>
