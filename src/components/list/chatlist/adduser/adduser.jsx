import React, { useState } from 'react';
import './adduser.css';
import { arrayUnion, collection, doc, getDocs, query, updateDoc, where, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from '../../../../lib/firebase';
import { useUserStore } from '../../../../lib/userStore';

const AddUser = ({ existingChats }) => {
    const { currentUser } = useUserStore();
    const [user, setUser] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get("username");

        try {
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setUser(querySnapshot.docs[0].data());
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdd = async () => {
        if (existingChats.some(chat => chat.receiverId === user.id)) {
            alert('User is already in your chat list!');
            return;
        }

        const chatRef = collection(db, "chats");
        const userChatRef = collection(db, "userchat");

        try {
            const newChatRef = doc(chatRef);
            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            await setDoc(doc(userChatRef, user.id), {}, { merge: true });
            await setDoc(doc(userChatRef, currentUser.id), {}, { merge: true });

            const chatData = {
                chatId: newChatRef.id,
                receiverId: currentUser.id,
                lastMessage: "",
                updatedAt: Date.now(),
            };

            await updateDoc(doc(userChatRef, user.id), {
                chats: arrayUnion({ ...chatData, receiverId: currentUser.id })
            });

            await updateDoc(doc(userChatRef, currentUser.id), {
                chats: arrayUnion({ ...chatData, receiverId: user.id })
            });

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="adduser">
            <form onSubmit={handleSearch}>
                <input type="text" placeholder='Username' name='username' />
                <button>Search</button>
            </form>

            {user && (
                <div className="user">
                    <div className="details">
                        <img src={user.avatar || "./avatar.png"} alt="" />
                        <span>{user.username}</span>
                        <button onClick={handleAdd}>Add User</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddUser;
