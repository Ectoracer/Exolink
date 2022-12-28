# Exolink
Exolink lets you make Exoracer share links with custom titles, descriptions, and images.

## Using Exolink
First, find an Exolink instance! You can access a list [here](https://jbmagination.com/exolink).

To use an Exolink instance, you put an Exoracer share link into the "Share link" box, and press the "Get data" button. The other input fields will populate, and you can customize them as you wish.

When you're ready to create your link, choose "Make link", and the link will appear at the bottom of the page. You can copy this link and send it anywhere you'd like.

[![Exolink demonstration](https://cdn.glitch.global/29220d90-ab43-4146-bcd9-c1bf76abffcf/demonstration.gif?v=1672266562488)](#)
*This demonstration shows an earlier version of Exolink. The options and functionality are identical.*

## Hosting an Exolink instance
To host *any* Exolink instance, you'll need to obtain the dynamic link key (39 characters). That will not be provided here, but it's not horribly difficult to obtain if you know how to proxy network requests. Good luck!

### Hosting locally
Make a `.env` file that looks something like this: 
```
PORT=3000
SOURCE_CODE=https://github.com/jbmagination/exolink
LINK_KEY=[XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX]
```

For most people, `SOURCE_CODE` should always be `https://github.com/jbmagination/exolink`. Leave it as is unless you've modified the source code (you'll know if you have), in which case you'll need to publish the modified source code and put a link to it in `SOURCE_CODE`.

Then, install the necessary dependencies with `npm ci` or `npm install`. You can host Exolink from there with `node index`. You'll be able to access Exolink from the port listed in the console.

### Hosting on Replit
In your Replit, go to Shell and type `chromium`. Choose `chromium.out`. You only need to do this once.

Then, go to Secrets and set the raw JSON to something like this:
```json
{
  "PORT": "3000",
  "SOURCE_CODE": "https://github.com/jbmagination/exolink",
  "LINK_KEY": "[XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX]"
}
```

`PORT` *must* be `3000`. Replit will not expose Exolink otherwise.

For most people, `SOURCE_CODE` should always be `https://github.com/jbmagination/exolink`. Leave it as is unless you've modified the source code (you'll know if you have), in which case you'll need to publish the modified source code and put a link to it in `SOURCE_CODE`.

You can now press Run. Exolink should appear in Replit's Webview, and others can access it from the Repl's link.

### Hosting on Glitch
Assuming you've imported your project from this source code link and didn't remix the `exolink` project, you first need to go to Terminal. Type `export PUPPETEER_SKIP_DOWNLOAD=true` and `export NODE_CHROMIUM_VERSION=1069273`.

Regardless of how you made your project, go to .env, and set it to Plaintext. Replace the contents of the file with something like this:
```
PORT=3000
SOURCE_CODE=https://github.com/jbmagination/exolink
LINK_KEY=[XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX]
```

`PORT` *must* be `3000`. Glitch will not expose Exolink otherwise.

For most people, `SOURCE_CODE` should always be `https://github.com/jbmagination/exolink`. Leave it as is unless you've modified the source code (you'll know if you have), in which case you'll need to publish the modified source code and put a link to it in `SOURCE_CODE`.

Then, install the necessary dependencies with `npm ci` or `npm install`. Exolink should be accessible from the project page.

## License
The `favicon.ico` file is under the copyright of (and belongs to) Nyan Studio Games, and is admittedly used with forgiveness rather than permission.

Every other file is under the GNU Affero General Public License, version 3 of the License:

    Exolink lets you make Exoracer share links with custom titles, descriptions, and images.
    Copyright (C) 2022  JBMagination, et al.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.