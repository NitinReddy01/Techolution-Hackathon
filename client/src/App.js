import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './Components/Home/Home';
import Chat from './Components/Chat/Chat';
import RequireAuth from './Components/Auth/RequireAuth'
import Login from './Components/Auth/Login';
import Register from './Components/Auth/Register';

function App() {

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route element={<RequireAuth />}>
          <Route path='/' element={<Home />} />
          <Route path='/chat' element={<Chat />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;


