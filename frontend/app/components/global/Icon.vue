<template>
  <span
    v-bind="$attrs"
    :class="['inline-block align-middle', $attrs.class]
      .filter(Boolean)
      .join(' ')"
    :style="[maskStyle, $attrs.style]"
    :aria-hidden="ariaHidden ? 'true' : undefined"
    :role="ariaHidden ? undefined : 'img'"
    :title="ariaHidden ? undefined : alt"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  src: string
  alt?: string
  ariaHidden?: boolean
}>()

const ariaHidden = computed(() => props.ariaHidden !== false)

const maskStyle = computed(() => {
  const url = `url("${props.src}")`
  return {
    backgroundColor: 'currentColor',
    WebkitMask: `${url} center / contain no-repeat`,
    mask: `${url} center / contain no-repeat`,
    display: 'inline-block'
  } as Record<string, string>
})
</script>
