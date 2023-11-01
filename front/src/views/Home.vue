<template>
  <AppHeaderNoMenu />
  <div class="container">
    <h1>Choisissez une version</h1>
    <button @click="selectVersion('3d')">Version 3D</button>
    <button @click="selectVersion('classic')">Classic</button>
  </div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import AppHeader from '../components/AppHeader.vue'; // Assurez-vous que le chemin est correct

import router from '../routeur/index';
import AppHeaderNoMenu from '../components/AppHeaderNoMenu.vue';

export default defineComponent({
  name: 'App',
  components: {
    AppHeaderNoMenu
},
  methods: {
    selectVersion(version: string) {
      // alert(`Vous avez choisi la version ${version}`);
      if (version == "classic") {
        router.push('/classic');
      }
      // else if (version == "3d") {
      //     this.$routeur.push()
      // }
      // Ici, vous pouvez ajouter la logique pour naviguer vers la version choisie ou charger les ressources nécessaires.
    }
  }
});
</script>
  
<!-- <style scoped>
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
</style> -->

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  background: radial-gradient(circle at 50% 50%, rgb(13, 13, 13) 0%, rgb(13, 13, 13) 60%, #0C0032 90%);
  max-height: calc(100vh - 120px);
  overflow: auto;
}

h1 {
  font-size: 60px;
    font-family: 'Georgia', serif;
    color: white;
    margin-bottom: 90px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 5px 5px 5px #3300ff;
    border-bottom: none;}

button {
  font-family: 'Georgia', serif;
    display: block;
    margin: 10px auto; 
    border: 2px solid #3300ff;
    background-color: rgba(51, 0, 255, 0.1);
    color: white;
    padding: 15px;
    border-radius: 30px;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: rgba(51, 0, 255, 0.2);
}
</style>