import ctypes

def hide_console():
    '''
    Hide the console window in Windows.
    '''
    kernel32 = ctypes.WinDLL('kernel32')
    user32 = ctypes.WinDLL('user32')
    SW_HIDE = 0
    hWnd = kernel32.GetConsoleWindow()

    if hWnd:
        user32.ShowWindow(hWnd, SW_HIDE)

