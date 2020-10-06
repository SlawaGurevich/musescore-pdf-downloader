import React from 'react'

import MainScreen from '../MainScreen'

import './Wrapper.scss'

const TitleBar = () => {
	return (
		<div id="title-bar">Musescore Downloader</div>
	)
}

const Wrapper = (props) => {
  return (
    <>
      <MainScreen dialog={props.dialog} fs={props.fs} request={props.request} imgToPDF={props.imgToPDF} svg2img={props.svg2img} />
      <TitleBar />
    </>
  )
}

export default Wrapper