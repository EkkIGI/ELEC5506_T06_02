// Importing the CSS file for styling the Devices component.
import './devices.css';

// Importing the NavBar component from the parent directory.
import { NavBar } from '../NavBar';

// Importing the useState and useEffect hooks from React.
import { useState, useEffect } from 'react';

// Importing the useNavigate hook from react-router-dom for programmatic navigation.
import { useNavigate } from 'react-router-dom';

// Importing the useAtomValue hook from jotai for accessing the state in the atom.
import { useAtomValue } from 'jotai';

// Importing the userAtom from the store file in the parent directory.
import { userAtom } from '../store';

// Creating the Devices functional component.
export const Devices = () => {
    // Using the useNavigate hook for programmatic navigation.
    const navigate = useNavigate();

    // Accessing the user's login state using the useAtomValue hook.
    const userAtomState = useAtomValue(userAtom);

    // Defining the state for the original list of devices. This can be initialised as empty is fetching data from server, currently using the following example data set.
    const [originalDevices, setOriginalDevices] = useState([
        // A predefined list of devices. 
        { deviceId: "1", deviceName: "Gateway #1", type: "Gateway", MAC: "0013A200423D8A1A", Parent: "Webserver"},
        { deviceId: "2", deviceName: "Hot Oven #1", type: "Interlock", MAC: "0013A200423D8A1B", Parent: "Gateway #1"},
        { deviceId: "3", deviceName: "USB Logger #1", type: "USB", MAC: "0013A200423D8A1C", Parent: "Gateway #1"},
        { deviceId: "4", deviceName: "RS232 Logger #1", type: "RS232", MAC: "0013A200423D8A1D", Parent: "Gateway #1"},
        { deviceId: "5", deviceName: "Hot Oven #1 Switch", type: "Switch", MAC: "0013A200423D8A1F", Parent: "Hot Oven #1"},
    ]);

    // Defining the state for the displayed list of devices. This can be initialised as empty is fetching data from server, currently using the following example data set.
    const [devices, setDevices] = useState(
        [
            { deviceId: "1", deviceName: "Gateway #1", type: "Gateway", MAC: "0013A200423D8A1A", Parent: "Webserver"},
            { deviceId: "2", deviceName: "Hot Oven #1", type: "Interlock", MAC: "0013A200423D8A1B", Parent: "Gateway #1"},
            { deviceId: "3", deviceName: "USB Logger #1", type: "USB", MAC: "0013A200423D8A1C", Parent: "Gateway #1"},
            { deviceId: "4", deviceName: "RS232 Logger #1", type: "RS232", MAC: "0013A200423D8A1D", Parent: "Gateway #1"},
            { deviceId: "5", deviceName: "Hot Oven #1 Switch", type: "Switch", MAC: "0013A200423D8A1F", Parent: "Hot Oven #1"},
        ]
    )

    // Defining the state for the selected device.
    const [selected, setSelected] = useState("");

    // Checking if the user is not logged in, then redirecting to the login page.
    if (!userAtomState.isLoggedIn) {
        return navigate("/login");
    }

    // Defining a function to get the devices data from the server.
    const getData = async () => {
        await client.get('/get_Devices').then((data) => {
            const devices = data.data.map((log) => {
                return {
                    deviceId: log.device_id,
                    deviceName: "TBC",
                    MAC: log.mac_address,
                    Parent: "TBC",
                    type: log.device_type
                };
            });
            setOriginalDevices(devices);
            setDevices(devices);
        });
    };

    // Using the useEffect hook to call the getData function when the component mounts.
    useEffect(() => {
        const fetchData = async () => {
            await getData();
        };
        fetchData();
    }, []);

    // Using the useEffect hook to reset the devices state when originalDevices changes.
    useEffect(() => {
        setDevices(originalDevices);
    }, [originalDevices]);

    // Defining a function to delete the selected device.
    const deleteSelected = async () => {
        // Updating the originalDevices state to remove the selected device.
        setOriginalDevices((oldDevices) => oldDevices.filter((device) => device.deviceId !== selected));

        // Sending a request to the server to delete the selected device.
        await client.post("/delete_device", {
            p_device_id: originalDevices.filter((device) => device.deviceId === selected).map((device) => device.deviceId)
        }).then((data) => {
            // Updating the originalDevices state again to ensure the selected device is removed.
            setOriginalDevices((oldDevices) => oldDevices.filter((device) => device.deviceId !== selected));
        });
    };

    // Logging the devices state for debugging purposes.
    console.log(devices);

    // Rendering the Devices component.
    return (
        <>
            {/* Including the navigation bar component */}
            <NavBar />
            
            {/* Main content area */}
            <main className='main-content'>
                
                {/* Heading for the Devices page */}
                <h1>Devices</h1>
                
                {/* Filtering section */}
                <div className='filter'>
                    
                    {/* Filter item for searching devices by name */}
                    <div className="filter-item">
                        <label htmlFor="device-search" style={{ "gridColumn": 1, "padding": "5px 10px 5px" }}>Search by Name:</label>
                        <input type="text" style={{ "padding": "2px 2px 2px" }} id="device-search" onChange={(event) => setDevices(originalDevices.filter((device) => device.deviceName.includes(event.target.value)))} />
                    </div>
                    
                    {/* Filter item for searching devices by type */}
                    <div className="filter-item">
                        <label htmlFor="type-search" style={{ "gridColumn": 2, "padding": "5px 10px 5px" }}>Search by Type:</label>
                        <input type="text" style={{ "padding": "2px 2px 2px" }} id="type-search" onChange={(event) => setDevices(originalDevices.filter((device) => device.type.includes(event.target.value)))} />
                    </div>
                </div>
                
                {/* Section for displaying the list of devices */}
                <section className="devices">
                    
                    {/* Action buttons for adding, editing, and deleting devices */}
                    <div className="actions">
                        <button id="add" onClick={() => navigate("/device-form")}>Add New</button>
                        <button id="edit" onClick={() => navigate("/device-form", { state: originalDevices.filter((device) => device.deviceId === selected)[0] })}>Edit</button>
                        <button id="delete" onClick={deleteSelected}>Delete</button>
                    </div>
                    
                    {/* Table for displaying the devices */}
                    <table className="sortable">
                        <thead>
                            <tr>
                                {/* Table headings */}
                                <th></th>
                                <th data-column="id">ID</th>
                                <th data-column="device">Device</th>
                                <th data-column="type">Type</th>
                                <th data-column="MAC">MAC</th>
                                <th data-column="parent">Parent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Mapping through the devices state to create table rows for each device */}
                            {devices.map((device) => (
                                <tr key={device.deviceId}>
                                    {/* Checkbox for selecting a device */}
                                    <td><input type="checkbox" className="data-log-checkbox" checked={device.deviceId === selected} onChange={() => setSelected(device.deviceId)} /></td>
                                    {/* Device details */}
                                    <td className="id-cell">{device.deviceId}</td>
                                    <td className="device-cell">{device.deviceName}</td>
                                    <td className="type-cell">{device.type}</td>
                                    <td className="MAC-cell">{device.MAC}</td>
                                    <td className="parent-cell">{device.Parent}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>
        </>
    )
    };