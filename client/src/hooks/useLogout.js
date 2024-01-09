import axios from '../Api/axios';
import { useDispatch } from 'react-redux';
import { userLogout } from '../features/authSlice';

export default function useLogout() {
    const dispatch = useDispatch();
    const logout = async ()=>{
        try{
            await axios.get('/logout');
            dispatch(userLogout());
        }catch(error){
            console.error(error);
        }
    }
    return logout ;
}
