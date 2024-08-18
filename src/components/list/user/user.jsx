import { useUserStore } from "../../../lib/userStore";
import "./user.css";

const User = () => {
  const{currentUser}=useUserStore();
    return (
      <div className='user'>
            <div className="avatar">
                <img src={currentUser.avatar||"./avatar.png"} alt="" />
                <h2>{currentUser.username}</h2>
            </div>

            <div className="icons">
                <img src="./more.png" alt="" />
                <img src="./video.png" alt="" />
                <img src="./edit.png" alt="" />
            </div>
        
      </div>
    )
  }
  
  export default User