// Importing the "atom" function from the 'jotai' library.
// Jotai is a state management library for React that uses atoms to manage global state in a React application.
import { atom } from 'jotai'

// Creating a new atom using the "atom" function from Jotai.
// An atom represents a piece of state. Atoms can be read from and written to from any component in your React application.
export const userAtom = atom({
    // The initial state of this atom is an object with two properties: "isLoggedIn" and "isAdmin".
    // "isLoggedIn" is a boolean that represents whether the user is currently logged in. Initially set to false.
    // "isAdmin" is a boolean that represents whether the current user has admin privileges. Initially set to false.
    isLoggedIn: false, 
    isAdmin: false,
});

// Exporting the created atom.
// Now, other parts of your application can import "userAtom" to read from and write to this piece of state.
