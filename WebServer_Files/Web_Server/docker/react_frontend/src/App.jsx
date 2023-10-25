import { useState } from 'react'
import Login from './login.jsx'
import './index.css'
import { Users } from './users/Users.jsx'
import { Devices } from './devices/Devices.jsx'
import { Data } from './data/Data.jsx'
import { Home } from './home/Home.jsx'
import { Access } from './access/Access.jsx'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { NavBar } from './NavBar.jsx'
import { UserForm } from './forms/UserForm.jsx'
import { DeviceForm } from './forms/DeviceForm.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/login",
    element: <Login/>,
  },
  {
    path: "/users",
    element: <Users/>
  },
  {
    path: "/devices",
    element: <Devices/>
  },
  {
    path: "/data",
    element: <Data />
  },

  {
    path: "/access",
    element: <Access />
  },
  {
    path: "/user-form",
    element: <UserForm />
  },
  {
    path: "/device-form",
    element: <DeviceForm />
  }
]);

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
