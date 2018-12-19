set(CGET_PREFIX "/Users/benjamingray/github/ide-latex/cget")
set(CMAKE_PREFIX_PATH "/Users/benjamingray/github/ide-latex/cget")
include_directories(SYSTEM ${CMAKE_PREFIX_PATH}/include)
if (CMAKE_CROSSCOMPILING)
    list(APPEND CMAKE_FIND_ROOT_PATH "/Users/benjamingray/github/ide-latex/cget")
endif()
if (CMAKE_INSTALL_PREFIX_INITIALIZED_TO_DEFAULT)
    set(CMAKE_INSTALL_PREFIX "/Users/benjamingray/github/ide-latex/cget")
endif()
if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
    set(CMAKE_CXX_ENABLE_PARALLEL_BUILD_FLAG "/MP")
endif()
if (BUILD_SHARED_LIBS)
    set(CMAKE_WINDOWS_EXPORT_ALL_SYMBOLS "ON" CACHE BOOL "")
endif()
set(CMAKE_FIND_FRAMEWORK "LAST" CACHE STRING "")
set(CMAKE_INSTALL_RPATH "${CGET_PREFIX}/lib" CACHE STRING "")
