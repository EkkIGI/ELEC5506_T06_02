// Importing the CSS file for styling.
import './access.css'

// Importing the NavBar component.
import { NavBar } from '../NavBar'

// Importing the useNavigate hook from react-router-dom for programmatically navigating between routes.
import { useNavigate } from 'react-router-dom'

// Importing the useAtomValue hook from jotai for accessing the value of an atom without re-rendering when the atom changes.
import { useAtomValue } from 'jotai'

// Importing the userAtom atom from the store file.
import { userAtom } from '../store'

// Importing the useEffect and useState hooks from React.
import { useEffect, useState } from 'react'

// Importing the client instance configured for making HTTP requests.
import { client } from '../client'

// Defining the Access component.
export const Access = () => {
    // Getting the navigate function for programmatically navigating between routes.
    const navigate = useNavigate();

    // Getting the userState atom value.
    const userState = useAtomValue(userAtom);

    // useEffect hook to redirect to login page if user is not logged in.
    useEffect(() => {
        if (!userState.isLoggedIn) {
            navigate("/login");
        }
    }, [userState.isLoggedIn, navigate]);

    // State to store the original access logs and setting initial dummy data.
    const [originalAccessLogs, setOriginalAccessLogs] = useState(
        [
            { logId: "4", user: "Michal", device: "Hot Oven #1", time: "2:20PM 21.10.23", selected: false },
            { logId: "3", user: "Dilusha", device: "Dangerous Device #2", time: "9:10AM 20.10.23", selected: false },
            { logId: "2", user: "Michal", device: "Dangerous Device #1", time: "12:20PM 19.10.23", selected: false },
            { logId: "1", user: "Jega", device: "Hot Oven #1", time: "9:10AM 19.10.23", selected: false },
        ]
    )
    // State to store the current access logs displayed on the page, initially set to the same dummy data.
    const [accessLogs, setAccessLogs] = useState(
        [
            { logId: "4", user: "Michal", device: "Hot Oven #1", time: "2:20PM 21.10.23", selected: false },
            { logId: "3", user: "Dilusha", device: "Dangerous Device #2", time: "9:10AM 20.10.23", selected: false },
            { logId: "2", user: "Michal", device: "Dangerous Device #1", time: "12:20PM 19.10.23", selected: false },
            { logId: "1", user: "Jega", device: "Hot Oven #1", time: "9:10AM 19.10.23", selected: false },
        ]
    )
    // Function to get access logs data from the server.
    const getData = async () => {
        await client.get('/get_usage').then((data) => {
            // Transforming the server response to the format required for the component state.
            const logs = data.data.map((log) => ({ 
                logId: log.usage_log_id, 
                user: log.user_id, 
                device: log.device_id, 
                time: log.in_time, 
                selected: false 
            }));
            // Setting the transformed data to both original and current logs state.
            setOriginalAccessLogs(logs);
            setAccessLogs(logs);
        });
    };

    // useEffect hook to call the getData function when the component mounts.
    useEffect(() => {
        getData();
    }, []);

    // Function to set the selected status of an access log entry.
    const setSelected = (logId, isChecked) => {
        setAccessLogs((oldLogs) => {
            return oldLogs.map((log) => (
                log.logId === logId || logId === "" ? { ...log, selected: isChecked } : log
            ));
        });
    };

    // Function to handle the download action.
    const download = () => {
        // Dummy download functionality, logs selected access logs to console.
        console.log(accessLogs.filter((log) => log.selected).map((log) => `${log.logId}, ${log.device} \n`).toString());
    };

    // Function to handle the delete selected action.
    const deleteSelected = async () => {
        // Filtering out the selected logs from the original and current logs state.
        const filteredLogs = originalAccessLogs.filter((log) => !log.selected);
        setOriginalAccessLogs(filteredLogs);
        setAccessLogs(filteredLogs);
        
        // Sending a request to delete the selected logs on the server.
        await client.post("/delete_usage_log", {
            p_usage_log_id : accessLogs.filter((log) => log.selected).map((log) => log.logId)
        });
    };

    // JSX to render the Access component.
    return (
        <>
            <NavBar />
            <main className='main-content'>
                <h1>Access Logs</h1>
                <div className='filter'>
                    {/* Filters for searching by username and device */}
                </div>
                <section className="access">
                    <div className="actions">
                        {/* Buttons for delete and download actions */}
                    </div>
                    {originalAccessLogs.length > 0 && (
                        <table className="sortable">
                            {/* Table header */}
                            <thead>
                                {/* Header row */}
                            </thead>
                            {/* Table body */}
                            <tbody>
                                {accessLogs.map((log) => (
                                    {/* Rows representing access logs */}
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </main>
        </>
    )
}
