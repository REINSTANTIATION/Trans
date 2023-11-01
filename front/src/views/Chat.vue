<!-- chat.vue -->
<template>
    <AppHeader />
    <div class="chat-container">
        <aside class="sidebar-left">
            <section>
                <h3>Public Channels</h3>
                <ul>
                    <li class="cursor" v-for="channel in publicChannels" :key="channel.id"
                        @click="selectChannel(channel.name)" :class="{ 'active-channel': currentChannel === channel.name }">
                        {{ channel.name }}
                    </li>
                </ul> 
            </section>
            <section>
                <h3>Private Channels</h3>
                <ul>
                    <li class="cursor" v-for="channel in privateChannels" :key="channel.id"
                        @click="selectChannel(channel.name)" :class="{ 'active-channel': currentChannel === channel.name }">
                        {{ channel.name }}
                    </li>
                </ul>
            </section>
            <section>
                <h3>Direct Messages</h3>
                <ul>
                    <li class="cursor" v-for="channel in directChannels" :key="channel.id"
                        @click="selectChannel(channel.name)" :class="{ 'active-channel': currentChannel === channel.name }">
                        {{ getRecipientName(channel.name) }}
                    </li>
                </ul>
            </section>
            <button class="cursor" @click="isModalVisible = true">create channel</button>
            <h3>Online Users</h3>
            <ul>
                <li class="cursor" v-for="user in onlineUsers" :key="user">{{ user }}</li>
            </ul>
        </aside>

        <main class="chat-window">
            <section class="messages">
                <div class="constellation"></div>
                <div v-for="message in messages" :key="message.id"
                    :class="{ 'my-message': message.senderUsername === store.getters.username, 'other-message': message.senderUsername !== store.getters.username }">
                    <span><strong>{{ message.senderUsername }}:</strong> {{ message.content }}</span>
                </div>
            </section>
            <section class="message-input">
                <input v-model="newMessage" placeholder="Type a message" />
                <button class="send-button" @click="sendMessage">Send</button>
            </section>
        </main>

        <aside class="sidebar-right">
            <!-- Section pour les utilisateurs dans le canal -->
            <h3>In Channel</h3>
            <ul>
                <li v-for="user in usersInChannel" :key="user">{{ user }}</li>
            </ul>
            <!-- Nouvelle section pour les informations du canal -->
            <h3>Channel Info</h3>
            <div class="channel-info">
                <p><strong>Owner:</strong> {{ channelOwner }}</p>
                <p><strong>Admins:</strong></p>
                <ul>
                    <li v-for="admin in channelAdmins" :key="admin">
                        {{ admin }}
                        <!-- Bouton pour rétrograder un admin -->
                        <button v-if="channelOwner === store.getters.username" @click="downgradeToMember(admin)">
                            Rétrograder comme membre
                        </button>
                        <!-- Bouton pour mettre en sourdine un admin -->
                        <button
                            v-if="channelOwner === store.getters.username || channelAdmins.includes(store.getters.username)"
                            @click="muteUser(admin)">
                            Mettre en sourdine
                        </button>
                    </li>
                </ul>
                <p><strong>Members:</strong></p>
                <ul>
                    <li v-for="member in channelMembers" :key="member">
                        {{ member }}
                        <!-- Bouton pour promouvoir un membre -->
                        <button
                            v-if="channelOwner === store.getters.username && !channelAdmins.includes(member) && member !== channelOwner"
                            @click="promoteToAdmin(member)">
                            Promouvoir comme Admin
                        </button>
                        <!-- Bouton pour mettre en sourdine un membre -->
                        <button
                            v-if="channelOwner === store.getters.username || channelAdmins.includes(store.getters.username)"
                            @click="muteUser(member)">
                            Mettre en sourdine
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    </div>
    <CreateChannelModal :isVisible="isModalVisible" @update:isVisible="isModalVisible = $event" />
</template>

<script lang="ts">
import axios from 'axios';
import { defineComponent, ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import AppHeader from '../components/AppHeader.vue';
import CreateChannelModal from '../components/CreateChannelModal.vue';
import store from '../store';

interface Message {
    id: number;
    senderUsername: string;
    content: string;
}

interface Channel {
    id: number;
    name: string;
    type: 'public' | 'private' | 'direct';
    owner: string;
    // ... d'autres champs si nécessaire
}

export default defineComponent({
    name: 'Chat',
    components: {
        AppHeader,
        CreateChannelModal
    },
    setup() {
        const store = useStore();
        const socket = computed(() => store.getters.socket);
        const newMessage = ref<string>('');
        const messages = ref<Array<Message>>([]);
        const currentChannel = ref<string>('general');
        const onlineUsers = ref<string[]>([]);

        const channels = ref(['General']);
        const friends = ref([]);

        const isModalVisible = ref(false);

        const channelPassword = ref<string>('');
        const usersInChannel = ref<string[]>([]);

        const publicChannels = ref<Array<Channel>>([]);
        const privateChannels = ref<Array<Channel>>([]);
        const directChannels = ref<Array<Channel>>([]);

        const channelOwner = ref<string>('');
        const channelAdmins = ref<string[]>([]);
        const channelMembers = ref<string[]>([]);

        // Watcher pour suivre les changements du socket
        watch(socket, (newSocket) => {
            if (newSocket) {
                console.log("Socket ID chat.vue:", newSocket.id);
                newSocket.emit('check_or_create_user', { username: store.getters.username });
                newSocket.emit('set_user_online', { username: store.getters.username });
                newSocket.emit('joinChannel', { channelName: 'general' }, () => {
                    newSocket.emit('getUsersInChannel', { channelName: 'general' });
                    newSocket.emit('getOnlineUsers');
                    newSocket.emit('getChannelDetails', { channelName: currentChannel });
                });
                newSocket.emit('getChannelNames');

                console.log("channel: ", currentChannel.value);

                newSocket.on('disconnect', () => {
                    console.log('Socket déconnecté dans chat');
                });

                newSocket.on('lastMessages', (lastMessages: Array<Message>) => {
                    console.log("last messages front: ", lastMessages);
                    messages.value = lastMessages.reverse();  // Inversez l'ordre ici
                });

                // Move these listeners here
                newSocket.on('channel_message', (message: Message) => {
                    messages.value.push(message);
                });

                newSocket.on('onlineUsers', (users: string[]) => {
                    console.log('Received online users:', users);
                    onlineUsers.value = users;
                });

                newSocket.on('newMessage', (message: Message) => {
                    messages.value.push(message);
                });

                newSocket.on('newChannel', (channel: Channel) => {
                    switch (channel.type) {
                        case 'public':
                            publicChannels.value.push(channel);
                            break;
                        case 'private':
                            privateChannels.value.push(channel);
                            break;
                        case 'direct':
                            const usersInChannel = channel.name.split('-');
                            if (usersInChannel.includes(store.getters.username)) {
                                directChannels.value.push(channel);
                            }
                            break;
                    }
                });

                newSocket.on('channelNames', (allChannels: any[]) => {
                    console.log("Received channels:", allChannels);

                    publicChannels.value = allChannels.filter(channel => channel.type === 'public');
                    privateChannels.value = allChannels.filter(channel => channel.type === 'private');

                    // Filtrer les canaux directs pour ne conserver que ceux qui contiennent le nom de l'utilisateur actuel
                    directChannels.value = allChannels.filter(channel => {
                        if (channel.type !== 'direct') return false;
                        const usersInChannel = channel.name.split('-');
                        return usersInChannel.includes(store.getters.username);
                    }).map(channel => ({
                        ...channel,
                        displayName: getRecipientName(channel.name)
                    }));
                });

                newSocket.on('usersInChannel', (users: string[]) => {
                    usersInChannel.value = users;
                })

                newSocket.on('channelDetails', (data: { roles: any[]; }) => {
                    console.log('Received channel details:', data);
                    const ownerRole = data.roles.find(role => role.role === 'Owner');
                    if (ownerRole) {
                        channelOwner.value = ownerRole.__user__.username; // suppose que 'user' est déjà résolu et disponible
                    }
                    channelAdmins.value = data.roles.filter(role => role.role === 'Admin').map(role => role.__user__.username);
                    channelMembers.value = data.roles.filter(role => role.role === 'Member').map(role => role.__user__.username);
                });

            } else {
                console.log("Aucun socket n'a été initialisé dans chat.");
            }
        }, { immediate: true });

        const getRecipientName = (channelName: string): string => {
            const users = channelName.split('-');
            return users.find(user => user !== store.getters.username) || '';
        };

        const isChannelPrivate = (channelName: string) => {
            return new Promise((resolve) => {
                socket.value.emit('isChannelPrivate', { channelName }, (response: { isPrivate: unknown; }) => {
                    resolve(response.isPrivate);
                });
            });
        };

        const selectChannel = async (channel: string) => {
            if (currentChannel.value) {
                socket.value.emit('leaveChannel', { channelName: currentChannel.value.toLowerCase() });
            }
            currentChannel.value = channel;
            messages.value = [];
            if (socket.value && socket.value.connected) {
                console.log("Checking if channel is private: ", channel);

                const channelIsPrivate = await isChannelPrivate(channel);
                if (channelIsPrivate) {
                    channelPassword.value = askForPassword();
                    socket.value.emit('joinChannel', { channelName: channel.toLowerCase(), password: channelPassword.value });
                    console.log("channelID:............: ", channel.toLowerCase())
                } else {
                    socket.value.emit('joinChannel', { channelName: channel.toLowerCase() });
                }
                socket.value.emit('getUsersInChannel', { channelName: channel.toLowerCase() });
                socket.value.emit('getLastMessages', { channelName: channel.toLowerCase() });
                if (currentChannel.value != 'general') {
                    console.log("............getChannelDetails...... ")

                    socket.value.emit('getChannelDetails', { channelName: channel.toLowerCase() });
                }

            }
            console.log(`Selected Channel: ${channel}`);
        };

        const sendMessage = () => {
            if (newMessage.value.trim() !== '') {
                const message = {
                    id: Date.now(),
                    sender: store.getters.username,
                    content: newMessage.value.trim(),
                };
                console.log("message:.........: ", message)
                if (socket.value && socket.value.connected) {
                    socket.value.emit('sendMessage', {
                        channel: currentChannel.value.toLowerCase(),
                        message: message.content,
                        senderUsername: store.getters.username,
                    });
                } else {
                    console.error('Socket is not connected.');
                }
                newMessage.value = '';
            }
        };

        const askForPassword = () => {
            return prompt("Veuillez entrer le mot de passe pour ce canal :") || '';
        };

        const promoteToAdmin = async (member: string) => {
            try {
                // Ici, vous devez remplacer par votre logique pour promouvoir un utilisateur en tant qu'admin.
                // Par exemple, une requête socket.io ou une requête HTTP vers votre serveur.
                await axios.post(`http://localhost:3000/channels/${currentChannel.value}/promoteToAdmin`, {
                    username: member, // l'username du membre à promouvoir
                });

                // Si la requête est réussie, ajoutez le membre à la liste des admins
                channelAdmins.value.push(member);

                // Informez l'utilisateur que la promotion a réussi
                // Vous devez remplacer cette partie par votre propre logique pour afficher une notification
                store.dispatch('addToast', {
                    message: `${member} a été promu administrateur.`,
                    type: 'success',
                });
            } catch (error) {
                // Gérez les erreurs ici en informant l'utilisateur
                // Vous devez remplacer cette partie par votre propre logique pour afficher une notification
                store.dispatch('addToast', {
                    message: 'Une erreur est survenue lors de la promotion de l\'utilisateur.',
                    type: 'error',
                });
            }
        };

        const downgradeToMember = async (admin: string) => {
            try {
                // Ici, vous devez remplacer par votre logique pour promouvoir un utilisateur en tant qu'admin.
                // Par exemple, une requête socket.io ou une requête HTTP vers votre serveur.
                await axios.post(`http://localhost:3000/channels/${currentChannel.value}/downgradeToMember`, {
                    username: admin, // l'username du membre à promouvoir
                });

                // Si la requête est réussie, ajoutez le membre à la liste des admins
                channelMembers.value.push(admin);

                // Informez l'utilisateur que la promotion a réussi
                // Vous devez remplacer cette partie par votre propre logique pour afficher une notification
                store.dispatch('addToast', {
                    message: `${admin} a été promu administrateur.`,
                    type: 'success',
                });
            } catch (error) {
                // Gérez les erreurs ici en informant l'utilisateur
                // Vous devez remplacer cette partie par votre propre logique pour afficher une notification
                store.dispatch('addToast', {
                    message: 'Une erreur est survenue lors de la promotion de l\'utilisateur.',
                    type: 'error',
                });
            }
        };

        const muteUser = async (userToMute: string) => {
            try {
                // Remplacez par votre logique pour mettre en sourdine un utilisateur, comme une requête socket.io ou HTTP vers votre serveur.
                await axios.post(`http://localhost:3000/channels/${currentChannel.value}/muteUser`, {
                    username: userToMute, // le nom d'utilisateur de la personne à mettre en sourdine
                });

                // Si la requête est réussie, vous pouvez afficher une notification ou effectuer d'autres actions selon votre logique d'interface utilisateur
                store.dispatch('addToast', {
                    message: `${userToMute} a été mis en sourdine pendant 10 secondes.`,
                    type: 'success',
                });
            } catch (error) {
                // Gérez les erreurs ici en informant l'utilisateur
                store.dispatch('addToast', {
                    message: 'Une erreur est survenue lors de la mise en sourdine de l\'utilisateur.',
                    type: 'error',
                });
            }
        };


        return {
            newMessage,
            messages,
            currentChannel,
            selectChannel,
            sendMessage,
            onlineUsers,
            store,
            channels,
            friends,
            isModalVisible,
            isChannelPrivate,
            usersInChannel,
            publicChannels,
            privateChannels,
            directChannels,
            getRecipientName,
            channelOwner,
            channelAdmins,
            channelMembers,
            promoteToAdmin,
            downgradeToMember,
            muteUser
        };
    },
});
</script>

<style scoped>
.chat-container {
    display: flex;
    min-height: calc(100vh - 170px);
    max-height: calc(100vh - 170px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    background: radial-gradient(circle at 50% 50%, rgb(13, 13, 13) 0%, rgb(13, 13, 13) 60%, #0C0032 90%);

}

.sidebar-left,
.sidebar-right {
    flex-shrink: 0;
    flex-grow: 0;
    width: 10%;
    padding: 20px;
    /* background-color: #0C0032; */
    color: white;
}

.sidebar-right {
   text-align: right;
}

h3 {
    border-bottom: 2px solid #240090;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

ul {
    list-style-type: square;
}

li {
    padding: 10px 0;
    transition: background-color 0.3s, transform 0.3s;
}

.active-channel {
    font-weight: bold;
    color: #3500D3;
    transform: scale(1.3);
}

.chat-window {
    width: 65%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    /* background-color: rgb(13, 13, 13); */

    /* background: radial-gradient(circle at 50% 50%, rgb(0, 0, 0) 30%, rgb(13, 13, 13) 60%,  rgb(13, 13, 13) 90.2%); */
    max-height: calc(100vh - 130px);
}

.messages {
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.my-message,
.other-message {
    padding: 10px 20px;
    margin: 10px 250px;
    border-radius: 30px;
    max-width: 50%;
    transition: transform 0.3s;
    min-width: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
    /* overflow-x: hidden; */
}

.my-message {
    background-color: rgba(53, 0, 211, 0.2);
    border:  #3500D3;
    color: white;
    align-self: flex-end;
    border: 2px solid #3500D3;
    box-shadow: 0 4px 8px rgba(53, 0, 211, 0.5);
}

.other-message {
    background-color: rgba(211, 176, 53, 0.2);
    border: #D3B035;
    color: white;
    align-self: flex-start;
    border: 2px solid #D3B035;
    box-shadow: 0 4px 8px rgba(211, 176, 53, 0.5);
}

.message-input {
    display: flex;
    padding: 20px;
    /* background-color: #190061; */
    justify-content: center; /* Aligns items on the main axis (horizontally) */
    align-items: center;
    flex-shrink: 0;
}

.message-input input {
    margin-right: 10px;
    background-color:rgb(26, 26, 26);
    width: 65%;
    border: 2px solid white;
    background-color: none;

}

.send-button {
    background-color:rgb(26, 26, 26);
    border: 2px solid white;
}


.cursor {
    cursor: pointer;
}
</style>