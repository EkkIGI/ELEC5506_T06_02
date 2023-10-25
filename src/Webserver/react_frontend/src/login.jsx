// Importing the useState hook from React for managing component state.
import { useState } from 'react';

// Importing the useAtom hook from jotai for state management across components.
import { useAtom } from 'jotai';

// Importing the useNavigate hook from react-router-dom for programmatic navigation.
import { useNavigate } from 'react-router-dom';

// Importing the pre-configured axios client for making HTTP requests.
import { client } from './client.js';

// Importing the user state atom from the store.
import { userAtom } from './store.jsx';

// Importing CSS styles.
import './login.css';
import './index.css';

// Defining the Login component.
function Login() {
  // Connecting to the userAtom state and getting the function to update it.
  const [userAtomState, setAtomState ] = useAtom(userAtom);

  // Creating a navigate function to programmatically navigate between routes.
  const navigate = useNavigate();

  // Setting up a state variable to store user input for username and password.
  const [userDetails, setUserDetails] = useState({ userName: "", password: "" });

  // Setting up a state variable to manage error messages.
  const [errorMessage, setError] = useState(false);

  // Redirecting to the home page if the user is already logged in.
  if(userAtomState.isLoggedIn){
    return navigate("/");
  }

  // Defining the login function to authenticate the user.
  const login = () => {
    // Making a POST request to authenticate the user.
    client.post("/authenticate_user_online", {
      username : userDetails.userName,
      provided_password : userDetails.password
    }).then((response) => {
      // Extracting the isAdmin and isLoggedIn flags from the server response.
      const isAdmin = response.data.isAdmin; 
      const isLoggedIn = response.data.isLoggedIn; 
      
      // Updating the user state in the global state.
      setAtomState({ isLoggedIn: isLoggedIn, isAdmin : isAdmin });

      // Redirecting to the home page after successful login.
      navigate("/");

      // If login is not successful, setting the error state to true.
      if (!isLoggedIn) {
        setError(true);
      }
    }).catch((error) => {
      // Logging the error and setting the error state to true in case of a network or server error.
      console.error(error);
      setError(true);
    });
  };

  // Rendering the login form.
  return (
    <>
      <div className="login-container">
        <h1>ANFF Webserver Login</h1>
        <form>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required onChange={(event) => setUserDetails((oldValue) => {return { ...oldValue, userName: event.target.value}})}/>
          
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required onChange={(event) => setUserDetails((oldValue) => {return { ...oldValue, password: event.target.value}})}/>
          
          <button type="submit" onClick={(e) => { e.preventDefault(); login(); }}>Login</button>
        </form>
        {errorMessage && <div id="errorMessage" className="errorMessage">
            Invalid Login
        </div>}
      </div>  
    </>
  );
}

// Exporting the Login component as the default export.
export default Login;
