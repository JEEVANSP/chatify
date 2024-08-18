import { useState, useEffect, useRef } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { chatId, user } = useChatStore();
  const { currentUser } = useUserStore();

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const endRef = useRef(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  useEffect(() => {
    if (!chatId) return;

    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleSend = async () => {
    if (text === "") return;

    const now = new Date();

    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: now,
        }),
      });

      const userIds = [currentUser.id, user.id];
      userIds.forEach(async (id) => {
        const userChatRef = doc(db, "userchat", id);
        const userChatSnap = await getDoc(userChatRef);

        if (userChatSnap.exists()) {
          const userChatsData = userChatSnap.data();
          const chatIndex = userChatsData.chats.findIndex((chat) => chat.chatId === chatId);

          if (chatIndex !== -1) {
            const updatedChat = { ...userChatsData.chats[chatIndex] };
            updatedChat.lastMessage = text;
            updatedChat.isSeen = id === currentUser.id;
            updatedChat.updatedAt = now.getTime();

            userChatsData.chats[chatIndex] = updatedChat;

            await updateDoc(userChatRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setText(""); // Clear the input field after sending
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  return (
    <div className="chat">
      <div className="top">
        <div className="user1">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <span>{user.username}</span>
            <p>Why so serious?</p>
          </div>
        </div>
        <div className="icon">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div className={message.senderId === currentUser.id ? "message own" : "message"} key={message?.createdAt}>
            <div className="texts">
              {message.image && <img src={message.img} alt="" />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="" />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
        />
        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={() => setOpen((prev) => !prev)} />
          {open && (
            <div className="picker">
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <button className="sendButton" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
