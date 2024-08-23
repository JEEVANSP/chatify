import Chat from "./components/chat/chat.jsx";
import List from "./components/list/list.jsx";
import Detail from "./components/details/details.jsx";
import Login from "./components/login/login.jsx"; 
import Notification from "./components/notification/notification.jsx";
import { useUserStore } from "./lib/userStore.js";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useChatStore } from "./lib/chatStore.js";
import { auth } from "./lib/firebase.js";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo, resetUser } = useUserStore();
  const { chatId} = useChatStore();
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Authenticated user:", user);
        fetchUserInfo(user.uid);
      } else {
        console.log("No authenticated user");
        resetUser();
      }
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo, resetUser]);

  console.log("Current User:", currentUser);

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-text">Loading...</div>
        <div className="loading-bar-container">
          <div className="loading-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentUser ? (
        <div className='container'>
          <List />
          {chatId&&<Chat />}
          {chatId&&<Detail />}
        </div>
      ) : (
        <Login />
      )}
      <Notification />
    </>
  );
};

export default App;
