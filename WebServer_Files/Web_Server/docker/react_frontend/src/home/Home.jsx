import './home.css';
import { NavBar } from '../NavBar';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { userAtom } from '../store';
import { useEffect, useState } from 'react';

export const Home = () => {
    const navigate = useNavigate();
    const userState = useAtomValue(userAtom);
    if (!userState.isLoggedIn) {
           return navigate("/login");
    }

    const [deviceLogs, setDeviceLogs] = useState(
        [
            { name: "SQM #1", type: "RS232", time: "" },
            { name: "SQM #1", type: "RS232", time: "" },
            { name: "SQM #1", type: "RS232", time: "" },
            { name: "SQM #1", type: "RS232", time: "" },
            { name: "SQM #1", type: "RS232", time: "" }
        ]
    )


    const [accessLogs, setAccessLogs] = useState(
        [
            { user: "Jjjosh", device: "Test 1", time: ""},
            { user: "Test 2", device: "Test 2", time: ""},
            { user: "Test 2", device: "Test 2", time: ""},
            { user: "Test 2", device: "Test 2", time: ""},
            { user: "Test 2", device: "Test 2", time: ""}
        ]
    )

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

    // useEffect(() => {
    //     async () => {
    //         await getData()
    //     }
    // }, [])

    useEffect(()=>{
        setDeviceLogs(deviceLogs)
    }, [deviceLogs])

    useEffect(()=>{
        setAccessLogs(accessLogs)
    }, [accessLogs])
    console.log(deviceLogs)
    console.log(accessLogs)

    return (
        <>
            <NavBar />
            <main className='main-content'>
                <h1>Dashboard</h1>
                <h2>Recent Logs</h2>
                <section>
                    <table>
                        <thead>
                        <tr>
                            <th>Device</th>
                            <th>Type</th>
                            <th>Time</th>
                        </tr>
                        </thead>
                        <tbody>
                            {deviceLogs.map((log) => {
                                return (
                                <tr>
                                    <td>{log.name}</td>
                                    <td>{log.type}</td>
                                    <td>{log.time}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </section>
                <h2>Recent Access</h2>
                <section>
                    <table>
                        <thead>
                        <tr>
                            <th>User</th>
                            <th>Device</th>
                            <th>Time</th>
                        </tr>
                        </thead>
                        <tbody>
                            {accessLogs.map((log) => {
                                return (
                                <tr>
                                    <td>{log.user}</td>
                                    <td>{log.device}</td>
                                    <td>{log.time}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </section>
            </main>
        </>
    )
}