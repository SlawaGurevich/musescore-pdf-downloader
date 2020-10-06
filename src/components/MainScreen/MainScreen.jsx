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
      format: '',
      saveImages: true,
      savePdf: true
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

  saveImagesToggle = (event) => {
    this.setState({saveImages: !this.state.saveImages})
  }

  savePdfToggle = (event) => {
    this.setState({savePdf: !this.state.savePdf})
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
        console.group(response.text)

        let images = []
        let title = doc.querySelectorAll('meta[name="twitter:title"]')[0].content
        let imagelink = doc.querySelectorAll('meta[property="og:image"]')[0].attributes.content.nodeValue

        this.getFormat(imagelink)

        let downloadedImages = []

        for( let i = 0; i < 3; i++) {
          let img = imagelink.replace("score_0", `score_${i}`)
          images.push(img)
          this.download(img, `${this.state.saveLocation}/${title}_${i}.${this.state.format}`, () => {
            if ( i == 2 && this.state.savePdf ) {
              this.props.imgToPDF(downloadedImages, 'A4').pipe(this.props.fs.createWriteStream(`${this.state.saveLocation}/${title}.pdf`));

              if ( !this.state.saveImages ) {
                downloadedImages.forEach(img => {
                  try {
                    this.props.fs.unlinkSync(img)
                  } catch(err) {
                    console.log(err)
                  }
                })
              }
            }
          })
          downloadedImages.push(`${this.state.saveLocation}/${title}_${i}.${this.state.format}`)
        }


        console.log("images", downloadedImages)

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
      <div className="main-screen">
        <div className="main-screen__musescore-logo">
          <img src="Logo_inApp.png" alt=""/>
        </div>
        <form>
          <div className="button-input__wrapper">
            <input placeholder="Paste musescore url" onChange={this.onLinkChange} value={this.state.value} id="musescoreUrl" type="text"/>
          </div>
        </form>
        <div className="button-input__wrapper">
          <input type="text" value={ this.state.saveLocation || "Please select a location!" } readOnly={true} />
          <button onClick={ this.selectLocaction }>SELECT</button>
        </div>
        <div className="options">
          <label class="container">Save Images
            <input type="checkbox" checked={this.state.saveImages} onChange={this.saveImagesToggle} />
            <span class="checkmark"></span>
          </label>

          <label class="container">Save Pdf
            <input type="checkbox" checked={this.state.savePdf} onChange={this.savePdfToggle} />
            <span class="checkmark"></span>
          </label>
        </div>

        <button disabled={!this.state.saveLocation || !this.state.link} onClick={this.handleSubmit} type="submit">DOWNLOAD</button>
        <div className="preview">
        { this.state.images && this.state.images.map( (em, i) => (
            <img src={em} alt="i"/>

          ) ) }
        </div>
      </div>
    )
  }
}

export default MainScreen