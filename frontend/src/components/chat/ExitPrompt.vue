<template>
  <div class="exit-prompt-overlay">
    <div class="exit-prompt-box">
      <p class="message">
        It was really nice talking with you today. In {{ countdown }} seconds, you’ll return to the home page — I look forward to exploring more with you next time.
      </p>
      <div class="button-group">
        <button class="btn btn-secondary" @click="goToDiary">Come and see your diary</button>
        <button class="btn btn-primary" @click="goToHome">Exit to home page</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const countdown = ref(5);
let timer: NodeJS.Timeout;

const goToHome = () => {
  router.push('/');
};

const goToDiary = () => {
  router.push('/diary');
};

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value === 0) {
      goToHome();
    }
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.exit-prompt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.exit-prompt-box {
  background-color: #FFFFFF;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  text-align: center;
}

.message {
  font-size: 1.125rem;
  color: #333;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #F2D7A9;
  color: #8B5E2E;
}

.btn-primary:hover {
  filter: brightness(0.95);
}

.btn-secondary {
  background-color: #E0E0E0;
  color: #555;
}

.btn-secondary:hover {
  filter: brightness(0.95);
}
</style>