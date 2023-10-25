// Importing the NavBar component for navigation
import { NavBar } from '../NavBar'

// Importing React Router hooks for programmatic navigation and access to the current location state
import { useNavigate, useLocation } from 'react-router-dom'

// Importing Jotai hook for accessing atom state
import { useAtomValue } from 'jotai'

// Importing the userAtom from the store to manage user state
import { userAtom } from '../store';

// Importing React hooks for state and lifecycle management
import { useEffect, useState } from 'react'

// Importing the API client for making HTTP requests
import { client } from '../client'

// Importing CSS styles for the UserForm component
import './form.css'

// Defining the UserForm functional component
export const UserForm = () => {
    // Creating a navigate function to programmatically navigate between routes
    const navigate = useNavigate()

    // Accessing the current user state from userAtom
    const userAtomState = useAtomValue(userAtom);

    // Redirecting to login page if user is not logged in
    if (!userAtomState.isLoggedIn) {
        navigate("/login");
    }

    // Accessing the current location state
    const location = useLocation();

    // Retrieving the user information passed via the state (if any)
    const userState = location.state;
    console.log("userstate", userState)

    // State to store and manage the user information in the form
    const [ userInformation, setUserInformation] = useState({
        id: "", username: "", password: "", rfid: "", associatedDevices: [""], accessLevel: ""
    })

    // Function to handle changes in the associated devices select element
    const handleSelectChange = (event) => {
        // Convert the NodeList to an array and filter for only the selected options
        const selected = Array.from(event.target.options)
                          .filter(option => option.selected)
                          .map(option => option.value);
        setUserInformation((oldInfo) => ({ ...oldInfo, associatedDevices:selected}));
    }

    // Effect hook to set userInformation state when userState changes (typically on component mount)
    useEffect(() => {
        console.log("running")
        if (!userState) {
            return
        }
        setUserInformation({
            id: userState.userId,
            username: userState.userName,
            accessLevel: userState.level
        })
    }, [userState])

    // Function to handle form submission
    const onSubmit = async () => {
        await client.post("/user/addUpdate",
        {
            ...userInformation
        })
    }

    // Rendering the UserForm component
    return (
        <>
            {/* Displaying NavBar component */}
            <NavBar />
            
            {/* Main content of the UserForm page */}
            <main className='form-main-content'>
                <h1 style={{"paddingLeft": "10px"}}>{userState === null ? "Create " : "Edit "} User</h1>
                <form id="edit-user-form">
                    {/* Hidden input to store the user ID (not currently used) */}
                    <input type="hidden" id="user-id" name="id" value="123" />

                    {/* Form fields for user information */}
                    <div className="form_line">
                        <div className="form_element">
                            <label htmlFor="username">Username:</label>
                        </div>
                        <div className="form_element">
                            <input type="text" id="username" name="username" value={userInformation.username} onChange={(event)=> {setUserInformation((oldInfo) => ({...oldInfo, username: event.target.value}))}} required />
                        </div>
                    </div>
                    <div className="form_line">
                        <div className="form_element">
                            <label htmlFor="password">Password:</label>
                        </div>
                        <div className="form_element">
                            <input type="password" id="password" name="password" value={userInformation.password} onChange={(event)=> {setUserInformation((oldInfo) => ({...oldInfo, password: event.target.value}))}} required />
                        </div>
                    </div>
                    <div className="form_line">
                        <div className="form_element">
                            <label htmlFor="rfid">RFID:</label>
                        </div>
                        <div className="form_element">
                            <input type="text" id="rfid" name="rfid" value={userInformation.rfid} onChange={(event)=> {setUserInformation((oldInfo) => ({...oldInfo, rfid: event.target.value}))}} required />
                        </div>
                    </div>
                    <div className="form_line">
                        <div className="form_element">
                            <label htmlFor="associated-devices">Associated Devices:</label>
                        </div>
                        <div className="form_element">
                            <select id="associated-devices" name="associated-devices[]" value={userInformation.associatedDevices} onChange={handleSelectChange} multiple required>
                                <option value="device1">Device 1</option>
                                <option value="device2">Device 2</option>
                            </select>
                        </div>
                    </div>
                    <div className="form_line">
                        <div className="form_element">
                            <label htmlFor="access-level">Access Level:</label>
                        </div>
                        <div className="form_element">
                            <select id="access-level" name="access-level" value={userInformation.accessLevel} onChange={(event)=> {setUserInformation((oldInfo) => ({...oldInfo, accessLevel: event.target.value}))}} required>
                                <option value="Admin">Admin</option>
                                <option value="User">User</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit button for the form */}
                    <div className="form_line" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <button type="submit" onClick={() => { onSubmit() }}>{userState === null ? "Create " : "Update "} User</button>
                    </div>
                </form>
            </main>
        </>
    )
}
