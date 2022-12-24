const express = require('express');
const app = express();
const axios = require('axios').default;
const puppeteer = require('puppeteer');
const ejs = require('ejs');
require('dotenv').config();

app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');

app.get('/', (req,res) => {
    console.log('Homepage request received')
    res.render('index')
})

app.post('/getData', (req, res) => {
    console.log('/getData request received');
    (async () => {
        try {
            // server-side validation and correction
            var shortLink = req.body.link

            if(shortLink.startsWith('http://')) { shortLink = shortLink.substring(7) }
            else if (shortLink.startsWith('https://')) { shortLink = shortLink.substring(8) }
            if (shortLink.startsWith('preview.page.link/')) shortLink = shortLink.substring(18)
            if (shortLink.startsWith('exoracer.page.link/')) shortLink = shortLink.substring(19)

            let additionalCharacter;
            let suffixOption;
            if (shortLink.indexOf('?') > -1) {
                additionalCharacter = '&';
                suffixOption = "LONG";
            } else {
                additionalCharacter = '?'
                switch (shortLink.length) {
                    case 4:
                        suffixOption = "SHORT";
                        break;
                    case 17:
                        suffixOption = "UNGUESSABLE";
                        break;
                    default:
                        res.json({
                            "status": "ERROR",
                            "error": "Validation error: Short links must be either 4 or 17 characters"
                        });
                        return;
                        break;
                }
            }

            // actually doing the thing
            console.log(`Loading preview link for exoracer.page.link/${shortLink}`)
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            
            await page.goto(`https://exoracer.page.link/${shortLink}${additionalCharacter}d=1`, {
                waitUntil: 'networkidle0'
            });
            
            const link = await page.evaluate(() => {
                if (document.getElementsByClassName('cacJ4e')[0] && document.getElementsByClassName('cacJ4e')[0].getElementsByTagName('a')[0]) {
                    return document.getElementsByClassName('cacJ4e')[0].getElementsByTagName('a')[0].href.baseVal;
                } else {
                    return undefined;
                }
            });
            if (link) { 
                console.log('Long dynamic link found'); 
            } else {
                console.log('Long dynamic link not found');
                res.json({
                    "status": "ERROR",
                    "error": "Long dynamic link couldn't be found - does your short link exist?"
                });
                await browser.close();
                return
            }
            
            await browser.close();

            let levelID = link.substring(link.indexOf('levelId%3D')).substring(10, 46);
            let title = decodeURIComponent(link).substring(decodeURIComponent(link).indexOf('?title=')).substring(7).split('&')[0].replaceAll('+', ' ')
            let description = decodeURIComponent(link).substring(decodeURIComponent(link).indexOf('&description=')).substring(13).split('&')[0].replaceAll('+', ' ')
            let imageURL = decodeURIComponent(decodeURIComponent(link).substring(decodeURIComponent(link).indexOf('&imageUrl=')).substring(10).split('&')[0])
            let levelVersion = decodeURIComponent(link).substring(decodeURIComponent(link).indexOf('&levelVersion=')).substring(14).split('&')[0]
            
            if (parseInt(levelVersion).toString() == "NaN") levelVersion = 1

            res.json({
                "status": "SUCCESS",
                "title": title,
                "description": description,
                "levelID": levelID,
                "imageURL": imageURL,
                "levelVersion": levelVersion,
                "suffixOption": suffixOption,
            })
        } catch (error) {
            console.log(error)
            res.json({
                "status": "ERROR",
                "error": `${error}`
            })
        }
    })();
});

app.post('/makeLink', (req, res) => {
    console.log('/makeLink request received');
    (async () => {
        try {
            // server-side validation and correction + variables
            let levelID = req.body.levelID;
            let title = req.body.title;
            let description = req.body.description;
            let imageURL = req.body.imageURL;
            let levelVersion = parseInt(req.body.levelVersion);
            let suffixOption;

            if (levelVersion.toString() == "NaN") levelVersion = 1

            if (req.body.suffix == "SHORT") suffixOption = "SHORT"
            else suffixOption = "UNGUESSABLE"

            let levelIDregex = /^[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]$/
            if (!(levelIDregex.test(levelID))) {
                res.json({
                    "status": "ERROR",
                    "error": "Validation error: Invalid level ID"
                });
                return
            }

            // actually doing the thing
            console.log('Making request to create link')
            await axios.post(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.LINK_KEY}`, {
                "longDynamicLink": `https://exoracer.page.link:443/?ibi=com.nyanstudio.exoracer&link=https%3a%2f%2fexoracer.io%2f%3flink%3dLEVEL%26levelId%3d${levelID}%26levelVersion%3d${levelVersion}&si=${encodeURIComponent(imageURL)}&sd=${encodeURI(description).replace('%20', '+')}&st=${encodeURI(title).replace('%20', '+')}&apn=com.nyanstudio.exoracer&ofl=https%3a%2f%2fexoracer.io%2fdeeplinkfallback.php%3ftitle%3d${encodeURI(title).replace('%20', '%2b')}%26description%3d${encodeURI(description).replace('%20', '%2b')}%26imageUrl%3d${encodeURIComponent(imageURL)}`,
                "suffix": {
                    "option": suffixOption
                }
            })
            .then((response) => {
                console.log(`Link created: ${response.data.shortLink}`)
                res.json({
                    "status": "SUCCESS",
                    "link":`${response.data.shortLink}`
                })
            })
            .catch((error) => {
                console.log(error.message)
                res.json({
                    "status": "ERROR",
                    "error": `${error.message}`
                })  
            })
        } catch (error) {
            console.log(error)
            res.json({
                "status": "ERROR",
                "error": `${error}`
            })  
        }
    })();
})

app.listen('8080', () => {});