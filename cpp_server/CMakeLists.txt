cmake_minimum_required(VERSION 3.10)
project(WebSocketServer)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Add uWebSockets using FetchContent (requires CMake 3.11+)
# This assumes uWebSockets is available to be found by CMake
# For a more robust setup, you might use FetchContent or add it as a submodule
# For this environment, we'll assume uWebSockets headers and libraries
# need to be installed on the system or provided in a way the toolchain can find them.
# Since direct dependency installation is complex in this environment,
# this CMakeLists.txt is simplified.
#
# In a local dev environment, you would typically do:
# find_package(uWS REQUIRED)
# target_link_libraries(WebSocketServer PRIVATE uWS::uWS)
#
# For this subtask, the build will likely rely on the execution environment
# having uWebSockets pre-installed or being able to install it via a shell command.

add_executable(WebSocketServer main.cpp)

# Placeholder for linking if uWebSockets is a shared/static library
# If uWebSockets is header-only or linked differently, this might not be needed
# or would be handled by find_package.
# target_link_libraries(WebSocketServer PRIVATE some_uwebsockets_library)

# The subtask runner will need to ensure uWebSockets is available.
# A typical command to install uWebSockets (might vary by OS/distro):
# sudo apt-get install libuwebsockets-dev
# Or build from source: git clone https://github.com/uNetworking/uWebSockets.git && cd uWebSockets && make && sudo make install
# For the subtask, we'll assume the environment can handle this.
