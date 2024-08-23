import { useState, useEffect, useRef } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import CameraPopup from "./CameraPopup"; // Import CameraPopup

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { chatId, user } = useChatStore();
  const { currentUser } = useUserStore();

  const [isCameraOpen, setIsCameraOpen] = useState(false); // Camera state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  
  const endRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);

          recorder.ondataavailable = event => {
            setAudioBlob(event.data);
          };

          recorder.start();
        })
        .catch(err => console.error("An error occurred: ", err));
    } else if (mediaRecorder) {
      mediaRecorder.stop();
    }
  }, [isRecording]);

  const handleMicClick = () => {
    setIsRecording(!isRecording);
  };

  const handleSendAudioMessage = async () => {
    if (audioBlob) {
      try {
        const audioUrl = await upload(audioBlob);
        await updateDoc(doc(db, "chats", chatId), {
          messages: arrayUnion({
            senderId: currentUser.id,
            text: "",
            audio: audioUrl,
            createdAt: new Date(),
          }),
        });

        setAudioBlob(null);
      } catch (error) {
        console.error("Error sending audio message:", error);
      }
    }
  };


  const handleCameraOpen = () => {
    setIsCameraOpen(true);
  };

  const handleCameraClose = () => {
    setIsCameraOpen(false);
  };

  const handleCapture = async (media) => {
    try {
      const blob = await fetch(media.src).then((res) => res.blob());
      const mediaUrl = await upload(blob);

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: "",
          [media.type]: mediaUrl,
          createdAt: new Date(),
        }),
      });

      setIsCameraOpen(false);
    } catch (error) {
      console.error("Error sending media:", error);
    }
  };

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

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
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setText("");
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
              {message.image && <img src={message.image} alt="Sent Image" className="sent-image" />}
              {message.audio && <audio controls src={message.audio} className="audio-message" />}
              {!message.audio && !message.image && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="Gallery" />
          <img src="./camera.png" alt="Camera" onClick={handleCameraOpen} />
          <img 
            src={isRecording ? "./mic_recording.png" : "./mic.png"} 
            alt="Mic" 
            onClick={handleMicClick} 
          />
          {isRecording && <p className="recording-text">Recording...</p>}
          {audioBlob && (
            <button onClick={handleSendAudioMessage} className="sendAudioButton">Send Audio Message</button>
          )}
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

      {/* Camera Popup */}
      {isCameraOpen && (
        <CameraPopup 
          onClose={handleCameraClose} 
          onConfirmCapture={handleCapture} 
        />
      )}
    </div>
  );
};

export default Chat;
