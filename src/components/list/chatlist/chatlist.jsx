import { useEffect, useState } from "react";
import "./chatlist.css";
import AddUser from "./adduser/adduser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
    const [addMode, setAddMode] = useState(false);
    const [chats, setChats] = useState([]);
    const { currentUser } = useUserStore();
    const { changeChat } = useChatStore();

    useEffect(() => {
        if (!currentUser?.id) return;

        const unSub = onSnapshot(doc(db, "userchat", currentUser.id), async (res) => {
            const items = res.data()?.chats || [];
            const promises = items.map(async (item) => {
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const user = userDocSnap.data();
                    return { ...item, user };
                }
                return item;
            });

            const chatData = await Promise.all(promises);
            chatData.sort((a, b) => b.updatedAt - a.updatedAt); // Sort by updatedAt timestamp
            setChats(chatData);
        });

        return () => {
            unSub();
        };
    }, [currentUser]);

    const handleSelect= async(chat)=>{
        const updatedChats = chats.map((item) => {
            const { user, ...rest } = item;
            if (item.chatId === chat.chatId) {
                return { ...rest, user, isSeen: true };
            }
            return item;
        });

        const userChatsRef = doc(db, "userchat", currentUser.id);
        try {
            await updateDoc(userChatsRef, { chats: updatedChats });
            changeChat(chat.chatId, chat.user); // Update the selected chat using the store action
        } catch (error) {
            console.error("Error updating chat:", error);
        }
    }

    return (
        <div className='chatlist'>
            <div className="search">
                <div className="searchbar">
                    <img src="./search.png" alt="" />
                    <input type="text" placeholder="Search " />
                </div>
                <img 
                    src={addMode ? "./minus.png" : "./plus.png"} 
                    alt="" 
                    className="add"
                    onClick={() => setAddMode(prev => !prev)} 
                />
            </div>
            {chats.map((chat) => (
                <div className="item" key={chat.chatId} onClick={()=>handleSelect(chat)} style={{backgroundColor:chat?.isSeen?"transparent":"#5183fe"}}>
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <span>{chat.user.username}</span>
                        <p>{chat.lastMessage}</p>
                    </div>
                </div>
            ))}
            {addMode && <AddUser existingChats={chats} />}  
        </div>
    );
}

export default ChatList;
