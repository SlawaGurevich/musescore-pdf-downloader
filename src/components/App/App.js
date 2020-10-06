import React from 'react';

import Wrapper from '../Wrapper'

import './App.scss'

const electron = window.require('electron')
const fs = electron.remote.require('fs')
const request = electron.remote.require('request')
const imgToPDF = electron.remote.require('image-to-pdf');
const svg2img = electron.remote.require('svg2img');
const ipcRenderer  = electron.ipcRenderer
const { dialog } = window.require('electron').remote

function App() {
  return (
    <Wrapper dialog={dialog} fs={fs} request={request} imgToPDF={imgToPDF} svg2img={svg2img} />
  );
}

export default App;
