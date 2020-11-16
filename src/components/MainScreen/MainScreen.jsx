import React, { Component } from 'react'

import './MainScreen.scss'

import {svg2png} from 'svg-png-converter'
import { ArrowClockwise } from 'react-bootstrap-icons'

const superagent = require('superagent')

const ProgressBar = ({percentage}) => {
  return (
    <div className="progress-bar">
      <div className="progress-bar-inner" style={{width: `${percentage}%`}}></div>
    </div>
  )
}

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
      savePdf: true,
      pages: 0,
      downloadedPages: 0,
      downloading: false
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

  async scrollAndGetLinks(page, pages) {
    let links = []

    try {
      let previousHeight = 0

      await page.evaluate("let view = document.querySelector('img[src*=score_0]').parentNode.parentNode")
      await page.evaluate("let currentImage")
      let scrollHeight = await page.evaluate("view.scrollHeight")
      let scrollAmount = await page.evaluate("view.offsetHeight")
      console.log(scrollHeight)

      while( links.length < pages ) {
        console.log("while", links.length, pages)
        let imageLink = await page.evaluate(
          "currentImage = document.querySelector('img[src*=score_" + links.length + "]');" +
          "if (currentImage) {" +
          "document.querySelector('img[src*=score_" + links.length + "]').src" +
          "}"
        )
        console.log("imageLink ", imageLink)
        previousHeight = await page.evaluate('view.scrollTop');
        await page.evaluate(`view.scrollTop += ${scrollAmount}`);
        await page.waitForFunction(`view.scrollTop > ${previousHeight}`);

        if( imageLink && links.indexOf(imageLink) < 0 ) {
          links.push(imageLink)
        }

        await page.waitFor(500)
      }
    } catch(err) {
      console.log("error", err)
    }

    return links
  }

  async handleSubmit(event) {
    event.preventDefault()

    this.setState({
      images: [],
      dom: null,
      format: '',
      pages: 0,
      downloadedPages: 0,
      downloading: true
    })

    // Get meta
    superagent
      .get(this.state.link)
      .then((response) => {
        var doc = new DOMParser().parseFromString(response.text, "text/html")

        // page count
        let rex = /((pages_count&quot;:)\d+)/g
        return response.text.match(rex)[0].replace("pages_count&quot;:","")
      }).then(async pages => {
        this.setState({
          pages: parseInt(pages)
        })

        const browser = await this.props.puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        page.setViewport({ width: 1280, height: 720 });

        await page.goto(this.state.link);

        // getTitle
        let titleOfDocument = await page.evaluate(`document.querySelector("meta[name='twitter:title']").content`)

        // get initial link for format and set it
        let linkOfInitialImage = await page.evaluate("document.querySelector('img[src*=score_0]').src")
        this.getFormat(linkOfInitialImage)

        // get the download Links
        let downloadLinks = await this.scrollAndGetLinks(page, this.state.pages)

        console.log("toDownload", downloadLinks)
        console.log("pages", this.state.pages)

        await browser.close()
        // BROWSER END

        let downloadedImages = []
        let images = []
        let that = this

        downloadLinks.forEach((link, i) => {
          let index = i > 9 ? i : `0${i}`;
          images.push(link)

          if (this.state.format === 'svg') {
            console.log("i", i)
            this.download(link, `${this.state.saveLocation}/${titleOfDocument}_${index}.${this.state.format}`, () => {
                svg2png({
                  input: that.props.fs.readFileSync(`${this.state.saveLocation}/${titleOfDocument}_${index}.${this.state.format}`),
                  encoding: "buffer",
                  format: "png"
                }).then((outputBuffer) => {
                  that.props.fs.writeFileSync(`${this.state.saveLocation}/${titleOfDocument}_${index}.png`, outputBuffer)
                  this.setState({
                    downloadedPages: this.state.downloadedPages += 1
                  })

                  try {
                    this.props.fs.unlinkSync(`${this.state.saveLocation}/${titleOfDocument}_${index}.svg`)
                  } catch(err) {
                    console.log(err)
                  }

                  downloadedImages.push(`${this.state.saveLocation}/${titleOfDocument}_${index}.png`)

                  console.log("downloaded", downloadedImages.length, this.state.pages)
                  if ( downloadedImages.length === this.state.pages && this.state.savePdf ) {
                    console.log("download after svg")
                    this.savePdf(downloadedImages.sort(), titleOfDocument)
                  }
                })
              })
          } else {
            console.log("i", i)
            this.download(link, `${this.state.saveLocation}/${titleOfDocument}_${index}.${this.state.format}`, () => {
              downloadedImages.push(`${this.state.saveLocation}/${titleOfDocument}_${index}.${this.state.format}`)
              this.setState({
                downloadedPages: this.state.downloadedPages += 1
              })

              console.log("downloaded", downloadedImages.length, pages)
              if ( downloadedImages.length === this.state.pages && this.state.savePdf ) {
                console.log("download after png")
                this.savePdf(downloadedImages.sort(), titleOfDocument)
              }
            })
          }

          this.setState({images: images, downloading: this.state.savePdf})
        })
      })
  }

  savePdf = (images, title) => {
    console.log("fromIamges", images)
    this.props.imgToPDF(images, 'A4').pipe(this.props.fs.createWriteStream(`${this.state.saveLocation}/${title}.pdf`));

    if ( !this.state.saveImages ) {
      images.forEach(img => {
        try {
          console.log("remove", img)
          this.props.fs.unlinkSync(img)
        } catch(err) {
          console.log(err)
        }
      })
    }

    this.setState({downloading: false})
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
          <img src="Logo_inApp.png" alt="Musescore PDF Downloader" className="logo" />
        </div>
        <form>
          <div className="button-input__wrapper">
            <input placeholder="Paste musescore url" onChange={this.onLinkChange} value={this.state.value} id="musescoreUrl" type="text"/>
          </div>
        </form>
        <div className="button-input__wrapper">
          <input className="border-left-side-only" type="text" value={ this.state.saveLocation || "Please select a location!" } readOnly={true} />
          <button onClick={ this.selectLocaction }>SELECT</button>
        </div>
        <div className="options">
          <label className="container">Save Images
            <input type="checkbox" checked={this.state.saveImages} onChange={this.saveImagesToggle} />
            <span className="checkmark"></span>
          </label>

          <label className="container">Save Pdf
            <input type="checkbox" checked={this.state.savePdf} onChange={this.savePdfToggle} />
            <span className="checkmark"></span>
          </label>
        </div>

        <ProgressBar percentage={ this.state.pages > 0 ? 100 * this.state.downloadedPages / this.state.pages : 0 } />
        <button disabled={!this.state.saveLocation || !this.state.link || this.state.downloading } onClick={this.handleSubmit} type="submit">{ this.state.downloading ? <ArrowClockwise size={ 20 } /> : "DOWNLOAD" }</button>

        <div className="preview" style={{ opacity: this.state.images ? 1 : 0 }}>
        { this.state.images && this.state.images.map( (em, i) => (
            <img key={i} src={em} alt="i"/>

          ) ) }
        </div>
      </div>
    )
  }
}

export default MainScreen