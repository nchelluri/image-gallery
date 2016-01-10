Pure JS Image Gallery
===
This is a pure JS image gallery.

Currently, it only works with the Flickr API as an image source, but other back-ends, or a backend-agnostic version, are
planned. At present, the gallery fetches photo data from a Flickr Group and creates a thumbnail grid. The thumbnails are
clickable. Clicking a thumbnail opens a lightbox containing a larger version of the thumbnail image and navigation
buttons.
  
If a URL hash is provided and it is a valid 1-based photo index, the gallery will start with that photo opened.

Once a photo is opened, the Previous and Next buttons can be pressed using the keyboard shortcuts left arrow and right
arrow respectively, and the Close button can be pressed using the keyboard shortcut ESC.

This gallery is intended to work properly on all devices with a resolution of 350x350px+.


### Requirements
Create a div with an id of ```flickr-gallery``` with the required attributes (listed below) on an HTML page, include the
CSS and JS from this repo, and you're set to go. See the provided ```index.html``` for a working example.

Attributes (optional unless specified):

- ```data-api-key```: your Flickr API key **(required)**
- ```data-group-id```: the ID of the Flickr group **(required)**
- ```data-loading-indicator```: HTML to use for the loading indicator
- ```data-no-photos-indicator```: HTML to use to indicate that no photos were found
- ```data-error-indicator```: HTML to use to indicate that an error occurred when fetching the photo details
- ```data-abort-indicator```: HTML to use to indicate that the fetching of photo details has been aborted
- ```data-prev-button```: HTML to use for the Previous button
- ```data-next-button```: HTML to use for the Next button
- ```data-photo-count-template```: HTML template to use for the Photo Count, including variables ```$index```
  representing the current photo's index and ```$count``` representing the number of photos in the gallery

  
### Limitations
- no pagination
- can only have one #flickr-gallery element per page
- photo title has lots of character stripping for XSS protection (it's particularly bad for non-ASCII alphabets)
- could show a loading icon on lightbox while image is loading
- may want to tweak lightbox and button positioning so that the buttons always show up in the same spots in the viewport
- no test coverage - could use something like QUnit at https://github.com/nchelluri/qsutil/tree/master/test or Mocha/Sinon


### Contribution

Have at it. I'll happily review any pull requests. Please use good code hygiene.
