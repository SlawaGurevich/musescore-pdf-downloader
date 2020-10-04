import React, { Component } from 'react'

class MainScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {value: ''}

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    this.setState({value: event.target.value})
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value)
    event.preventDefault()
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="musescoreUrl">Pleae provide a musescore URL</label>
        <input onChange={this.handleChange} value={this.state.value} id="musescoreUrl" type="text"/>
        <button type="submit">Download</button>
      </form>
    )
  }
}

export default MainScreen