import React, { useState } from "react";
import axios from "../../Api/axios";
import { Link, useNavigate } from "react-router-dom"
import './style.css';
import toast, { Toaster } from "react-hot-toast";
import { useDispatch} from "react-redux";
import { userLogin } from "../../features/authSlice";

export default function Login(props) {
    const [uname, setUname] = useState("");
    const [pword, setPword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();
    const from = '/';
    const dispatch = useDispatch();

    const login = async (event) => {
        event.preventDefault();
        let user = {
            uname: uname,
            pword: pword
        }
        toast.promise(axios.post('/login', user),
            {
                loading: "Processing...",
                success: (response) => {
                    dispatch(userLogin({ username: uname, accessToken: response.data.accessToken, id: response.data.id }))
                    navigate(from, { replace: true });
                    return "";
                },
                error: (err) => {
                    if (!err?.response) {
                        return 'No response from the server';
                    }
                    else if (err.response?.status === 400) {
                        return "Missing username or password";
                    }
                    else if (err.response?.status === 401) {
                        return 'Check your username or password';
                    }
                    else {
                        return 'login Failed';
                    }
                },
            }
        )
    };

    return (
        <>
            <div>
                <Toaster
                    position="top-center"
                    toastOptions={{
                        error: {
                            duration: 2500
                        },
                        success: {
                            duration: 2500
                        }
                    }}
                />
            </div>
            <form >
                <div className="loginBox">
                    <div className="login">
                        Sign In
                    </div>
                    <div className="username">
                        <input className="uname" type="text" placeholder="Username" value={uname} required onChange={(e) => setUname(e.target.value)} />
                    </div>
                    <div className="password">
                        <div className="pass-con" >
                            <input className="pword" type={showPass ? "text" : "password"} placeholder="Password" value={pword} required onChange={(e) => { setPword(e.target.value) }} />
                            <i className={showPass ? "fa fa-eye-slash" : "fa fa-eye"} aria-hidden="true"
                                onClick={() => { setShowPass(!showPass) }} ></i>
                        </div>
                    </div>
                    <div className="or1">
                        not a member?<Link className="orsign" to="/register" > signup now </Link><br></br>
                    </div>
                    <div className="loginbtn">
                        <button className="but" onClick={login} >SIGN IN</button>
                        <br />
                    </div>
                </div>
            </form>
        </>
    )
}