#include <uwebsockets/App.h>
#include <iostream>
#include <string>

int main() {
    // Define the port the server will listen on
    int port = 9001;

    // Create a uWebSockets App
    uWS::App().ws<std::string>("/*", {
        /* Settings */
        .compression = uWS::SHARED_COMPRESSOR,
        .maxPayloadLength = 16 * 1024 * 1024,
        .idleTimeout = 10,
        /* Handlers */
        .open = [](auto *ws) {
            std::cout << "Client connected." << std::endl;
        },
        .message = [](auto *ws, std::string_view message, uWS::OpCode opCode) {
            // When a message is received, print "Hello World" to the server console
            std::cout << "Hello World" << std::endl;
            // Optionally, you can also print the received message:
            // std::cout << "Received message: " << message << std::endl;

            // We are not required to send a message back for this task.
            // ws->send(message, opCode, true);
        },
        .drain = [](auto *ws) {
            /* Check ws->getBufferedAmount() here */
        },
        .ping = [](auto *ws, std::string_view) {
            /* Not implemented yet */
        },
        .pong = [](auto *ws, std::string_view) {
            /* Not implemented yet */
        },
        .close = [](auto *ws, int code, std::string_view message) {
            std::cout << "Client disconnected." << std::endl;
        }
    }).listen(port, [port](auto *listen_socket) {
        if (listen_socket) {
            std::cout << "WebSocket server listening on port " << port << std::endl;
        } else {
            std::cout << "Failed to listen on port " << port << std::endl;
            // Depending on the uWebSockets version, exit or throw might be needed
            exit(1);
        }
    }).run();

    // Should not reach here if run() is blocking
    std::cout << "Server failed to run!" << std::endl;
    return 1;
}
