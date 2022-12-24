# Exolink
Exolink lets you make Exoracer share links with custom titles, descriptions, and images.

## Using Exolink
To use Exolink, you put an Exoracer share link into the "Share link" box, and press the "Get data" button. The other input fields will populate, and you can customize them as you wish.

When you're ready to create your link, choose "Make link", and the link will appear at the bottom of the page. You can copy this link and send it anywhere you'd like.

[![Exolink demonstration](./demonstration.gif)](#)
<i>This demonstration shows an earlier version of Exolink. The options and functionality are identical.</i>

## Running Exolink
To run Exolink on your own server, you'll need to obtain the dynamic link key (39 characters). That will not be provided here, but it's not horribly difficult to obtain if you know how to proxy network requests.

Once you have the key, make a `.env` file: 
```env
LINK_KEY=[XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX]
```

Then, install the necessary dependencies with `npm ci` or `npm install` - you can run Exolink from there with `node index`. You'll be able to access Exolink on port `2000`.