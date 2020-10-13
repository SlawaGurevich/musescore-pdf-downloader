# Musescore PDF Downloader v0.2.2

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
- Sync the process better, so that the PDF is only created when all the images have been downloaded
- Allow for pasting multiple links and download of multiple files
- The app size is still horrifically huge. I am trying to find out why and bring it down to about 50mb...

## Known Bugs

- The syncing is sometimes off, meaning that the PDF is going to get created before all the images have been downloaded. (Until I figure this out, just click the Download button again, it should work fine, if all images are present)

## For devs
### Building
If you want to build the app, just run ```npm run make```.
If you want to start the app, just run ```npm run dev```.
