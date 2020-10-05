import React, { Component } from 'react'

import './MainScreen.scss'

const superagent = require('superagent')
const $ = require('cheerio');


class MainScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      link: '',
      dom: null,
      images: [],
      saveLocation: '',
      format: ''
    }

    this.onLinkChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    this.setState({link: event.target.value})
  }

  selectLocaction = () => {
    this.props.dialog.showOpenDialog({ properties: ['openDirectory'] })
      .then(result => {
        this.setState({saveLocation: result.filePaths[0]})
      })
  }

  download = (uri, filename, callback) => {
    this.props.request.head(uri, (err, res, body) => {
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);

      this.props.request(uri).pipe(this.props.fs.createWriteStream(filename)).on('close', callback);
    });
  };

  handleSubmit(event) {
    event.preventDefault()
    superagent
      .get(this.state.link)
      .end((error, response) => {

        var doc = new DOMParser().parseFromString(response.text, "text/html")

        let images = []
        let imagelink = doc.querySelectorAll('meta[property="og:image"]')[0].attributes.content.nodeValue
        this.getFormat(imagelink)

        for( let i = 0; i < 3; i++) {
          let img = imagelink.replace("score_0", `score_${i}`)
          images.push(img)
          this.download(img, `${this.state.saveLocation}/score_${i}.${this.state.format}`, () => {console.log("done")})
        }

        this.setState({
          images: images
        })
      })
  }

  getFormat = (link) => {
    console.log(typeof(link))
    if( link.includes('svg') ) {
      this.setState({format: 'svg'})
    } else if ( link.includes('png') ) {
      this.setState({format: 'png'})
    } else if ( link.includes('jpg' )) {
      this.setState({format: 'png'})
    } else if ( link.includes('jpeg' )) {
      this.setState({format: 'jpeg'})
    } else {
      this.setState({format: ''})
    }
  }

  render() {
    return (
      <>
        <div>{ this.state.saveLocation || "Please select a location!" } <button onClick={ this.selectLocaction }>Select</button></div>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="musescoreUrl">Please provide a musescore URL</label>
          <input onChange={this.onLinkChange} value={this.state.value} id="musescoreUrl" type="text"/>

          <button disabled={!this.state.saveLocation || !this.state.link} type="submit">Download</button>
          { this.state.images && this.state.images.map( (em, i) => (
            <img src={em} alt="i"/>
          ) ) }
        </form>
      </>
    )
  }
}

export default MainScreen