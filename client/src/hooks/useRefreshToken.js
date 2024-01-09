import { useDispatch } from "react-redux";
import axios from "../Api/axios";
import { userLogin} from "../features/authSlice";

const useRefreshToken= ()=>{
    const dispatch = useDispatch();
    const refresh = async ()=>{
        const res=await axios.get('/auth/refreshToken');
        dispatch(userLogin({username:res.data.username,accessToken:res.data.accessToken,id:res.data.id}));
        return res.data.accessToken;
    }
    return refresh;
}

export default  useRefreshToken;