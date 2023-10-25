// Importing CSS styles for the Home component.
import './home.css';

// Importing the NavBar component for navigation.
import { NavBar } from '../NavBar';

// Importing React Router hook for programmatic navigation.
import { useNavigate } from 'react-router-dom';

// Importing Jotai hook for accessing atom state.
import { useAtomValue } from 'jotai';

// Importing the userAtom from the store to manage user state.
import { userAtom } from '../store';

// Importing React hooks for state and lifecycle management.
import { useEffect, useState } from 'react';

// Defining the Home functional component.
export const Home = () => {
    // Creating a navigate function to programmatically navigate between routes.
    const navigate = useNavigate();

    // Accessing the current user state from userAtom.
    const userState = useAtomValue(userAtom);

    // Redirecting to login page if user is not logged in.
    if (!userState.isLoggedIn) {
        return navigate("/login");
    }

    // State to store device logs. This can be initialised as empty is fetching data from server, currently using the following example data set.
    const [deviceLogs, setDeviceLogs] = useState([
        { name: "SQM #2", type: "RS232", time: "2:20PM 21.10.23" },
        { name: "Lab PC #2", type: "USB", time: "10:30AM 21.10.23" },
        { name: "Lab PC #2", type: "USB", time: "2:20PM 20.10.23" },
        { name: "SQM #1", type: "RS232", time: "2:20PM 19.10.23" }
    ]);

    // State to store access logs. This can be initialised as empty is fetching data from server, currently using the following example data set.
    const [accessLogs, setAccessLogs] = useState([
        { user: "Michal", device: "Hot Oven #1", time: "2:20PM 21.10.23"},
        { user: "Dilusha", device: "Dangerous Device #2", time: "9:10AM 20.10.23"},
        { user: "Michal", device: "Dangerous Device #1", time: "12:20PM 19.10.23"},
        { user: "Jega", device: "Hot Oven #1", time: "9:10AM 19.10.23"}
    ]);

    // Uncomment this code to implement fetching the data from the server backend, which is currently not in use.
    // const getData = async () => {
    //     await client.get('/getDeviceHomeLogs').then((data) => {
    //         const deviceLogs = data.data.map((devices) => { return { logId: log.usage_log_id, device: log.deviceid, } }) //CHANGE THE MAPPING FUNCTION
    //         setDeviceLogs(devices)
    //     })
    //     await client.get('/getAccessHomeLogs').then((data) => {
    //         const accessLogs = data.data.map((devices) => { return { logId: log.usage_log_id, device: log.deviceid, } }) //CHANGE THE MAPPING FUNCTION
    //         setAccessLogs(devices)
    //     })
    // }

    // Effect hook to set deviceLogs state when deviceLogs state changes.
    useEffect(() => {
        setDeviceLogs(deviceLogs);
    }, [deviceLogs]);

    // Effect hook to set accessLogs state when accessLogs state changes.
    useEffect(() => {
        setAccessLogs(accessLogs);
    }, [accessLogs]);

    // Logging device logs and access logs to the console.
    console.log(deviceLogs);
    console.log(accessLogs);

    // Rendering the Home component.
    return (
        <>
            {/* Displaying NavBar component */}
            <NavBar />

            {/* Main content of the Home page */}
            <main className='main-content'>
                <h1>Dashboard</h1>
                <h2>Recent Logs</h2>
                <section>
                    {/* Table to display device logs */}
                    <table>
                        <thead>
                            <tr>
                                <th>Device</th>
                                <th>Type</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deviceLogs.map((log) => (
                                <tr key={log.time + log.name}>
                                    <td>{log.name}</td>
                                    <td>{log.type}</td>
                                    <td>{log.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                <h2>Recent Access</h2>
                <section>
                    {/* Table to display access logs */}
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Device</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accessLogs.map((log) => (
                                <tr key={log.time + log.user}>
                                    <td>{log.user}</td>
                                    <td>{log.device}</td>
                                    <td>{log.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>
        </>
    );
};
