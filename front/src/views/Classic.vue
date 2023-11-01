<template>
    <AppHeaderNoMenu />
    <div class="container">
        <h1>Login</h1>
        <button @click="login()">login</button>
        <button @click="createUser()">sign in</button>
        <button @click="loginWith42()">Login via 42</button> <!-- Ajout du bouton pour l'authentification via 42 -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import router from '../routeur/index';
import AppHeaderNoMenu from '../components/AppHeaderNoMenu.vue';

export default defineComponent({
    name: 'Classic',
    components: {
    AppHeaderNoMenu
},
    methods: {
        login() {
            router.push('/login');
        },
        createUser() {
            router.push('/createuser');
        },
        loginWith42() {
            // const clientID = 'u-s4t2ud-1842764473b2fa93391c00de0b4574db18d32332766ea1707b50e6647fd88ad3';  // Remplacez 'VOTRE_CLIENT_UID' par votre UID client.
            // const redirectURI = encodeURIComponent('http://localhost:8080/menu'); // Assurez-vous que cette URL est correcte.
            // const scope = 'public'; 
            const authURL = ``;
            window.location.href = authURL;
        }
    }
});
</script>

<style scoped>
.container {
    display: flex;
    background: radial-gradient(circle at 50% 50%, rgb(13, 13, 13) 0%, rgb(13, 13, 13) 60%, #0C0032 90%);
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* min-height: 100vh; */
    min-height: calc(100vh - 120px);
    color: white;
    max-height: calc(100vh - 120px);
    overflow: auto;
}

h1{
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

