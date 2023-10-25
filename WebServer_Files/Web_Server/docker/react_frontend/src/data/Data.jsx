import './data.css'
import { NavBar } from '../NavBar'
import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { userAtom } from '../store'
import { useEffect, useState } from 'react'
import { client } from '../client'

export const Data = () => {
    const navigate = useNavigate();
    const userState = useAtomValue(userAtom);
    useEffect(() => {
        if (!userState.isLoggedIn) {
            navigate("/login");
        }
    }, [userState.isLoggedIn, navigate]);



    const [originalDataLogs, setOriginalDataLogs] = useState(
        [
            { logId: "123", device: "Test 1", type: "Test 1", time: "", selected: false },
            { logId: "123", device: "Test 2", type: "Test 2", time: "", selected: false },
        ]
    )
    const [DataLogs, setDataLogs] = useState(
        [
            { logId: "123", device: "Test 1", type: "Test 1", time: "", selected: false },
            { logId: "123", device: "Test 2", type: "Test 2", time: "", selected: false },
        ]
    )

    const getData = async () => {
        await client.post('/get_logs_with_device_type').then((data) => {
            const logs = data.data.map((log) => { return { logId: log.log_id, device: log.device_id, type: log.device_type, time: "Today", selected: false} })//Update JSON mapping
            setOriginalDataLogs(logs)
            setDataLogs(logs)
        })
    }

    useEffect(() => {
        async () => {
            await getData()
        }
    }, [])

    const setSelected = (logId, isChecked) => {
        setDataLogs((oldLogs) => {
            return oldLogs.map((log) => {
                return log.logId === logId || logId === "" ? { ...log, selected: isChecked } : log
            })
        })
    }

    const download = () => {
        //REACT DOWNLOAD
        console.log(DataLogs.filter((log) => log.selected).map((log) => `${log.logId}, ${log.device} \n`).toString())
    }

    const deleteSelected = async () => {
        setOriginalDataLogs((oldLogs) => oldLogs.filter((log) => !log.selected))
        setDataLogs((oldLogs) => oldLogs.filter((log) => !log.selected))
        await client.post("/delete_log", {
        p_log_id: DataLogs.filter((log) => !log.selected).map((log)=> log.logId)
        })
        .then((data) => {
        setOriginalDataLogs((oldLogs) => oldLogs.filter((log) => !log.selected))
        setDataLogs((oldLogs) => oldLogs.filter((log) => !log.selected))
        })
    }
    return (
        <>
            <NavBar />
            <main className='main-content'>
            <h1>Data Logs</h1>
            <div className='filter'>
                <div className="filter-item">
                    <label for="device-search" style={{ "gridColumn": 1,  "padding": "5px 10px 5px" }}>Search by Device Name:</label>
                    <input type="text" style={{"padding" : "2px 2px 2px"}} id="device-search" onChange={(event) => setDataLogs(originalDataLogs.filter((log) => log.device.includes(event.target.value)))} />
                </div>
                <div className="filter-item">
                    <label for="type-search" style={{"gridColumn": 2, "padding": "5px 10px 5px"}}>Search by Device Type:</label>
                    <input type="text" style={{"padding" : "2px 2px 2px"}} id="type-search" onChange={(event) => setDataLogs(originalDataLogs.filter((log) => log.type.includes(event.target.value)))} />
                </div>
            </div>
        <section className="data">
                <div className="actions">
                    <button id="delete" onClick={ () => deleteSelected()}>Delete</button>
                    <button id="download" onClick={download}>Download</button>
                </div>
                {originalDataLogs.length > 0 &&
                    <table className="sortable">
                        <thead>
                            <tr>
                                <th><input type="checkbox" id="selectAll" onChange={(event) => setSelected("", event.target.checked)} /></th>
                                <th data-column="id">ID</th>
                                <th data-column="device">Device</th>
                                <th data-column="type">Type</th>
                                <th data-column="time">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DataLogs.map((log) => {
                                console.log(log.logId, log.selected)
                                return (
                                    <tr>
                                        <td><input type="checkbox" className="data-log-checkbox" checked={log.selected} onChange={(event) => setSelected(log.logId, event.target.checked)} /></td>
                                        <td>{log.logId}</td>
                                        <td className="device-cell">{log.device}</td>
                                        <td className="type-cell">{log.type}</td>
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