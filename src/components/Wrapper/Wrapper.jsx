import React from 'react'

import MainScreen from '../MainScreen'

const Wrapper = (props) => {
  return (
    <MainScreen dialog={props.dialog} fs={props.fs} request={props.request} />
  )
}

export default MainScreen