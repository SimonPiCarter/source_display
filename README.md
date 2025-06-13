# File Viewer with C++ WebSocket Integration

This project is a web-based file viewer that displays the content of a selected file. When a word in the file content is clicked, it's highlighted, its line/column are displayed, and a message (the clicked word) is sent to a C++ WebSocket server, which then prints "Hello World" to its console.

## Components

1.  **Frontend:** (`index.html`, `style.css`, `script.js`)
    *   Allows file selection.
    *   Displays file content.
    *   Highlights clicked words and shows their line/column.
    *   Communicates with the C++ backend via WebSockets.
2.  **Backend:** (`cpp_server/main.cpp`, `cpp_server/CMakeLists.txt`)
    *   A C++ WebSocket server built using uWebSockets.
    *   Listens on `ws://localhost:9001`.
    *   Prints "Hello World" to its console upon receiving any message from the frontend.

## Running the Application

**1. Build and Run the C++ WebSocket Server:**

   *   **Prerequisites:**
        *   A C++ compiler (supporting C++17).
        *   CMake (version 3.10+).
        *   uWebSockets library. On Debian/Ubuntu, you can install it via:
            ```bash
            sudo apt-get update
            sudo apt-get install -y build-essential cmake libuwebsockets-dev
            ```
            Alternatively, build uWebSockets from source (see uWebSockets GitHub repository for instructions).

   *   **Compilation:**
        ```bash
        cd cpp_server
        mkdir -p build
        cd build
        cmake ..
        make
        ```

   *   **Running the Server:**
        Execute the compiled server from the `cpp_server/build` directory:
        ```bash
        ./WebSocketServer
        ```
        You should see a message like "WebSocket server listening on port 9001".

**2. Open the Frontend:**

   *   Open the `index.html` file in a modern web browser.

## Testing Steps

1.  **Start the C++ Server:** Ensure the `WebSocketServer` executable is running and you see the "listening on port 9001" message in its console.
2.  **Open `index.html`:** Launch the frontend page in your browser.
3.  **Check WebSocket Connection:**
    *   Open your browser's developer console (usually F12).
    *   You should see "WebSocket connection established." logged by `script.js`.
    *   The C++ server console should log "Client connected."
    *   If there are errors, ensure the server is running and accessible on `ws://localhost:9001`.
4.  **Load a File:**
    *   Use the "Choose File" button in `index.html` to load a text file (e.g., `sample1.txt`).
5.  **Click a Word:**
    *   Click on any word in the displayed file content.
    *   **Frontend:** The word should be highlighted, and its line/column number displayed. The browser console should log a message like "Sent to server: '[clicked_word]'".
    *   **Backend (C++ Server Console):** You should see "Hello World" printed to the server's console *each time* a word is clicked in the frontend.
6.  **Test Multiple Clicks:** Click different words to ensure the "Hello World" message is printed each time.
7.  **Server Disconnection (Optional Test):**
    *   Stop the C++ server while the `index.html` page is still open.
    *   Click a word in the frontend.
    *   The browser console should show WebSocket errors, and the `wordInfo` area might display a connection error message.
    *   Restart the C++ server. You might need to refresh `index.html` or implement reconnect logic (currently not implemented) in `script.js` for the connection to re-establish automatically.
