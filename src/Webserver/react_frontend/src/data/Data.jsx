// Importing required CSS for styling
import './data.css'

// Importing NavBar component for navigation
import { NavBar } from '../NavBar'

// React Router hook for programmatic navigation
import { useNavigate } from 'react-router-dom'

// Atom value hook from Jotai for state management
import { useAtomValue } from 'jotai'

// Importing user atom for authentication state management
import { userAtom } from '../store'

// React hooks for side effects and state management
import { useEffect, useState } from 'react'

// Importing configured Axios client for API requests
import { client } from '../client'

export const Data = () => {
    // Hook for programmatic navigation
    const navigate = useNavigate();

    // Accessing user's authentication state
    const userState = useAtomValue(userAtom);

    // Redirecting to login page if user is not logged in
    useEffect(() => {
        if (!userState.isLoggedIn) {
            navigate("/login");
        }
    }, [userState.isLoggedIn, navigate]);

    // State for storing original logs and filtered logs
    const [originalDataLogs, setOriginalDataLogs] = useState(
        // Dummy data for initial rendering
        [
            { logId: "4", device: "SQM #2", type: "RS232", time: "2:20PM 21.10.23", selected: false },
            { logId: "3", device: "Lab PC #2", type: "USB", time: "10:30AM 21.10.23", selected: false },
            { logId: "2", device: "Lab PC #2", type: "USB", time: "2:20PM 20.10.23", selected: false },
            { logId: "1", device: "SQM #1", type: "RS232", time: "2:20PM 19.10.23", selected: false },
        ]
    )
    const [DataLogs, setDataLogs] = useState(originalDataLogs)

    // Function to fetch data logs from the server
    const getData = async () => {
        await client.post('/get_logs_with_device_type').then((data) => {
            // Mapping response data to required format and updating state
            const logs = data.data.map((log) => { return { logId: log.log_id, device: log.device_id, type: log.device_type, time: "Today", selected: false} })
            setOriginalDataLogs(logs)
            setDataLogs(logs)
        })
    }

    // Side effect for fetching data logs on component mount
    useEffect(() => {
        async () => {
            await getData()
        }
    }, [])

    // Function to set selected state for a log
    const setSelected = (logId, isChecked) => {
        setDataLogs((oldLogs) => {
            return oldLogs.map((log) => {
                return log.logId === logId || logId === "" ? { ...log, selected: isChecked } : log
            })
        })
    }

    // Function to handle download action
    const download = () => {
        // Console log selected logs' data. This should be replaced with actual download logic.
        console.log(DataLogs.filter((log) => log.selected).map((log) => `${log.logId}, ${log.device} \n`).toString())
    }

    // Function to handle deletion of selected logs
    const deleteSelected = async () => {
        // Updating state to remove selected logs
        setOriginalDataLogs((oldLogs) => oldLogs.filter((log) => !log.selected))
        setDataLogs((oldLogs) => oldLogs.filter((log) => !log.selected))

        // Sending delete request to the server
        await client.post("/delete_log", {
            p_log_id: DataLogs.filter((log) => !log.selected).map((log)=> log.logId)
        })
        .then((data) => {
            // Updating state again to ensure consistency
            setOriginalDataLogs((oldLogs) => oldLogs.filter((log) => !log.selected))
            setDataLogs((oldLogs) => oldLogs.filter((log) => !log.selected))
        })
    }

    // JSX for rendering the component
    return (
        <>
            {/* Navigation Bar */}
            <NavBar />

            {/* Main content area */}
            <main className='main-content'>

                {/* Page heading */}
                <h1>Data Logs</h1>

                {/* Filtering section */}
                <div className='filter'>
                    {/* Filter by device name */}
                    <div className="filter-item">
                        <label htmlFor="device-search" style={{ "gridColumn": 1,  "padding": "5px 10px 5px" }}>Search by Device Name:</label>
                        <input type="text" style={{"padding" : "2px 2px 2px"}} id="device-search" onChange={(event) => setDataLogs(originalDataLogs.filter((log) => log.device.includes(event.target.value)))} />
                    </div>
                    
                    {/* Filter by device type */}
                    <div className="filter-item">
                        <label htmlFor="type-search" style={{"gridColumn": 2, "padding": "5px 10px 5px"}}>Search by Device Type:</label>
                        <input type="text" style={{"padding" : "2px 2px 2px"}} id="type-search" onChange={(event) => setDataLogs(originalDataLogs.filter((log) => log.type.includes(event.target.value)))} />
                    </div>
                </div>

                {/* Data logs section */}
                <section className="data">

                    {/* Action buttons */}
                    <div className="actions">
                        {/* Delete selected logs */}
                        <button id="delete" onClick={ () => deleteSelected()}>Delete</button>
                        
                        {/* Download selected logs */}
                        <button id="download" onClick={download}>Download</button>
                    </div>

                    {/* Check if there are logs to display */}
                    {originalDataLogs.length > 0 &&
                        <table className="sortable">
                            <thead>
                                <tr>
                                    <th>
                                        {/* Select all checkbox */}
                                        <input type="checkbox" id="selectAll" onChange={(event) => setSelected("", event.target.checked)} />
                                    </th>
                                    <th data-column="id">ID</th>
                                    <th data-column="device">Device</th>
                                    <th data-column="type">Type</th>
                                    <th data-column="time">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Map through logs and display them */}
                                {DataLogs.map((log) => (
                                    <tr key={log.logId}>
                                        <td><input type="checkbox" className="data-log-checkbox" checked={log.selected} onChange={(event) => setSelected(log.logId, event.target.checked)} /></td>
                                        <td>{log.logId}</td>
                                        <td className="device-cell">{log.device}</td>
                                        <td className="type-cell">{log.type}</td>
                                        <td className="time-cell">{log.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>}
                </section>
            </main>
        </>
    )
