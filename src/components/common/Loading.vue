<template>
  <div class="flex items-center justify-center">
    <Icon icon="mdi:loading" class="animate-spin h-8 w-8" />
    <p class="ml-2">Loading...</p>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
