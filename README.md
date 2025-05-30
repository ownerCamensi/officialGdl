 
# officialGdl
Try this out a very simple JavaScript library Maybe this can help you when you are creating a gaming website.


# GDL Library

GDL is a lightweight JavaScript library designed to simplify file downloads with a customizable UI.

## Features
- Easy to use
- Custom messages
- Works with buttons and links
## New features 
-- Version 1.2.1
-- updated 
-- bug fixes 
-- add more features 
-- fixed npm bugs 
-- add more tracking or detecting file size device type 

## Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>GDL Example</title>
  <script src="https://unpkg.com/gdl-lib@1.1.0/dist/gdl.umd.js"></script>
  <style>
    #download-btn {
      padding: 12px 24px;
      font-size: 1.2rem;
      border-radius: 8px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <button id="download-btn">Download Game</button>

  <script>
    GDL.initDownload({
      buttonId: 'download-btn',
      url: 'https://example.com/game.zip',
      waitTime: 5,
      messages: {
        waiting: 'Preparing awesome game...',
        ready: 'INSTALL NOW!'
      },
      enableSound: true,
      enableVibration: true,
      theme: 'auto',
      analytics: {
        gaTrackingId: 'UA-XXXXX-Y',
        customTracker: (event) => {
          console.log('Download event:', event);
        }
      }
    });
  </script>
</body>
</html>

# my via unpkg cdn

<script src="https://unpkg.com/gdl-lib@1.1.0/dist/gdl.umd.js"></script>


#Manny Camensi Palasol
-- fb
https://www.facebook.com/profile.php?id=100076755627417
