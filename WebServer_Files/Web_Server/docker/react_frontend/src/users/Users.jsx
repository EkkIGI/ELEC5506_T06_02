import './users.css';
import { NavBar } from '../NavBar';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { userAtom } from '../store';

export const Users = () => {
    const navigate = useNavigate()
    const userAtomState = useAtomValue(userAtom);

    const [originalUsers, setOriginalUsers] = useState(
        [
            { userId: "123", userName: "Angus Jackson", level: "Admin" },
            { userId: "124", userName: "Josh Cheng", level: "Test 2" },
        ]
    )

    const [users, setUsers] = useState(
        [
            { userId: "123", userName: "Angus Jackson", level: "Admin" },
            { userId: "124", userName: "Josh Cheng", level: "Test 2" },
        ]
    )
    const [selected, setSelected] = useState("")

    if (!userAtomState.isLoggedIn) {
        return navigate("/login")
        }
    // const getData = async () => {
    //     await client.get('/getUsers').then((data) => {
    //         const users = data.data.map((user) => { return { logId: log.usage_log_id, user: log.userid, } }) //CHANGE THE MAPPING FUNCTION
    //         setOriginalUsers(users)
    //         setUsers(users)
    //     })
    // }

    // useEffect(() => {
    //     async () => {
    //         await getData()
    //     }
    // }, [])

    useEffect(()=>{
        setUsers(originalUsers)
    }, [originalUsers])

    const deleteSelected = async () => {
        setOriginalUsers((oldUsers) => oldUsers.filter((user) => user.userId !== selected))
        // await client.post("/user/delete", {
        //     user: originalUsers.filter((user) => user.userId === selected).map((user)=> user.userId)
        // })
        // .then((data) => {
        //     setOriginalUsers((oldUsers) => oldUsers.filter((user) => user.userId !== selected))
        // })
    }
    console.log(users)
    return (
        <>
            <NavBar />
            <main className='main-content'>
            <h1>Users</h1>
            <div className='filter'>
                <div className="filter-item">
                    <label for="user-search" style={{ "gridColumn": 1,  "padding": "5px 10px 5px" }}>Search by Username:</label>
                    <input type="text" style={{"padding" : "2px 2px 2px"}} id="device-search" onChange={(event) => setUsers(originalUsers.filter((user) => user.userName.includes(event.target.value)))} />
                </div>
                <div className="filter-item">
                    <label for="level-search" style={{"gridColumn": 2, "padding": "5px 10px 5px"}}>Search by Access Level:</label>
                    <input type="text" style={{"padding" : "2px 2px 2px"}} id="level-search" onChange={(event) => setUsers(originalUsers.filter((user) => user.level.includes(event.target.value)))} />
                </div>
            </div>
            <section className="users">
                <div className="actions">
                    <button id="add" onClick={() => navigate("/user-form")}>Add New</button>
                    <button id="edit" onClick={() => navigate("/user-form", { state: originalUsers.filter((user)=> user.userId === selected)[0] })}>Edit</button>
                    <button id="delete" onClick={() => deleteSelected}>Delete</button>
                </div>
                <table className="sortable">
                    <thead>
                        <tr>
                            <th></th>
                            <th data-column="id">ID</th>
                            <th data-column="username">Username</th>
                            <th data-column="level">Access Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            return (<tr>
                                <td><input type="checkbox" className="data-log-checkbox" checked={user.userId === selected} onChange={(event) => setSelected(user.userId)} /></td>
                                <td className="id-cell">{user.userId}</td>
                                <td className="username-cell">{user.userName}</td>
                                <td className="level-cell">{user.level}</td>
                            </tr>)
                        })}
                    </tbody>
                </table>

            </section>
            </main>
        </>
    )
}