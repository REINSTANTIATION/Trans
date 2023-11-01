<template class="container">
    <AppHeaderNoMenu />
    <div>
        <h1>Login</h1>
        <form @submit.prevent="handleLogin">
            <input v-model="username" placeholder="Username" required />
            <input type="password" v-model="password" placeholder="Password" required />
            <button type="submit">Login</button>
        </form>
    </div>
</template>

<script lang="ts">
import axios from 'axios';
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import AppHeaderNoMenu from '../components/AppHeaderNoMenu.vue';

export default defineComponent({
    name: 'Login',
    components: {
    AppHeaderNoMenu
},
    setup() {
        const router = useRouter();
        const store = useStore();

        const username = ref('');
        const password = ref('');

        const handleLogin = async () => {
            try {
                const response = await axios.post('http://localhost:3000/auth/login', {
                    username: username.value,
                    password: password.value
                });
                console.log(response.data);

                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('username', username.value);
                localStorage.setItem('avatarUrl', response.data.avatarUrl);

                console.log("Setting username in store:", username.value);
                store.commit('setUser', { username: username.value });
                store.commit('SET_AVATAR_URL', { avatarUrl: response.data.avatarUrl });

                store.dispatch('initializeSocket');
                router.push('/menu');
            } catch (error) {
                console.error('Erreur de connexion:', error);
            }
        }
        return {
            username,
            password,
            handleLogin
        };
    }
});
</script>

<style scoped>
@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";

div {
    background: radial-gradient(circle at 50% 50%, rgb(13, 13, 13) 0%, rgb(13, 13, 13) 60%, #0C0032 90%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    min-height: calc(100vh - 120px);
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
    border-bottom: none;
}

input {
    font-family: 'Georgia', serif;
    display: block;
    margin: 10px auto; 
    border: 2px solid #3300ff;
    background-color: rgba(51, 0, 255, 0.1);
    color: white;
    padding: 15px;
    border-radius: 30px;
    font-size: 16px;
    width: 80%;  /* Adjust width as necessary */
    outline: none;  /* Remove focus outline */
    transition: background-color 0.3s ease;
}

input:focus {
    background-color: rgba(51, 0, 255, 0.2);
}

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