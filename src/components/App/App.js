import React from 'react';

import MainScreen from '../MainScreen'

const electron = window.require('electron')
const fs = electron.remote.require('fs')
const ipcRenderer  = electron.ipcRenderer
const { dialog } = window.require('electron').remote

function App() {
  return (
    <MainScreen dialog={dialog} />
  );
}

export default App;
