import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    id:"",
    username:"",
    accessToken:"",
    fileName:"",
}

const authSlice = createSlice({
    name:"Auth",
    initialState,
    reducers:{
        userLogin:(state,action)=>{
            state.username=action.payload.username;
            state.accessToken=action.payload.accessToken;
            state.id=action.payload.id;
        },
        userLogout:(state)=>{
            state.id="";
            state.username="";
            state.accessToken="";
        },
        setFileName:(state,action)=>{
            state.fileName = action.payload.fileName;
        }
    }
})

export const {userLogin,userLogout,setFileName} = authSlice.actions;
export default authSlice.reducer;