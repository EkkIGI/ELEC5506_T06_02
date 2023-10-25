// Importing the NavBar component for navigation
import { NavBar } from '../NavBar';

// Importing React Router hooks for programmatic navigation and access to the current location state
import { useNavigate, useLocation } from 'react-router-dom';

// Importing Jotai hook for accessing atom state
import { useAtomValue } from 'jotai';

// Importing the userAtom from the store to manage user state
import { userAtom } from '../store';

// Importing React hooks for state and lifecycle management
import { useEffect, useState } from 'react';

// Importing the API client for making HTTP requests
import { client } from '../client';

// Importing CSS styles for the DeviceForm component
import './form.css';

// Defining the DeviceForm functional component
export const DeviceForm = () => {
    // Creating a navigate function to programmatically navigate between routes
    const navigate = useNavigate();

    // Accessing the current user state from userAtom
    const userAtomState = useAtomValue(userAtom);

    // Redirecting to login page if user is not logged in
    if (!userAtomState.isLoggedIn) {
        navigate("/login");
    }

    // Accessing the current location state
    const location = useLocation();

    // Retrieving the device information passed via the state (if any)
    const userState = location.state;
    console.log("userstate", userState);

    // State to store and manage the device information in the form
    const [deviceInformation, setDeviceInformation] = useState({
        deviceId: "",
        deviceName: "",
        type: "",
        MAC: "",
        Parent: ""
    });

    // Effect hook to set deviceInformation state when userState changes (typically on component mount)
    useEffect(() => {
        console.log("running");
        if (!userState) {
            return;
        }
        setDeviceInformation(userState);
    }, [userState]);

    // Function to handle form submission
    const onSubmit = async () => {
        // Making an HTTP POST request to add or update device information
        await client.post("/device/addUpdate", {
            ...deviceInformation
        });
    };

    // Rendering the DeviceForm component
    return (
        <>
            {/* Displaying NavBar component */}
            <NavBar />

            {/* Main content of the DeviceForm page */}
            <main className='form-main-content'>
                <h1 style={{ "paddingLeft": "10px" }}>{userState === null ? "Create " : "Edit "} Device</h1>
                <form id="device-form">
                    {/* Hidden input to store the device ID (not currently used) */}
                    <input type="hidden" id="device-id" name="id" value="123" />

                    {/* Form fields for device information */}
                    <div className="form_line">
                        <div className="form_element">
                            <label htmlFor="name">Name:</label>
                        </div>
                        <div className="form_element">
                            <input type="text" id="name" name="name" value={deviceInformation.deviceName} onChange={(event) => { setDeviceInformation((oldInfo) => ({ ...oldInfo, deviceName: event.target.value })); }} required />
                        </div>
                    </div>

                    <div className="form_line">
                        <div className="form_element">
                            <label htmlFor="type">Type:</label>
                        </div>
                        <div className="form_element">
                            <select id="type" name="type" value={deviceInformation.type} onChange={(event) => { setDeviceInformation((oldInfo) => ({ ...oldInfo, type: event.target.value })); }} required>
                                <option value="RS232">RS232</option>
                                <option value="USB">USB</option>
                                <option value="Interlock">Interlock</option>
                                <option value="Gateway">Gateway</option>
                            </select>
                        </div>
                    </div>

                    <div className="form_line">
                        <div className="form_element">
                            <label htmlFor="mac">MAC Address:</label>
                        </div>
                        <div className="form_element">
                            <input type="text" id="mac" name="mac" value={deviceInformation.MAC} onChange={(event) => { setDeviceInformation((oldInfo) => ({ ...oldInfo, MAC: event.target.value })); }} required />
                        </div>
                    </div>

                    <div className="form_line">
                        <div className="form_element">
                            <label htmlFor="parent">Parent Device:</label>
                        </div>
                        <div className="form_element">
                            <input type="text" id="parent" name="parent" value={deviceInformation.Parent} onChange={(event) => { setDeviceInformation((oldInfo) => ({ ...oldInfo, Parent: event.target.value })); }} required />
                        </div>
                    </div>

                    {/* Submit button for the form */}
                    <div className="form_line" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <button type="submit" onClick={() => { onSubmit() }}>{userState === null ? "Create " : "Update "} Device</button>
                    </div>
                </form>
            </main>
        </>
    );
};
