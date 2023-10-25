// Importing axios, a popular HTTP client library for making HTTP requests in JavaScript.
import axios from "axios";

// Creating an instance of axios with custom configuration.
export const client = axios.create({
    // Setting the base URL for HTTP requests. This value is retrieved from the environment variables.
    // "import.meta.env.VITE_BASE_PATH" specifically refers to an environment variable set by Vite (a build tool),
    // and it holds the base path for the API or any other base URL you want to set for axios.
    baseURL: import.meta.env.VITE_BASE_PATH
});

// Exporting the configured axios instance.
// Now, whenever you import 'client' in other parts of your application, 
// you can use it to make HTTP requests with the base URL already set.
