<template>
  <svg class="svg-icon" aria-hidden="true">
    <use :xlink:href="`#icon-${iconFileName}`" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    iconFileName: string
  }>(),
  {
    iconFileName: '404'
  }
)
</script>

<style lang="scss" scoped>
.svg-icon {
  width: 1.5em;
  height: 1.5em;
  overflow: hidden;
  vertical-align: -0.15em;
  fill: currentColor;
}
</style>
