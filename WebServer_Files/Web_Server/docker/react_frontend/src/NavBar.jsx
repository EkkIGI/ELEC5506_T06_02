import { Link } from "react-router-dom";
import './index.css';
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom } from "./store";

export const NavBar = () => {
    const userState = useAtomValue(userAtom);
    const setUserState = useSetAtom(userAtom);
    const links = [
        { path: "/", label: "Home" },
        { path: "/data", label: "Data" },
        { path: "/access", label: "Access" }
    ];

    // Adding admin links conditionally
    if (userState.isAdmin) {
        links.push(
            { path: '/users', label: "Users" },
            { path: '/devices', label: "Devices" }
        );
    }

    return (
        <nav className="navigation">
            {links.map((link, index) => (
                <Link key={index} className="nav-button" to={link.path}>
                    {link.label}
                </Link>
            ))}
            <button className="nav-button" style={{ height: "100%" }} onClick={() => setUserState({ isLoggedIn: false, isAdmin: false })}>
                Logout
            </button>
        </nav>
    );
};
