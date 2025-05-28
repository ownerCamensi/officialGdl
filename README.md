 
# officialGdl
Try this out a very simple JavaScript library Maybe this can help you when you are creating a gaming website.


# GDL Library

GDL is a lightweight JavaScript library designed to simplify file downloads with a customizable UI.

## Features
- Easy to use
- Custom messages
- Works with buttons and links

## Usage

```html
<button id="download-btn">Download</button>
<script type="module">
  import { GDL } from './dist/gdl.es.js';

  GDL.init({
    buttonId: 'download-btn',
    url: 'https://example.com/file.apk',
    waitTime: 5,
    messages: {
      waiting: "Preparing download...",
      ready: "Download ready!"
    }
  });
</script>
