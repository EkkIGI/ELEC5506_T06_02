import './access.css'
import { NavBar } from '../NavBar'
import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { userAtom } from '../store'
import { useEffect, useState } from 'react'
import { client } from '../client'

export const Access = () => {

    const navigate = useNavigate();
    const userState = useAtomValue(userAtom);
    useEffect(() => {
        if (!userState.isLoggedIn) {
            navigate("/login");
        }
    }, [userState.isLoggedIn, navigate]);

    const [originalAccessLogs, setOriginalAccessLogs] = useState(
        [
            { logId: "123", user: "Test", device: "Test 1", time: "", selected: false },
            { logId: "124", user: "Test 2", device: "Test 2", time: "", selected: false },
        ]
    )
    const [accessLogs, setAccessLogs] = useState(
        [
            { logId: "123", user: "Test", device: "Test 1", time: "", selected: false },
            { logId: "124", user: "Test 2", device: "Test 2", time: "", selected: false },
        ]
    )

    // {
    //     "usage_log_id": 0,
    //     "userid": 0,
    //     "in_time": "string",
    //     "out_time": "string",
    //     "access_status": true,
    //     "device_id": 0
    //   }

    const getData = async () => {
        await client.get('/get_usage').then((data) => {
            const logs = data.data.map((log) => { return { logId: log.usage_log_id, user: log.user_id, device: log.device_id, time: log.in_time, selected: false } })
            setOriginalAccessLogs(logs)
            setAccessLogs(logs)
        })
    }

    useEffect(() => {
        async () => {
            await getData()
        }
    }, [])

    const setSelected = (logId, isChecked) => {
        setAccessLogs((oldLogs) => {
            return oldLogs.map((log) => {
                return log.logId === logId || logId === "" ? { ...log, selected: isChecked } : log
            })
        })
    }

    const download = () => {
        //REACT DOWNLOAD
        console.log(accessLogs.filter((log) => log.selected).map((log) => `${log.logId}, ${log.device} \n`).toString())
    }

    const deleteSelected = async () => {
        setOriginalAccessLogs((oldLogs) => oldLogs.filter((log) => !log.selected))
        setAccessLogs((oldLogs) => oldLogs.filter((log) => !log.selected))
        await client.post("/delete_usage_log", {
            p_usage_log_id : accessLogs.filter((log) => !log.selected).map((log)=> log.logId)
        })
        .then((data) => {
        setOriginalAccessLogs((oldLogs) => oldLogs.filter((log) => !log.selected))
             setAccessLogs((oldLogs) => oldLogs.filter((log) => !log.selected))
         })
    }

    return (
        <>
            <NavBar />
            <main className='main-content'>
            <h1>Access Logs</h1>
            <div className='filter'>
                <div className="filter-item">
                    <label for="user-search" style={{ "gridColumn": 1,  "padding": "5px 10px 5px" }}>Search by Username:</label>
                    <input type="text" style={{"padding" : "2px 2px 2px"}} id="user-search" onChange={(event) => setAccessLogs(originalAccessLogs.filter((log) => log.user.includes(event.target.value)))} />
                </div>
                <div className="filter-item">
                    <label for="device-search" style={{"gridColumn": 2, "padding": "5px 10px 5px"}}>Search by Device:</label>
                    <input type="text" style={{"padding" : "2px 2px 2px"}} id="device-search" onChange={(event) => setAccessLogs(originalAccessLogs.filter((log) => log.device.includes(event.target.value)))} />
                </div>
            </div>
            <section className="access">
                <div className="actions">
                    <button id="delete" onClick={ () => deleteSelected()}>Delete</button>
                    <button id="download" onClick={download}>Download</button>
                </div>
                {originalAccessLogs.length > 0 &&
                    <table className="sortable">
                        <thead>
                            <tr>
                                <th><input type="checkbox" id="selectAll" onChange={(event) => setSelected("", event.target.checked)} /></th>
                                <th data-column="id">ID</th>
                                <th data-column="user">User</th>
                                <th data-column="device">Device</th>
                                <th data-column="time">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accessLogs.map((log) => {
                                console.log(log.logId, log.selected)
                                return (
                                    <tr>
                                        <td><input type="checkbox" className="data-log-checkbox" checked={log.selected} onChange={(event) => setSelected(log.logId, event.target.checked)} /></td>
                                        <td>{log.logId}</td>
                                        <td className="user-cell">{log.user}</td>
                                        <td className="device-cell">{log.device}</td>
                                        <td className="time-cell">{log.time}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>}
            </section>
        </main>
        </>
    )
}