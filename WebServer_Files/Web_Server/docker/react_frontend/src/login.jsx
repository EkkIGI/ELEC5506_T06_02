import { useState } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { client } from './client.js';
import { userAtom } from './store.jsx';
import './login.css';
import './index.css';

function Login() {
  const [userAtomState, setAtomState ] = useAtom(userAtom) 

  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ userName: "", password: "" });
  const [errorMessage, setError] = useState(false);

  if(userAtomState.isLoggedIn){
    return navigate("/")
  }


  const login = () => {
    client.post("/authenticate_user_online", {
      username : userDetails.userName,
      provided_password : userDetails.password
    }).then((response) => {
      const isAdmin = response.data.isAdmin; // Assuming the server responds with isAdmin property
      const isLoggedIn = response.data.isLoggedIn; //Assuming the server responds with isLoggedIn property
      setAtomState({ isLoggedIn: isLoggedIn, isAdmin : isAdmin })
      navigate("/");
      if (!isLoggedIn) {
        setError(true);
      }
    }).catch((error) => {
      console.error(error);
      setError(true);
    });
  };

  return (
  <>
    <div className="login-container">
      <h1>ANFF Webserver Login</h1>
      <form>
          <label for="username">Username</label>
          <input type="text" id="username" name="username" required onChange={(event) => setUserDetails((oldValue) => {return { ...oldValue, userName: event.target.value}})}/>
          
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required onChange={(event) => setUserDetails((oldValue) => {return { ...oldValue, password: event.target.value}})}/>
          
          <button type="submit" onClick={()=> login()}>Login</button>
      </form>
      {errorMessage && <div id="errorMessage" className="errorMessage">
          Invalid Login
      </div>}
    </div>  
  </>
  );
}

export default Login;
