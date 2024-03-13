import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './registerPage.css'; // Import CSS file for styling
import logo from '../assets/logoIMG.jpeg'; // Import your logo image
import authAPI from '../api/auth.js'; // Import your API file
import LoadingSpinner from '../components/LoadingSpinner'; // Import the LoadingSpinner component

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setIsLoading(true);
        try {

            const response = await authAPI.login({ email, password });
            if(response.status === 200){
                navigate('/');
            } else if(response.status === 401){
                setErrorMessage('Invalid email or password');
            }
        } catch (error) {
            console.error('login failed: ', error);
            setErrorMessage('Invalid email or password');
        }finally {
            setIsLoading(false);
        }
    };

    const handleRegister = () => {
        navigate('/register');
    };

    return (
        <div className="login-page">
            <div className="login-container">
            <img src={logo} alt="Logo" className="logo" />
                <h2>Login to your account</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
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
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {isLoading && <LoadingSpinner />}
                {<button onClick={handleRegister}>Register</button>}
            </div>
        </div>
    );
};

export default LoginPage;
