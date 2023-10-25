// Importing the Link component from react-router-dom, which enables navigation between different routes in the application.
import { Link } from "react-router-dom";

// Importing CSS styles for styling the navigation bar.
import './index.css';

// Importing utility functions from Jotai for working with atoms.
import { useAtomValue, useSetAtom } from "jotai";

// Importing the userAtom, which holds the global state for the user's authentication and authorization status.
import { userAtom } from "./store";

// Defining the NavBar functional component.
export const NavBar = () => {
    // Retrieving the user's authentication and authorization status from the global state.
    const userState = useAtomValue(userAtom);

    // Retrieving a function to update the user's state in the global state.
    const setUserState = useSetAtom(userAtom);

    // Defining an array of links that will be displayed in the navigation bar for all users.
    const links = [
        { path: "/", label: "Home" },
        { path: "/data", label: "Data" },
        { path: "/access", label: "Access" }
    ];

    // Conditionally adding additional links for admin users.
    if (userState.isAdmin) {
        links.push(
            { path: '/users', label: "Users" },
            { path: '/devices', label: "Devices" }
        );
    }

    // Rendering the navigation bar.
    return (
        <nav className="navigation">
            {links.map((link, index) => (
                // For each link in the 'links' array, creating a Link component that will navigate to the specified path.
                <Link key={index} className="nav-button" to={link.path}>
                    {link.label}
                </Link>
            ))}
            {/* Adding a logout button that will reset the user's authentication and authorization status in the global state when clicked. */}
            <button className="nav-button" style={{ height: "100%" }} onClick={() => setUserState({ isLoggedIn: false, isAdmin: false })}>
                Logout
            </button>
        </nav>
    );
};
