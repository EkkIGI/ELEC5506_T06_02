import { NavBar } from '../NavBar'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { userAtom } from '../store';
import { useEffect, useState } from 'react'
import { client } from '../client'
import './form.css'

export const DeviceForm = () => {
    const navigate = useNavigate()
    const userAtomState = useAtomValue(userAtom);
    if (!userAtomState.isLoggedIn) {
            navigate("/login");
        }

    const location = useLocation();    
    const userState = location.state;
    console.log("userstate", userState)
    const [ deviceInformation, setDeviceInformation] = useState({ deviceId: "", deviceName: "", type: "", MAC: "", Parent: ""})

    useEffect(() =>{
        console.log("running")
        if(!userState){
            return
        }
        setDeviceInformation(userState)
    }, [userState])
    const onSubmit = async () => {
        await client.post("/device/addUpdate",
        {
            ...deviceInformation
        })
    }
    return (
        <>
            <NavBar />
            <main className='form-main-content'>
            <h1 style={{"paddingLeft": "10px"}}>{userState === null ? "Create ": "Edit "} Device</h1>
            <form id="device-form">
                <input type="hidden" id="device-id" name="id" value="123" />
                <div className="form_line">
                    <div className="form_element">
                        <label for="name">Name:</label>
                    </div>
                    <div className="form_element">
                        <input type="text" id="name" name="name" value={deviceInformation.deviceName} onChange={(event)=> {setDeviceInformation((oldInfo) => { return {...oldInfo, deviceName: event.target.value}})}} required/>
                    </div>
                </div>
                <div className="form_line">
                    <div className="form_element">
                        <label for="type">Type:</label>
                    </div>          
                    <div className="form_element">
                        <select id="type" name="type" value={deviceInformation.type} onChange={(event)=> {setDeviceInformation((oldInfo) => { return {...oldInfo, type: event.target.value}})}} required >
                            <option value="RS232">RS232</option>
                            <option value="USB">USB</option>
                            <option value="Interlock">Interlock</option>
                            <option value="Gateway">Gateway</option>
                        </select>
                    </div>
                </div>
                <div className="form_line">
                    <div className="form_element">
                        <label for="mac">MAC Address:</label>
                    </div>
                    <div className="form_element">
                        <input type="text" id="mac" name="mac" value={deviceInformation.MAC} onChange={(event)=> {setDeviceInformation((oldInfo) => { return {...oldInfo, MAC: event.target.value}})}} required/>
                    </div>
                </div>
                <div className="form_line">
                    <div className="form_element">
                        <label for="parent">Parent Device:</label>
                    </div>
                    <div className="form_element">
                        <input type="text" id="parent" name="parent" value={deviceInformation.Parent} onChange={(event)=> {setDeviceInformation((oldInfo) => { return {...oldInfo, Parent: event.target.value}})}} required/>
                    </div>   
                </div>
                <div className="form_line" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <button type="submit" onClick={() => {onSubmit()}}>{userState === null ? "Create " : "Update "} Device</button>
                </div>
            </form>
        </main>
        </>
    )
}