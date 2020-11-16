import React from 'react';

import Wrapper from '../Wrapper'

import './App.scss'

const electron = window.require('electron')
const fs = electron.remote.require('fs')
const request = electron.remote.require('request')
const imgToPDF = electron.remote.require('image-to-pdf');
const ipcRenderer  = electron.ipcRenderer
const puppeteer = electron.remote.require('puppeteer')
const { dialog } = window.require('electron').remote

function App() {
  return (
    <Wrapper dialog={dialog} puppeteer={puppeteer} fs={fs} request={request} imgToPDF={imgToPDF} />
  );
}

export default App;
