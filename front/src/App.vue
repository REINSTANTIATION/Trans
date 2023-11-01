<!-- app.vue -->
<template>
  <div>
    <!-- Votre en-tête, barre latérale, etc. -->
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'App',
  setup() {
    const store = useStore();

    onMounted(() => {
      // Vérifiez si l'utilisateur est connecté
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        store.dispatch('initializeSocket');
      }
    });
  }
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: Arial, sans-serif;
}

button {
  margin: 10px;
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
}
</style>
