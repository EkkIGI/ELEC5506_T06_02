# React + Vite

# React + Vite


### `react_frontend` Directory Structure and Contents

#### Directories:

-   **`public/`**:  
    Contains static assets such as images, fonts, and `robots.txt`. Files here are served directly without processing by Vite.
    
-   **`src/`**:  
    The source directory where React components, styles, tests, and other JavaScript files reside. Most of the application development occurs in this directory.
    

#### Files:

-   **`.env`**:  
    Used for storing environment variables accessible at runtime through `process.env`.
    
-   **`.eslintrc`**:  
    Configuration file for ESLint, a static code analysis tool to identify problematic patterns in JavaScript code.
    
-   **`.gitignore`**:  
    Instructs Git on which files or directories to ignore, ensuring that temporary files and build artifacts are not included in the Git repository.
    
-   **`Dockerfile`**:  
    A script containing instructions to create a Docker container for the application, encapsulating the app and its dependencies.
    
-   **`index.html`**:  
    The main HTML file served by Vite, acting as a template for the React application.
    
-   **`package.json`**:  
    Holds various metadata related to the project, manages project dependencies, scripts, and version information.
    
-   **`README.md`**:  
    Provides information about the project including an introduction, installation instructions, usage examples, and more. It is displayed on the project’s GitHub page.
    
-   **`vite.config.js`**:  
    Contains Vite configuration settings, allowing customisation, plugin addition, and option configuration

### Pre-Launch Configuration for Docker Container

Before launching the Docker container of your React application, you need to configure a few settings to ensure that the application can properly communicate with your backend API and is accessible on the correct port.

#### 1. Configuring the Backend API Base Path:

To set the base path for your backend API, update the `.env` file in your project directory:

env

`VITE_BASE_PATH=http://192.168.0.168:3000/ # Update with the final API webserver port` 

Replace `http://192.168.0.168:3000/` with the correct base URL and port number for your backend API. This environment variable will be used by your React application to make API requests to the backend.

#### 2. Configuring the Exposed Port in Docker:

To set the port number that your application will be accessible on from outside the Docker container, update the `Dockerfile`:



`FROM node`
`WORKDIR /app`
`COPY package.json .`
`RUN npm install`
`COPY . .`
`EXPOSE 3000 # Set the exposed port`
`CMD ["npm", "run", "dev"]` 

In this example, the application inside the Docker container will be accessible on port 3000. If you want to change this, update the `EXPOSE` line with the desired port number.

**Important Note**: Changing the exposed port in the `Dockerfile` does not change the port number your application runs on inside the container; it only changes the port number through which the application is accessible from outside the container. If you need to change the internal port number that your application runs on, you will need to update the `vite.config.js` file or the start script in the `package.json` file, depending on how your application is configured.

----------

After completing these configuration steps, you should be able to build and run your Docker container, and your React application should be able to communicate with your backend API and be accessible on the configured port.