<!-- src/views/CreateUser.vue -->
<template>
    <AppHeaderNoMenu />
    <div class="create-user-container">
        <h1>Create User</h1>
        <form @submit.prevent="submitForm">
            <input v-model="username" placeholder="Username" required />
            <input type="password" v-model="password" placeholder="Password" required />
            <input type="password" v-model="retypePassword" placeholder="Retype Password" required />
            <input v-model="firstName" placeholder="First Name" required />
            <input v-model="lastName" placeholder="Last Name" required />
            <input type="email" v-model="email" placeholder="Email" required />
            <input type="file" ref="avatarInput" accept="image/*" />
            <button type="submit">Submit</button>
        </form>
        <div class="two-factor-container">
            <label for="enable2FA">Enable Two-Factor Authentication:</label>
            <input type="checkbox" id="enable2FA" v-model="enable2FA" @change="toggle2FA" />
            <div v-if="showQRCode">
                <img :src="qrCode" alt="Scan this QR code with Google Authenticator" />
                <input v-model="twoFactorCode" placeholder="Enter 2FA code" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';
import router from '../routeur/index'
import AppHeaderNoMenu from '../components/AppHeaderNoMenu.vue';

export default defineComponent({
    name: 'CreateUser',
    components: {
        AppHeaderNoMenu
    },
    setup() {
        const username = ref("");
        const password = ref("");
        const retypePassword = ref("");
        const email = ref("");
        const firstName = ref("");
        const lastName = ref("");
        const avatarInput = ref(null);


        const submitForm = async () => {
            // Vérifiez que les deux mots de passe correspondent
            if (password.value !== retypePassword.value) {
                alert("Passwords do not match!");
                return;
            }

            const alphanumericPattern = /^[a-zA-Z0-9]+$/;
            if (!alphanumericPattern.test(username.value)) {
                alert("Le nom d'utilisateur doit être alphanumérique !");
                return;
            }

            const userData = {
                username: username.value,
                password: password.value,
                email: email.value,
                firstName: firstName.value,
                lastName: lastName.value
            };

            const formData = new FormData();
            for (const key in userData) {
                formData.append(key, userData[key as keyof typeof userData]);
            }

            // Si un fichier a été choisi, ajoutez-le à formData
            if (avatarInput.value) {
                const file = (avatarInput.value as HTMLInputElement).files?.[0];
                if (file) {
                    console.log("file size: ", file.size);
                    formData.append('avatar', file);
                }
            }

            try {
                // Adaptez l'URL et la méthode selon votre API
                console.log("try");
                const response = await axios.post('http://localhost:3000/users', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // Vous pouvez traiter la réponse ici si nécessaire
                console.log(response.data);
                router.push({ name: 'Login' });

            } catch (error) {
                console.error("Il y a eu une erreur lors de l'envoi des données:", error);
            }
        };

        const enable2FA = ref(false);
        const showQRCode = ref(false);
        const qrCode = ref("");
        const twoFactorCode = ref("");

        const toggle2FA = async () => {
            if (enable2FA.value) {
                try {
                    const response = await axios.post('http://localhost:3000/auth/setup-2fa', { username: username.value });
                    qrCode.value = response.data.qrCode;
                    showQRCode.value = true;
                } catch (error) {
                    console.error("Error fetching QR code:", error);
                }
            } else {
                showQRCode.value = false;
            }
        };

        return {
            firstName,
            lastName,
            username,
            password,
            retypePassword,
            email,
            avatarInput,
            submitForm,
            enable2FA,
            showQRCode,
            qrCode,
            twoFactorCode,
            toggle2FA
        };
    }
});
</script>

<style scoped>
.create-user-container {
    background: radial-gradient(circle at 50% 50%, rgb(13, 13, 13) 0%, rgb(13, 13, 13) 60%, #0C0032 90%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: white;
    max-height: calc(100vh - 130px);
    overflow: auto;
}

h1 {
    font-size: 60px;
    font-family: 'Georgia', serif;
    color: white;
    margin-bottom: 60px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 5px 5px 5px #3300ff;
    border-bottom: none;
}

input {
    font-family: 'Georgia', serif;
    display: block;
    border: 2px solid #3300ff;
    background-color: rgba(51, 0, 255, 0.1);
    color: white;
    border-radius: 30px;
    font-size: 16px;
    outline: none;
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

.two-factor-container {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

label {
    margin-right: 10px;
}
</style>