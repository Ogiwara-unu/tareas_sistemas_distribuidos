<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, resolveComponent } from 'vue'

export type StackItem = {
  id: string | number
  title: string
  subtitle?: string
  imageUrl?: string
  to?: string
  fallbackIcon?: string
  badge?: string
  badgeClass?: string
}

const props = withDefaults(
  defineProps<{
    items: StackItem[]
    maxVisible?: number
    autoAdvance?: boolean
    intervalMs?: number
    canDelete?: boolean
  }>(),
  {
    maxVisible: 5,
    autoAdvance: true,
    intervalMs: 3200,
    canDelete: true
  }
)

const emit = defineEmits<{
  delete: [id: string | number]
}>()

const NuxtLinkComp = resolveComponent('NuxtLink')

const active = ref(0)
const hovering = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const len = computed(() => props.items.length)
const maxOffset = computed(() => Math.floor(props.maxVisible / 2))
const stepDeg = computed(() => (maxOffset.value > 0 ? 40 / maxOffset.value : 0))

function wrap(n: number) {
  const l = len.value
  return l ? ((n % l) + l) % l : 0
}

function signedOffset(i: number) {
  const l = len.value
  const raw = i - active.value
  if (l <= 1) return raw
  const alt = raw > 0 ? raw - l : raw + l
  return Math.abs(alt) < Math.abs(raw) ? alt : raw
}

function goTo(i: number) {
  active.value = wrap(i)
}

function next() {
  goTo(active.value + 1)
}

function startAuto() {
  stopAuto()
  if (!props.autoAdvance || len.value < 2) return
  timer = setInterval(() => {
    if (!hovering.value) next()
  }, props.intervalMs)
}

function stopAuto() {
  if (timer) clearInterval(timer)
  timer = null
}

onMounted(startAuto)
onUnmounted(stopAuto)

function wrapStyle(i: number) {
  const off = signedOffset(i)
  const abs = Math.abs(off)
  const isActive = off === 0
  const visible = abs <= maxOffset.value
  const rotate = off * stepDeg.value
  const x = off * 46
  const y = isActive ? -16 : abs * 8
  const scale = isActive ? 1 : Math.max(0.8, 0.94 - (abs - 1) * 0.06)

  return {
    transform: `translate(-50%, -50%) translateX(${x}%) translateY(${y}px) rotate(${rotate}deg) scale(${scale})`,
    zIndex: String(100 - abs),
    opacity: visible ? '1' : '0',
    pointerEvents: visible ? ('auto' as const) : ('none' as const)
  }
}

function onDeleteClick(id: string | number) {
  emit('delete', id)
}
</script>

<template>
  <div v-if="items.length" class="stack" @mouseenter="hovering = true" @mouseleave="hovering = false">
    <div class="stack-stage">
      <div
        v-for="(item, i) in items"
        :key="item.id"
        class="stack-card-wrap"
        :class="{ 'stack-card-wrap-active': i === active }"
        :style="wrapStyle(i)"
      >
        <component
          :is="i === active ? NuxtLinkComp : 'div'"
          :to="i === active ? item.to : undefined"
          class="stack-card"
          :role="i === active ? undefined : 'button'"
          :tabindex="i === active ? undefined : 0"
          @click="i === active ? undefined : goTo(i)"
          @keydown.enter="i === active ? undefined : goTo(i)"
        >
          <span class="stack-card-media">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.title" loading="lazy" />
            <span v-else class="stack-card-fallback">{{ item.fallbackIcon || '✦' }}</span>
          </span>
          <span class="stack-card-overlay">
            <span v-if="item.badge" :class="item.badgeClass || 'tag'">{{ item.badge }}</span>
            <span class="stack-card-title">{{ item.title }}</span>
            <span v-if="item.subtitle" class="stack-card-subtitle">{{ item.subtitle }}</span>
          </span>
        </component>

        <button
          v-if="canDelete && i === active"
          type="button"
          class="stack-card-delete"
          aria-label="Borrar"
          @click.stop.prevent="onDeleteClick(item.id)"
        >
          &#10005;
        </button>
      </div>
    </div>

    <div class="stack-dots">
      <button
        v-for="(item, i) in items"
        :key="item.id"
        type="button"
        class="stack-dot"
        :class="{ 'stack-dot-active': i === active }"
        :aria-label="`Ir a ${item.title}`"
        @click="goTo(i)"
      />
    </div>
  </div>
</template>
