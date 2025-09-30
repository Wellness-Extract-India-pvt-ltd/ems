import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

const Logo = () => {
    const navigate = useNavigate();
    
    return (
        <img
            src={logo}
            alt="Wellness Extract Logo"
            className="h-12 w-auto cursor-pointer"
            onClick={() => navigate('/dashboard')}
        />
    )
}

export default Logo;
