import React from 'react';

import Wrapper from '../Wrapper'

import './App.scss'

const electron = window.require('electron')
const fs = electron.remote.require('fs')
const request = electron.remote.require('request')
const ipcRenderer  = electron.ipcRenderer
const { dialog } = window.require('electron').remote

function App() {
  return (
    <Wrapper dialog={dialog} fs={fs} request={request}/>
  );
}

export default App;
