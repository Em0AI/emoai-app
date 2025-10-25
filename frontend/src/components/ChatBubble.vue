<template>
  <div class="chat-bubble" :class="{ 'is-user': isUser }">
    <p class="bubble-text">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    required: true,
  },
  isUser: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.chat-bubble {
  background-color: #F5F5F5;
  border: 1px solid #E8E8E8;
  border-radius: 16px;
  padding: 12px 20px;
  max-width: 66%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 0.75rem;
  word-wrap: break-word;
}

.bubble-text {
  font-size: 1.125rem;
  color: #333333;
  font-weight: 500;
  white-space: pre-wrap;
  margin: 0;
}

.is-user {
  background-color: #D4A574;
  border-color: #D4A574;
  align-self: flex-end;
  margin-left: auto;
  margin-right: 0;
}

.is-user .bubble-text {
  color: #FFFFFF;
}
</style>

