// Importing necessary CSS styles for Users component.
import './users.css';

// Importing the NavBar component to display navigation links.
import { NavBar } from '../NavBar';

// Importing React hooks for state and lifecycle management.
import { useState, useEffect } from 'react';

// React Router hook for navigation.
import { useNavigate } from 'react-router-dom';

// Jotai hook for reading atom state without causing re-renders.
import { useAtomValue } from 'jotai';

// Importing userAtom from store to access user state.
import { userAtom } from '../store';

// Defining the Users functional component.
export const Users = () => {
    // Creating navigate function to programmatically navigate between routes.
    const navigate = useNavigate();

    // Accessing the current user state from userAtom.
    const userAtomState = useAtomValue(userAtom);

    // State to store original list of users (not affected by filtering). This can be initialised as empty is fetching data from server, currently using the following example data set.
    const [originalUsers, setOriginalUsers] = useState([
        { userId: "3", userName: "Jega", level: "User" },
        { userId: "2", userName: "Michal", level: "Admin" },
        { userId: "1", userName: "Dilusha", level: "Admin" },
    ]);

    // State to store users list which can be filtered. This can be initialised as empty is fetching data from server, currently using the following example data set.
    const [users, setUsers] = useState([
        { userId: "3", userName: "Jega", level: "User" },
        { userId: "2", userName: "Michal", level: "Admin" },
        { userId: "1", userName: "Dilusha", level: "Admin" },
    ]);

    // State to store ID of the selected user.
    const [selected, setSelected] = useState("");

    // Redirecting to login page if user is not logged in.
    if (!userAtomState.isLoggedIn) {
        return navigate("/login");
    }

    // Uncomment this code to implement fetching the data from the server backend, which is currently not in use.
    // useEffect(() => {
    //     const fetchData = async () => {
    //         await getData();
    //     };
    //     fetchData();
    // }, []);

    // Effect hook to set users state when originalUsers state changes.
    useEffect(() => {
        setUsers(originalUsers);
    }, [originalUsers]);

    // Function to delete the selected user.
    const deleteSelected = async () => {
        // Setting original users state to exclude the selected user.
        setOriginalUsers((oldUsers) => oldUsers.filter((user) => user.userId !== selected));

        // Uncomment this code to implement fetching the data from the server backend, which is currently not in use.
        // await client.post("/user/delete", {
        //     user: originalUsers.filter((user) => user.userId === selected).map((user) => user.userId),
        // }).then(() => {
        //     setOriginalUsers((oldUsers) => oldUsers.filter((user) => user.userId !== selected));
        // });
    };

    // Rendering Users component.
    return (
        <>
            {/* Displaying NavBar component */}
            <NavBar />

            {/* Main content of the Users page */}
            <main className='main-content'>
                <h1>Users</h1>

                {/* Filters section */}
                <div className='filter'>
                    {/* Filter by Username */}
                    <div className="filter-item">
                        <label htmlFor="user-search" style={{ "gridColumn": 1, "padding": "5px 10px 5px" }}>Search by Username:</label>
                        <input type="text" style={{ "padding": "2px 2px 2px" }} id="user-search" onChange={(event) => setUsers(originalUsers.filter((user) => user.userName.includes(event.target.value)))} />
                    </div>

                    {/* Filter by Access Level */}
                    <div className="filter-item">
                        <label htmlFor="level-search" style={{ "gridColumn": 2, "padding": "5px 10px 5px" }}>Search by Access Level:</label>
                        <input type="text" style={{ "padding": "2px 2px 2px" }} id="level-search" onChange={(event) => setUsers(originalUsers.filter((user) => user.level.includes(event.target.value)))} />
                    </div>
                </div>

                {/* Users list section */}
                <section className="users">
                    {/* Actions like Add, Edit, Delete */}
                    <div className="actions">
                        <button id="add" onClick={() => navigate("/user-form")}>Add New</button>
                        <button id="edit" onClick={() => navigate("/user-form", { state: originalUsers.filter((user) => user.userId === selected)[0] })}>Edit</button>
                        <button id="delete" onClick={() => deleteSelected()}>Delete</button>
                    </div>

                    {/* Table to display users */}
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
                            {users.map((user) => (
                                <tr key={user.userId}>
                                    <td><input type="checkbox" className="data-log-checkbox" checked={user.userId === selected} onChange={() => setSelected(user.userId)} /></td>
                                    <td className="id-cell">{user.userId}</td>
                                    <td className="username-cell">{user.userName}</td>
                                    <td className="level-cell">{user.level}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>
        </>
    );
};
