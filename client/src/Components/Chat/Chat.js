import React, { useState, useEffect, useRef } from 'react';
import './chat.css';
import { useSelector } from 'react-redux';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import useLogout from '../../hooks/useLogout';

const Chat = () => {
  const [messages, setMessages] = useState([{text:"How can I help you?",sender: "bot"}]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef(null);
  const [loading,setLoading] = useState(false);
  const fileName = useSelector((state)=>state.fileName);
  const id = useSelector((state)=>state.id);
  const axios = useAxiosPrivate();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: newMessage, sender: 'user' },
    ]);
    setLoading(true);
    try {
      let res = await axios.post('http://localhost:4000/query ', {query:newMessage,fileName,id});
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: res.data.message, sender: res.data.sender },
      ]);
      setNewMessage('');
    } catch (err) {
      console.log(err);
    }finally{
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    // console.log(chatContainerRef.current);
  }, [messages]);

  useEffect(()=>{
    let getMessages = async ()=>{
      let res = await axios.get( `getMessages/${fileName}/${id}`);
      // console.log(res);
      setMessages((prevMessages) => [
        ...prevMessages,
        // { text: res.data.message, sender: res.data.sender },
        ...res.data.map((msg)=>{return {text:msg.message,sender:msg.sender}}),
      ]);
    }
    getMessages();
  },[]);

  const signOut = async ()=>{
    try{
        await logout();
        navigate('/login');
    }catch(err){
        console.log(err);
    }
}

  return (
    <>
      <div className="chat-container main" >
        <div className="chat-messages" ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              {message.text}
            </div>
          ))}
          {loading && <div className='message bot'> Loading... </div> }
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button type='submit' onClick={handleSendMessage}>Send</button>
        </div>
      </div>
        <button className='logout' onClick={signOut}>Logout</button>
  </>
  );
};

export default Chat;

  