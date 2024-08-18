import User from "./user/user.jsx"
import ChatList from "./chatlist/chatlist.jsx"
import "./list.css"

const List = () => {
    return (
      <div className='list'>
        <User/>
        <ChatList/>
        
      </div>
    )
  }
  
  export default List
