<template>
    <AppHeader/>
    <div class="user-info">
        <h2>User Info</h2>
        <div>
            <label for="username">Username:</label>
            <input type="text" id="username" v-model="user.name" readonly />
        </div>
        <div>
            <label for="password">Password:</label>
            <input type="password" id="password" v-model="user.password" />
            <button @click="changePassword">Change Password</button>
        </div>
        <div>
            <label for="avatar">Current Avatar:</label>
            <img :src="user.avatar" alt="User Avatar" id="avatar" />
            <!-- <input type="file" @change="changeAvatar" /> -->
        </div>
        <div>
            <h3>Friends List:</h3>
            <ul>
                <li v-for="friend in user.friends" :key="friend.id">{{ friend.name }}</li>
            </ul>
        </div>
        <button @click="logout">Logout</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppHeader from '../components/AppHeader.vue';

export default defineComponent({
    name: 'UserInfo',
    components : {
        AppHeader
    },
    data() {
        return {
            user: {
                name: 'John Doe',
                password: 'password123',
                avatar: 'path_to_avatar.jpg',
                friends: [
                    { id: 1, name: 'Friend 1' },
                    { id: 2, name: 'Friend 2' },
                    // ...other friends
                ]
            }
        };
    },
    methods: {
        changePassword() {
            // Logic to change the password
        },
        // changeAvatar(event: Event) {
        //     const file = (event.target as HTMLInputElement).files;
        //     if (file && file[0]) {
        //         const reader = new FileReader();
        //         reader.onload = (e) => {
        //             this.user.avatar = e.target.result as string;
        //         };
        //         reader.readAsDataURL(file[0]);
        //     }
        // },
        logout() {
            // Logic to logout
        }
    }
});
</script>

<style scoped>
@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";

.user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 50% 50%, rgb(13, 13, 13) 0%, rgb(13, 13, 13) 60%, #0C0032 90%);
    padding: 20px;
    /* border-radius: 10px; */
    min-height: calc(100vh - 170px);
    /* width: 50%;  Set a width to keep content centered */
    margin: auto;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);  /* Optional: for a shadow effect */
}

h2 {
    font-size: 60px;
    font-family: 'Georgia', serif;
    color: white;
    margin-bottom: 20px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 5px 5px 5px #3300ff;
    border-bottom: none;
}

input {
    font-family: 'Georgia', serif;
    padding: 10px;
    border-radius: 10px;
    border: 2px solid #3300ff;
    margin-bottom: 10px;
    width: 80%;
    background: url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webp/svgs/solid/user.svg') no-repeat scroll 7px 7px, #FFFFFF;
    padding-left: 40px;
}

button {
    font-family: 'Georgia', serif;
    margin: 10px auto;
    border: 2px solid #3300ff;
    background-color: rgba(51, 0, 255, 0.1);
    color: white;
    padding: 15px;
    border-radius: 30px;
    font-size: 16px;
    transition: background-color 0.3s ease;
    cursor: pointer;
}

button:hover {
    background-color: rgba(51, 0, 255, 0.2);
}

label {
    color: white;  /* Make label text white to match the theme */
    margin-bottom: 5px;
    display: block;  /* Ensure labels appear above the inputs */
}

div {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;  /* Center align content within each div */
    margin-bottom: 20px;  /* Space out the divs */
}

ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

li {
    background: rgba(255, 255, 255, 0.1);
    margin: 5px 0;
    padding: 10px;
    border-radius: 5px;
    width: 80%;  /* Set a width to match the input fields */
    text-align: center;
}
</style>
