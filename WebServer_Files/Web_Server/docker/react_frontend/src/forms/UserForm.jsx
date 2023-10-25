import { NavBar } from '../NavBar'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { userAtom } from '../store';
import { useEffect, useState } from 'react'
import { client } from '../client'
import './form.css'

export const UserForm = () => {
    const navigate = useNavigate()
    const userAtomState = useAtomValue(userAtom);
    if (!userAtomState.isLoggedIn) {
            navigate("/login");
    }
    const location = useLocation();
    const userState = location.state;
    console.log("userstate", userState)
    const [ userInformation, setUserInformation] = useState({ id: "", username: "", password: "", rfid: "", associatedDevices: [""], accessLevel: ""})

    const handleSelectChange = (event) => {
        // Convert the NodeList to an array and filter for only the selected options
        const selected = Array.from(event.target.options)
                          .filter(option => option.selected)
                          .map(option => option.value);
        setUserInformation((oldInfo) => { return { ...oldInfo, associatedDevices:selected}});
    }

    if (!userAtomState.isLoggedIn) {
            return navigate("/login");
    }

    useEffect(() =>{
        console.log("running")
        if(!userState){
            return
        }
        setUserInformation({
            id: userState.userId,
            username: userState.userName,
            accessLevel: userState.level
        })
    }, [userState])
    const onSubmit = async () => {
        await client.post("/user/addUpdate",
        {
            ...userInformation
        })
    }
    return (
        <>
            <NavBar />
            <main className='form-main-content'>
            <h1 style={{"padding-left": "10px"}}>{userState === null ? "Create ": "Edit "} User</h1>
            <form id="edit-user-form">
                <input type="hidden" id="user-id" name="id" value="123" />

                <div className="form_line">
                    <div className="form_element">
                        <label for="username">Username:</label>
                    </div>
                    <div className="form_element">
                        <input type="text" id="username" name="username" value={userInformation.username} onChange={(event)=> {setUserInformation((oldInfo) => { return {...oldInfo, username: event.target.value}})}} required />
                    </div>
                </div>
                <div className="form_line">
                    <div className="form_element">
                        <label for="password">Password:</label>
                    </div>
                    <div className="form_element">
                        <input type="password" id="password" name="password" value={userInformation.password} onChange={(event)=> {setUserInformation((oldInfo) => { return {...oldInfo, password: event.target.value}})}} required />
                    </div>
                </div>
                <div className="form_line">
                    <div className="form_element">
                        <label for="rfid">RFID:</label>
                    </div>
                    <div className="form_element">
                        <input type="text" id="rfid" name="rfid" value={userInformation.rfid} onChange={(event)=> {setUserInformation((oldInfo) => { return {...oldInfo, rfid: event.target.value}})}} required />
                    </div>
                </div>
                <div className="form_line">
                    <div className="form_element">
                        <label for="associated-devices">Associated Devices:</label>
                    </div>
                    <div className="form_element">
                        <select id="associated-devices" name="associated-devices[]" value={userInformation.associatedDevices} onChange={handleSelectChange} multiple required>
                            <option value="device1">Device 1</option>
                            <option value="device2">Device 2</option>
                        </select>
                    </div>
                </div>
                <div className="form_line">
                    <div className="form_element">
                        <label for="access-level">Access Level:</label>
                    </div>
                    <div className="form_element">
                        <select id="access-level" name="access-level" value={userInformation.accessLevel} onChange={(event)=> {setUserInformation((oldInfo) => { return {...oldInfo, accessLevel: event.target.value}})}} required>
                            <option value="Admin">Admin</option>
                            <option value="User">User</option>
                        </select>
                    </div>
                </div>
                <div className="form_line" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <button type="submit" onClick={() => {onSubmit()}}>{userState === null ? "Create " : "Update "} User</button>
                </div>
            </form>
        </main>
        </>
    )
}