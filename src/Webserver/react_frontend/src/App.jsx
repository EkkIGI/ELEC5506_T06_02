// Importing the useState hook from React, used for managing state within functional components.
import { useState } from 'react';

// Importing various components used in this application.
import Login from './login.jsx'; // Login component for authentication.
import './index.css'; // Importing global CSS styles.
import { Users } from './users/Users.jsx'; // Users component for user-related functionality.
import { Devices } from './devices/Devices.jsx'; // Devices component for device-related functionality.
import { Data } from './data/Data.jsx'; // Data component for data-related functionality.
import { Home } from './home/Home.jsx'; // Home component, likely the landing page of the application.
import { Access } from './access/Access.jsx'; // Access component, possibly related to access control.

// Importing utilities from react-router-dom for routing.
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// Importing the NavBar component, likely a component that provides navigation links.
import { NavBar } from './NavBar.jsx';

// Importing forms for users and devices.
import { UserForm } from './forms/UserForm.jsx'; // Form for user-related actions.
import { DeviceForm } from './forms/DeviceForm.jsx'; // Form for device-related actions.

// Creating a router object, configuring the routes and corresponding components for the application.
const router = createBrowserRouter([
  { path: "/", element: <Home /> }, // Route for the home/landing page.
  { path: "/login", element: <Login/> }, // Route for the login page.
  { path: "/users", element: <Users/> }, // Route for the users page.
  { path: "/devices", element: <Devices/> }, // Route for the devices page.
  { path: "/data", element: <Data /> }, // Route for the data page.
  { path: "/access", element: <Access /> }, // Route for the access page.
  { path: "/user-form", element: <UserForm /> }, // Route for the user form page.
  { path: "/device-form", element: <DeviceForm /> } // Route for the device form page.
]);

// Defining the main App component.
function App() {
  // Rendering the application with the configured router.
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

// Exporting the App component to be used in other parts of the application, like index.js for rendering.
export default App;
