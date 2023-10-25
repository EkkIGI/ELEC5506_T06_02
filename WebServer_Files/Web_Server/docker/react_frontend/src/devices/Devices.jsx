import './devices.css'
import { NavBar } from '../NavBar'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { userAtom } from '../store'

export const Devices = () => {
    const navigate = useNavigate();
    const userAtomState = useAtomValue(userAtom);
    const [originalDevices, setOriginalDevices] = useState(
        [
            { deviceId: "1", deviceName: "Gateway #1", type: "Gateway", MAC: "0013A200423D8A1A", Parent: "Webserver"},
            { deviceId: "2", deviceName: "Hot Oven #1", type: "Interlock", MAC: "0013A200423D8A1B", Parent: "Gateway #1"},
            { deviceId: "3", deviceName: "USB Logger #1", type: "USB", MAC: "0013A200423D8A1C", Parent: "Gateway #1"},
            { deviceId: "4", deviceName: "RS232 Logger #1", type: "RS232", MAC: "0013A200423D8A1D", Parent: "Gateway #1"},
            { deviceId: "5", deviceName: "Hot Oven #1 Switch", type: "Switch", MAC: "0013A200423D8A1F", Parent: "Hot Oven #1"},
        ]
    )
    const [devices, setDevices] = useState(
        [
            { deviceId: "1", deviceName: "Gateway #1", type: "Gateway", MAC: "0013A200423D8A1A", Parent: "Webserver"},
            { deviceId: "2", deviceName: "Hot Oven #1", type: "Interlock", MAC: "0013A200423D8A1B", Parent: "Gateway #1"},
            { deviceId: "3", deviceName: "USB Logger #1", type: "USB", MAC: "0013A200423D8A1C", Parent: "Gateway #1"},
            { deviceId: "4", deviceName: "RS232 Logger #1", type: "RS232", MAC: "0013A200423D8A1D", Parent: "Gateway #1"},
            { deviceId: "5", deviceName: "Hot Oven #1 Switch", type: "Switch", MAC: "0013A200423D8A1F", Parent: "Hot Oven #1"},
        ]
    )
    const [selected, setSelected] = useState("")
    if (!userAtomState.isLoggedIn) {
        return navigate("/login")
     }
    const getData = async () => {
        await client.get('/get_Devices').then((log) => {
             const devices = data.data.map((log) => { return { deviceId: log.device_id,  deviceName: "TBC", MAC:log.mac_address, Parent:"TBC", type: log.device_type} }) //CHANGE THE MAPPING FUNCTION
             setOriginalDevices(devices)
             setDevices(devices)
         })
     }

     useEffect(() => {
         async () => {
             await getData()
         }
     }, [])

    useEffect(()=>{
        setDevices(originalDevices)
    }, [originalDevices])

    const deleteSelected = async () => {
        setOriginalDevices((oldDevices) => oldDevices.filter((device) => device.deviceId !== selected))
        await client.post("/delete_device", {
             p_device_id: originalDevices.filter((device) => device.deviceId === selected).map((device)=> device.deviceId)
         })
         .then((data) => {
             setOriginalDevices((oldDevices) => oldDevices.filter((device) => device.deviceId !== selected))
         })
    }
    console.log(devices)
    return (
        <>
            <NavBar />
            <main className='main-content'>
            <h1>Devices</h1>
            <div className='filter'>
                <div className="filter-item">
                    <label for="device-search" style={{ "gridColumn": 1,  "padding": "5px 10px 5px" }}>Search by Name:</label>
                    <input type="text" style={{"padding" : "2px 2px 2px"}} id="device-search" onChange={(event) => setDevices(originalDevices.filter((device) => device.deviceName.includes(event.target.value)))} />
                </div>
                <div className="filter-item">
                    <label for="type-search" style={{"gridColumn": 2, "padding": "5px 10px 5px"}}>Search by Type:</label>
                    <input type="text" style={{"padding" : "2px 2px 2px"}} id="type-search" onChange={(event) => setDevices(originalDevices.filter((device) => device.type.includes(event.target.value)))} />
                </div>
            </div>
            {/* <section className="filter">
                <div className="filter-item" style="grid-row: 1; grid-column-start: 1; grid-column-end: 3;">
                    <div className="type-filter">
                        <div className="type-filter-item" style="grid-row: 1; grid-column: 1;">
                            <label><b>Type:</b></label>
                        </div>
                        <div className="type-filter-item" style="grid-row: 1; grid-column: 2; vertical-align: center;">
                            <input type="checkbox" id="all" name="all" value="all" />
                            <label for="all">All</label>
                        </div>
                        <div className="type-filter-item" style="grid-row: 1; grid-column: 3;">
                            <input type="checkbox" id="gateway" name="gateway" value="gateway" />
                            <label for="rs232">Gateway</label>
                        </div>
                        <div className="type-filter-item" style="grid-row: 1; grid-column: 4;">
                            <input type="checkbox" id="rs232" name="rs232" value="rs232" />
                            <label for="rs232">RS232</label>
                        </div>
                        <div className="type-filter-item" style="grid-row: 1; grid-column: 5;">
                            <input type="checkbox" id="usb" name="usb" value="usb" />
                            <label for="usb">USB</label>
                        </div>
                        <div className="type-filter-item" style="grid-row: 1; grid-column: 6;">
                            <input type="checkbox" id="interlock" name="interlock" value="interlock" />
                            <label for="interlock">Interlock</label>
                        </div>
                    </div>
                </div>
                <div className="filter-item" style="grid-row: 2; grid-column: 2; border: 1px solid black; padding: 5px 2px 5px 2px">
                    <label for="device-search" >Search by Device Name:</label>
                    <input type="text" id="device-search" />
                    <button id="search-button">Search</button>
                </div>
            </section> */}
            <section className="devices">
                <div className="actions">
                    <button id="add" onClick={() => navigate("/device-form")}>Add New</button>
                    <button id="edit" onClick={() => navigate("/device-form", { state: originalDevices.filter((device)=> device.deviceId === selected)[0] })}>Edit</button>
                    <button id="delete" onClick={() => deleteSelected}>Delete</button>
                </div>
                <table className="sortable">
                    <thead>
                        <tr>
                            <th></th>
                            <th data-column="id">ID</th>
                            <th data-column="device">Device</th>
                            <th data-column="type">Type</th>
                            <th data-column="MAC">MAC</th>
                            <th data-column="parent">Parent</th>
                        </tr>
                    </thead>
                    <tbody>
                    {devices.map((device) => {
                            return (<tr>
                                <td><input type="checkbox" className="data-log-checkbox" checked={device.deviceId === selected} onChange={(event) => setSelected(device.deviceId)} /></td>
                                <td className="id-cell">{device.deviceId}</td>
                                <td className="device-cell">{device.deviceName}</td>
                                <td className="type-cell">{device.type}</td>
                                <td className="MAC-cell">{device.MAC}</td>
                                <td className="parent-cell">{device.Parent}</td>
                            </tr>)
                        })}
                    </tbody>
                </table>
            </section>
            </main>
        </>  
    )
}