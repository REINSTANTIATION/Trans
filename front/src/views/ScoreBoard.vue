<template>
    <div>
        <AppHeader />
        <div class="table-container">
            <h2>Tableau des scores</h2>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Nbre de parties jouées</th>
                        <th>Victoires</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td>{{ user.username }}</td>
                        <td>{{ user.gamesPlayed }}</td>
                        <td>{{ user.victories }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import axios from 'axios';
import AppHeader from '../components/AppHeader.vue';
// import { backendURL } from '../config';

export default defineComponent({
    name: 'ScoreBoard',
    components: {
        AppHeader
    },
    setup() {
        interface User {
            id: number;
            username: string;
            gamesPlayed: number;
            victories: number;
        }

        const users = ref<User[]>([]);

        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3000/users/scoreboard');  // Assurez-vous que c'est l'URL correcte
                // const response = await axios.get(`${process.env.VITE_BACKEND_URL}/users/scoreboard`);  // Assurez-vous que c'est l'URL correcte

                users.value = response.data;
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            }
        };

        onMounted(() => {
            fetchUsers();
        });

        return {
            users
        };
    }
});
</script>

<style scoped>

div {
    background: radial-gradient(circle at 50% 50%, rgb(13, 13, 13) 0%, rgb(13, 13, 13) 60%, #0C0032 90%);
    min-height: calc(100vh - 300px);
    max-height: calc(100vh - 300px);
}

h2 {
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

table {
    border-collapse: separate;
    border-spacing: 0 10px;
}

.table-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 70px 0;
}

th,
td {
    border-radius: 30px;
    font-family: 'Georgia', serif;
    border: 2px solid #3300ff;
    background-color: rgba(51, 0, 255, 0.1);
    color: white;
    padding: 15px;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

th {
    background-color: #3500D3;
    border: none;
}

tbody td:hover {
    background-color: rgba(51, 0, 255, 0.2);
}
</style>