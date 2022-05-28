import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Lobby from './Components/Lobby';
import Chat from './Components/Chat';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useState } from 'react';

const App = () => {
  const [connection, setConnection] = useState();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const joinRoom = async (user, room) => {
    try {
      const connection = new HubConnectionBuilder()
        .withUrl("https://localhost:44303/chat")
        .configureLogging(LogLevel.Information)
        .build();

      connection.on("UsersInRoom", (users) => {
        setUsers(users);
      });

      connection.on("ReceiveMessage", (user, message) => {
        setMessages(messages => [...messages, { user, message }]);
      });

      connection.onclose(e => {
        setConnection();
        setMessages([]);
        setUsers([]);
      })

      await connection.start();
      await connection.invoke("joinRoom", { user, room });
      setConnection(connection);
    } catch (e) {
      console.log(e);
    }
  }


  const closeConnection = async () => {
    try {
      await connection.stop();
    } catch (e) {
      console.log(e);
    }
  }


  const sendMessage = async (message) => {
    try {
      await connection.invoke("SendMessage", message);
    } catch (e) {
      console.log(e);
    }
  }


  return <div className='app'>
    <h2>MyChat</h2>
    <hr className='line' />
    {!connection
      ? <Lobby joinRoom={joinRoom} />
      : <Chat messages={messages} sendMessage={sendMessage}
        closeConnection={closeConnection} users={users} />}

  </div>
}

export default App;
