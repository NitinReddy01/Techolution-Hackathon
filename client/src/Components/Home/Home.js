import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './home.css'
import { useDispatch, useSelector } from 'react-redux';
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { setFileName } from '../../features/authSlice';

function Home() {
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const id = useSelector((state)=>state.id);
    const username = useSelector((state)=>state.username);
    const axios = useAxiosPrivate();
    const dispatch = useDispatch();
    
    const uploadFile = async (e) => {
      e.preventDefault();
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("username", username);
        formData.append("id", id);
        try {
          let res = await axios.post('http://localhost:4000/upload', formData,{  headers: {
            'Content-Type': 'multipart/form-data'
          }});
          console.log(res);
          dispatch(setFileName({fileName:res.data.fileName}))
          navigate('/chat');
        } catch (error) {
          console.log(error);
        }
      }
    }
    return (
      <div className="home">
        <input style={{color:"black"}} type="file" onChange={(e) => { setFile(e.target.files[0]) }} />
        <button onClick={uploadFile} >Upload PDF</button>
      </div>
    );
}

export default Home
