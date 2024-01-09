import React from 'react'
import { useLocation,Outlet,Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RequireAuth() {
    const accessToken = useSelector((state)=>state.accessToken);
    const location = useLocation();
    return (
            accessToken?
            <Outlet/>:<Navigate to='/login' state={{from:location}} replace={true} />
    );
}