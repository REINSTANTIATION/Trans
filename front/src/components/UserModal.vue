<!-- UserModal.vue -->
<template>
    <div class="modal">
        <div class="modal-content" v-if="user">
            <span class="close" @click="closeModal">&times;</span>
            <div class="avatar-container">
                <img :src="user.avatarUrl" alt="User Avatar" class="avatar">
            </div>
            <h2>{{ user.username }}</h2>
            <button @click="sendFriendRequest">Envoyer une demande d'ami</button>

            <!-- Bouton pour déclencher le champ de saisie de message direct -->
            <button @click="toggleDirectMessage">Send Direct Message</button>

            <!-- Champ de saisie pour le message direct (affiché si directMessageActive est vrai) -->
            <div v-if="directMessageActive">
                <input v-model="directMessageText" placeholder="Type your message" />
                <button @click="sendDirectMessage">Send</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

export default defineComponent({
    name: 'UserModal',
    props: {
        user: Object
    },
    setup(props, { emit }) { // Notice the addition of { emit } here
        const store = useStore();
        const directMessageText = ref<string>('');
        const directMessageActive = ref<boolean>(false);

        const closeModal = () => {
            emit('close'); // Use "emit" instead of "this.$emit"
        }

        const sendFriendRequest = () => {
            // ... (no changes here)
        }

        const toggleDirectMessage = () => {
            directMessageActive.value = !directMessageActive.value;
        }

        function normalizeChannelName(user1: string, user2: string): string {
            return [user1, user2].sort().join('-');
        }

        const getRecipientName = (channelName: string): string => {
            // Séparez le nom du canal par le caractère "-"
            const users = channelName.split('-');

            // Retirez le nom de l'utilisateur actuel de la liste
            return users.find(user => user !== store.getters.username) || '';
        };



        const sendDirectMessage = async () => {
            const currentUsername = store.getters.username;
            const channelName = normalizeChannelName(currentUsername, (props.user as any).username);

            try {
                // Création du canal
                await axios.post('http://localhost:3000/channels', {
                    name: channelName,
                    type: 'direct',
                    username: currentUsername,
                });

                // Envoi du message
                await axios.post('http://localhost:3000/messages', {
                    senderUsername: currentUsername,
                    channelName: channelName,
                    content: directMessageText.value
                });

                directMessageText.value = '';
                directMessageActive.value = false;
            } catch (error) {
                console.error("Error:", error);
            }
        }


        return {
            directMessageText,
            directMessageActive,
            closeModal,
            sendFriendRequest,
            toggleDirectMessage,
            sendDirectMessage,
            getRecipientName
        };
    }
});
</script>
  
<!-- <style>
.modal {
    width: 50%;
    height: 50%;
    position: fixed;
    /* Position fixe par rapport à la fenêtre du navigateur */
    top: 50%;
    /* Position à 50% depuis le haut de la fenêtre du navigateur */
    left: 50%;
    /* Position à 50% depuis le côté gauche de la fenêtre du navigateur */
    transform: translate(-50%, -50%);
    /* Déplace la modale de -50% de sa propre largeur et hauteur pour la centrer */
    padding: 20px;
    /* Espace intérieur de la modale */
    border: 2px solid black;
    /* Bordure noire de 2px */
    background-color: yellow;
    /* Fond jaune */
    z-index: 1001;
    /* S'assure que la modale est au-dessus d'autres éléments */
    color: black;
}

.close {
    position: absolute;
    top: 10px;
    /* ajustez selon vos besoins */
    right: 10px;
    /* ajustez selon vos besoins */
    font-size: 24px;
    cursor: pointer;
    color: black;
    /* couleur de la croix en noir */
}

.avatar {
    width: 100px;
    /* ou la taille que vous souhaitez */
    height: 100px;
    border-radius: 50%;
    /* rend l'image circulaire */
    object-fit: cover;
    /* assure que l'image couvre complètement la taille définie */
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
    color: white;
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

.avatar-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
}

h2 {
    text-align: center;
    border-bottom: 2px solid #240090;
    padding-bottom: 10px;
    margin-bottom: 20px;
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

input {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 20px;
    margin-top: 10px;
    background-color: #190061;
    color: white;
    box-sizing: border-box;
}
</style>
