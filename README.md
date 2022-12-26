# Exolink
Exolink lets you make Exoracer share links with custom titles, descriptions, and images.
## Using Exolink
First, find an Exolink instance! You can access a list [here](https://jbmagination.com/exolink).

To use an Exolink instance, you put an Exoracer share link into the "Share link" box, and press the "Get data" button. The other input fields will populate, and you can customize them as you wish.

When you're ready to create your link, choose "Make link", and the link will appear at the bottom of the page. You can copy this link and send it anywhere you'd like.

[![Exolink demonstration](./demonstration.gif)](#)
*This demonstration shows an earlier version of Exolink. The options and functionality are identical.*

## Running an Exolink instance
To run Exolink on your own server, you'll need to obtain the dynamic link key (39 characters). That will not be provided here, but it's not horribly difficult to obtain if you know how to proxy network requests.

Once you have the key, make a `.env` file that looks something like this: 
```env
PORT=8080
SOURCE_CODE=https://github.com/jbmagination/exolink
LINK_KEY=[XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX]
```

For most people, `SOURCE_CODE` should always be `https://github.com/jbmagination/exolink`. Leave it as is unless you've modified the source code (you'll know if you have), in which case you'll need to publish the modified source code and put a link to it in `SOURCE_CODE`.

Then, install the necessary dependencies with `npm ci` or `npm install` - you can run Exolink from there with `node index`. You'll be able to access Exolink from the port listed in the console.

## License
The `favicon.ico` files are under the copyright of (and belong to) Nyan Studio Games, and are admittedly used with forgiveness rather than permission.

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