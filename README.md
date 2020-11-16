# Musescore PDF Downloader [v0.3.0]

![](https://drive.slawagurevich.com/musescore-pdf.png)

## What is this?

**Musescore PDF Downloader** is just that. An electron app, that lets you download any sheet from musescore as a PDF.

## Why does this exist
![](https://drive.slawagurevich.com/pepperidge-farm-remembers.jpg)

... and I do, too. A long time ago (a year or so) it was still possible to download PDFs from musescore. However, they removed this features because of ... well, you know why. Although that wasn't that big of a deal, since you can still get the image source from the page and then convert the SVGs to PNG and _then_ create a PDF, it is quite the effort doing it for each song. So this app automates just that. It

1. Gets the link of the image form the page
2. Checks the image type
	1. Converts the image to PNG before downloading **or**
	2. Downloads the PNG image
3. Creates a PDF with the combined images

## Is that legal?
Heck if I know... But I would like to direct you to [a similar project here](https://github.com/Xmader/musescore-downloader). I am in general of the same opinion, so make of that what you will.

## Features
Not much so far

- Download images from musescore
- Combine images into PDF

## to-do

- Include the option to download the music as well
- ~~Sync the process better, so that the PDF is only created when all the images have been downloaded~~
- Allow for pasting multiple links and download of multiple files
- The app size is still horrifically huge. I am trying to find out why and bring it down to about 50mb...
- Remove superagent completely and rely only on puppeteer to minimise app footprint

### Update 16th Nov 2020 - Some background info on the switch to puppeteer

So musescore has changed the way they are hosting their files. From what I can gather, they were hosting all of their images on their own server with the files being titled 'score_0.svg' or 'score_0.png'. Then you could just count up the number of each sheet and get the URLs this way. However, it seems that musescore now only hosts the first page of their servers with the other pages being spread across different hosts (AWS, ultimate-guitar ...), so the only way to get all the links is to manually scroll through the page which I am doing with puppeteer now. Although it is a little bit more overhead, this method has a few advantages:

- No need to interate through and change the urls, since puppeteer doesn't care what the url to the image is. It just grabs the src form the image
- The order of the images is always correct, since it goes through them one by one.
- Event if the names, the urls or the hosts of the image change, puppeteer will just grab the links.
- JavaScript is executed directly in a browser instance, so I am scraping the real page, not some stump.

Of course there are also some disadvantages:

- If the page structure changes, I will need to redo the scraping.
- It takes a little more time than going through the page programmatically, since the browser has to physically check the code, scroll the page, get the links and so on.

In my opinion the advantages easily outweigh the disadvantages, so the switch was a good decision in the end. Hopefully it will hold for a while now. 😉

## Known Bugs

- The syncing is sometimes off, meaning that the PDF is going to get created before all the images have been downloaded. (Until I figure this out, just click the Download button again, it should work fine, if all images are present)

## For devs
### Building
If you want to build the app, just run ```npm run make```.
If you want to start the app, just run ```npm run dev```.
