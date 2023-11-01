<!-- CreateChannelModal.vue -->
<template>
  <div class="modal" v-if="isVisible">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>Créer un nouveau canal</h2>
      <form @submit.prevent="createChannel">
        <label for="chanName">Nom du Canal:</label>
        <input type="text" id="chanName" v-model="chanName" required />

        <label for="type">Type:</label>
        <select id="type" v-model="type">
          <option value="public">Public</option>
          <option value="private">Privé</option>
        </select>

        <label v-if="isPrivate" for="password">Mot de Passe:</label>
        <input v-if="isPrivate" type="password" id="password" v-model="password" />

        <button type="submit">Créer</button>
      </form>
    </div>
  </div>
</template>
  
<script lang="ts">
import axios, { AxiosError } from 'axios';
import { defineComponent, ref, watch } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  props: ['isVisible'],
  emits: ['update:isVisible'],
  setup(_props, { emit }) {
    const chanName = ref('');
    const type = ref('');
    const isPrivate = ref(false);
    const password = ref('');
    const store = useStore();

    watch(type, (newValue) => {
      isPrivate.value = newValue === 'private';
    });

    const closeModal = () => {
      emit('update:isVisible', false);
    };

    const createChannel = async () => {
      try {
        const response = await axios.post('http://localhost:3000/channels', {
          name: chanName.value.toLowerCase(),
          type: type.value,
          password: isPrivate.value ? password.value : null,
          username: store.getters.username,
        });

        console.log('Channel created:', response.data);
        closeModal();
      } catch (error) {
        if (error instanceof Error && 'response' in error) {
          const axiosError = error as AxiosError;
          if (axiosError.response && axiosError.response.status === 409) {
            alert('Channel with this name already exists.');
          } else {
            console.error('Error creating channel:', axiosError);
          }
        }
      }
    };

    return {
      chanName,
      type,
      isPrivate,
      closeModal,
      createChannel,
      password
    };
  },
});
</script>

<!-- <style>
.modal {
  width: 50%;
  height: 50%;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  border: 2px solid black;
  background-color: yellow;
  z-index: 1001;
  color: black;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
  color: black;
}
</style> -->

<style>
.modal {
    width: 50%;
    height: 50%;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    border: 2px solid #240090;
    background-color: #0C0032;
    z-index: 1001;
    color: #ecf0f1;
    border-radius: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    cursor: pointer;
    color: white;
}

.close:hover {
    color: #3500D3;
}

h2 {
    text-align: center;
    border-bottom: 2px solid #240090;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

label {
    font-weight: bold;
}

input, select {
    padding: 10px;
    border: none;
    border-radius: 20px;
    background-color: #190061;
    color: white;
    box-sizing: border-box;
}

button {
    padding: 10px 20px;
    border: none;
    border-radius: 20px;
    background-color: #3500D3;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.3s;
    margin-top: 10px;
}

button:hover {
    background-color: #240090;
    transform: scale(1.05);
}
</style>

  