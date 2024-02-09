import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    //const navigate = useNavigate();

    const handleLogin = async () => {
        try{
            const response = await axios.post('/login', {email, password});
            //navigate('/homePage');
        } catch (error){
            console.error('login failed: ', error);
            setErrorMessage('Invalid email or password');
        }
    };

    const handleGuest = () => {
        //navigate('/homePage');
    };

    const handleRegister = () => {
        //navigate('/registerPage');
    };

    return (
        <div>
            <h2>
                Login
            </h2>
            <form onSubmit={handleLogin}>
                <input
                    type = "text"
                    placeholder="Email"
                    value = {email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <button onClick={handleGuest}>Sign in as Guest</button>
            <button onClick={handleRegister}>Register</button>
        </div>
    );
};

export default LoginPage;