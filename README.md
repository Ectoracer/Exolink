# Exolink
Exolink lets you make Exoracer share links with custom titles, descriptions, and images.

## Using Exolink
First, find an Exolink instance! You can access a list [here](https://ectoracer.github.io/exolink).

To use an Exolink instance, you put an Exoracer share link into the "Share link" box, and press the "Get data" button. The other input fields will populate, and you can customize them as you wish.

When you're ready to create your link, choose "Make link", and the link will appear at the bottom of the page. You can copy this link and send it anywhere you'd like.

[![Exolink demonstration](./demonstration.gif)](#)
*This demonstration shows an earlier version of Exolink.*

## Hosting an Exolink instance
To host *any* Exolink instance, you'll need to obtain the dynamic link key (39 characters). That will not be provided here, but it's not horribly difficult to obtain if you know how to proxy network requests.

### Hosting locally
Make a `.env` file that looks something like this: 
```
PORT=3000
SOURCE_CODE=https://github.com/Ectoracer/Exolink
LINK_KEY=[XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX]
CUSTOM_LINK=false
```

For most people, `SOURCE_CODE` should always be `https://github.com/Ectoracer/Exolink`. Leave it as is unless you've modified the source code (you'll know if you have), in which case you'll need to publish the modified source code and put a link to it in `SOURCE_CODE`.

`CUSTOM_LINK` *must* be false. Only official instances have access to custom links (`exo.page.link`), because it requires access to the Firebase project associated with it.

Then, install the necessary dependencies with `npm ci` or `npm install`. You can host Exolink from there with `node index`. You'll be able to access Exolink from the port listed in the console.

### Hosting on Render
When you set the environment variables for your Web Service, choose to add from your .env. Set it to something like this:
```
PORT=3000
SOURCE_CODE=https://github.com/Ectoracer/Exolink
LINK_KEY=[XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX]
CUSTOM_LINK=false
```

`PORT` *must* be `3000`. To the best of my knowledge, Render will not expose Exolink otherwise.

For most people, `SOURCE_CODE` should always be `https://github.com/Ectoracer/Exolink`. Leave it as is unless you've modified the source code (you'll know if you have), in which case you'll need to publish the modified source code and put a link to it in `SOURCE_CODE`.

`CUSTOM_LINK` *must* be false. Only official instances have access to custom links (`exo.page.link`), because it requires access to the Firebase project associated with it.

Render will automatically install the needed dependencies and deploy Exolink. Others can access it from your project's "onrender.com" link.

### Hosting on Replit
In your Replit, go to Secrets and set the raw JSON to something like this:
```json
{
  "PORT": "3000",
  "SOURCE_CODE": "https://github.com/Ectoracer/Exolink",
  "LINK_KEY": "[XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX]",
  "CUSTOM_LINK": "false"
}
```

`PORT` *must* be `3000`. Replit will not expose Exolink otherwise.

For most people, `SOURCE_CODE` should always be `https://github.com/Ectoracer/Exolink`. Leave it as is unless you've modified the source code (you'll know if you have), in which case you'll need to publish the modified source code and put a link to it in `SOURCE_CODE`.

`CUSTOM_LINK` *must* be false. Only official instances have access to custom links (`exo.page.link`), because it requires access to the Firebase project associated with it.

You can now press Run. Exolink should appear in Replit's Webview, and others can access it from the Repl's link.

### Hosting on Glitch
Go to .env, and set it to Plaintext. Replace the contents of the file with something like this:
```
PORT=3000
SOURCE_CODE=https://github.com/Ectoracer/Exolink
LINK_KEY=[XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX]
CUSTOM_LINK=false
```

`PORT` *must* be `3000`. Glitch will not expose Exolink otherwise.

For most people, `SOURCE_CODE` should always be `https://github.com/Ectoracer/Exolink`. Leave it as is unless you've modified the source code (you'll know if you have), in which case you'll need to publish the modified source code and put a link to it in `SOURCE_CODE`.

`CUSTOM_LINK` *must* be false. Only official instances have access to the custom links (`exo.page.link`), because it requires access to the Firebase project associated with it.

Then, install the necessary dependencies with `npm ci` or `npm install`. Exolink should be accessible from the project page.

## License
The `public/favicon.ico`, `public/exo_bg.png`, and `public/phone.png` files are under the copyright of (and belongs to) Nyan Studio Games; admittedly used with forgiveness rather than permission.

Every other file is under the GNU Affero General Public License, version 3 of the License:

    Exolink lets you make Exoracer share links with custom titles, descriptions, and images.
    Copyright (C) 2022, 2023, 2024  JBMagination, et al.

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

Every file in the `links` directory is *also* under the MIT license.