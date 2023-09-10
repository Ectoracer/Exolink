const express = require('express');
const app = express();
const axios = require('axios').default;
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const fs = require('fs');
const { google } = require('googleapis');
var path = require('path');
const { version } = require('./package.json');
require('dotenv').config();

let GoogleAuth;
if (process.env.CUSTOM_LINK == "true") {
    GoogleAuth = new google.auth.GoogleAuth({
        credentials: {
            "type": "service_account",
            "project_id": process.env.PROJECT_ID,
            "private_key_id": process.env.PRIVATE_KEY_ID,
            "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
            "client_email": process.env.CLIENT_EMAIL,
            "client_id": process.env.CLIENT_ID,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURI(process.env.CLIENT_EMAIL)}`
        },
        scopes: [ 'https://www.googleapis.com/auth/firebase' ]
    })
}

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.post('/getData', (req, res) => {
    console.log('POST /getData | Request received');
    (async () => {
        try {
            // server-side validation and correction
            var shortLink = req.body.link

            if (!(req.body.link)) {
                res.status(400).json({
                    "status": "ERROR",
                    "error": "No link sent"
                })
                return
            }
            if(shortLink.startsWith('http://')) shortLink = shortLink.substring(7)
            else if (shortLink.startsWith('https://')) shortLink = shortLink.substring(8)
            if (shortLink.startsWith('preview.page.link/')) shortLink = shortLink.substring(18)
            if (shortLink.startsWith('exo.page.link/')) shortLink = shortLink.substring(14)
            else if (shortLink.startsWith('exoracer.page.link/')) shortLink = shortLink.substring(19)

            let domainPrefix;
            domainPrefix = 'exoracer';
            if (req.body.domainPrefix) domainPrefix = req.body.domainPrefix;

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
                        if (domainPrefix == "exoracer") {
                            res.status(400).json({
                                "status": "ERROR",
                                "error": "Validation error: Short links must be either 4 or 17 characters"
                            });
                            return;
                        }
                        break;
                }
            }

            // actually doing the thing
            console.log(`POST /getData | Loading preview link for ${domainPrefix}.page.link/${shortLink}`)
            
            // replit and glitch shenanigans
            let browser;
            if (fs.existsSync('.replit') && fs.existsSync('replit.nix')) browser = await puppeteer.launch({ headless: 'new', executablePath: '/nix/store/x205pbkd5xh5g4iv0g58xjla55has3cx-chromium-108.0.5359.94/bin/chromium', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            else if (fs.existsSync('.glitchdotcom.json')) browser = await puppeteer.launch({ headless: 'new', executablePath: './node_modules/chromium/lib/chromium/chrome-linux/chrome', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            else browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();
            
            await page.goto(`https://${domainPrefix}.page.link/${shortLink}${additionalCharacter}d=1`, {
                waitUntil: 'networkidle0'
            });
            
            var link = await page.evaluate(() => {
                if (document.getElementsByClassName('cacJ4e')[0] && document.getElementsByClassName('cacJ4e')[0].getElementsByTagName('a')[0]) {
                    return document.getElementsByClassName('cacJ4e')[0].getElementsByTagName('a')[0].href.baseVal;
                } else {
                    return undefined;
                }
            });

            if (link && (process.env.DISCORD_WEBHOOK.startsWith('https://discord.com/api/webhooks/'))) axios.post(process.env.DISCORD_WEBHOOK, { content: `New link: https://${domainPrefix}.page.link/${shortLink}`});

            if (link && (link.indexOf('exo.page.link') > -1)) link = new URL(link).searchParams.get('link')
            if (link && (link.indexOf('deeplinkfallback.php') > -1)) { 
                console.log('POST /getData | Long dynamic link found'); 
            } else {
                console.log('POST /getData | Long dynamic link not found');
                res.status(400).json({
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
                "domainPrefix": domainPrefix,
                "inputChars": shortLink,
                "dynamicLink": link,
                "title": title,
                "description": description,
                "levelID": levelID,
                "imageURL": imageURL,
                "levelVersion": levelVersion,
                "suffixOption": suffixOption,
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                "status": "ERROR",
                "error": `${error}`
            })
        }
    })();
});

app.post('/makeLink', (req, res) => {
    console.log('POST /makeLink | Request received');
    (async () => {
        try {
            // server-side validation and correction + variables
            let levelID = req.body.levelID;
            let title = req.body.title;
            let description = req.body.description;
            let imageURL = req.body.imageURL;
            let levelVersion = parseInt(req.body.levelVersion);
            let customSuffix = req.body.customSuffix;
            let suffixOption;

            let levelIDregex = /^[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]$/
            if (!(levelIDregex.test(levelID))) {
                res.status(400).json({
                    "status": "ERROR",
                    "error": "Validation error: Invalid level ID"
                });
                return
            }

            console.log('POST /makeLink | Making request to ExoStats')
            let noLevelID;
            noLevelID = false;
            await axios(`https://exo.lgms.nl/?api&userlevel=${levelID}`)
            .then((response) => {
                if (levelVersion.toString() == "NaN") levelVersion = response.data.version
            })
            .catch((error) => {
                if (error.response.data.error == "Level ID not found") noLevelID = true
                else {
                    console.log(error)
                    levelVersion = 1
                }
            })

            // i should not have to do it this way
            // JavaScript is an odd language
            if (noLevelID) {
                res.status(400).json({
                    "status": "ERROR",
                    "error": "Validation error: Invalid level ID"
                });
                return
            }

            if (req.body.suffixOption == "SHORT") suffixOption = "SHORT"
            else if ((req.body.suffixOption == "CUSTOM") && GoogleAuth) suffixOption = "CUSTOM"
            else suffixOption = "UNGUESSABLE"

            // actually doing the thing
            console.log('POST /makeLink | Making request to create link')
            if ((suffixOption == "CUSTOM") && (GoogleAuth !== undefined)) {
                console.log('POST /makeLink | Custom suffix chosen')
                 await GoogleAuth.request({
                    method: "POST",
                    url: "https://firebasedynamiclinks.googleapis.com/v1/managedShortLinks:create",
                    data: {
                        "name": `${customSuffix} | ${title}`,
                        "dynamicLinkInfo": {
                            "domainUriPrefix": "https://exo.page.link",
                            "link": `https://exoracer.page.link:443/?ibi=com.nyanstudio.exoracer&link=https%3a%2f%2fexoracer.io%2f%3flink%3dLEVEL%26levelId%3d${levelID}%26levelVersion%3d${levelVersion}&si=${encodeURIComponent(imageURL)}&sd=${encodeURI(description).replace('%20', '+')}&st=${encodeURI(title).replace('%20', '+')}&apn=com.nyanstudio.exoracer&ofl=https%3a%2f%2fexoracer.io%2fdeeplinkfallback.php%3ftitle%3d${encodeURI(title).replace('%20', '%2b')}%26description%3d${encodeURI(description).replace('%20', '%2b')}%26imageUrl%3d${encodeURIComponent(imageURL)}`,
                            "socialMetaTagInfo": {
                                "socialTitle": title,
                                "socialDescription": description,
                                "socialImageLink": imageURL
                            },
                            "navigationInfo": {
                                "enableForcedRedirect": true
                            }
                        },
                        "suffix": {
                            "option": suffixOption,
                            "customSuffix": customSuffix
                        }
                    }
                })
                .then((response) => {
                    console.log(`POST /makeLink | Link created: ${response.data.managedShortLink.link}`)
                    res.json({
                        "status": "SUCCESS",
                        "link":`${response.data.managedShortLink.link}`
                    })
                    if (process.env.DISCORD_WEBHOOK.startsWith('https://discord.com/api/webhooks/')) axios.post(process.env.DISCORD_WEBHOOK, { content: `New link: ${response.data.managedShortLink.link}`})
                })
                .catch((error) => {
                    console.log(error)
                    res.status(500).json({
                        "status": "ERROR",
                        "error": `${error}`
                    })  
                })
            } else { 
                console.log('POST /makeLink | Unguessable or short suffix chosen')
                await axios.post(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.LINK_KEY}`, {
                    "longDynamicLink": `https://exoracer.page.link:443/?ibi=com.nyanstudio.exoracer&link=https%3a%2f%2fexoracer.io%2f%3flink%3dLEVEL%26levelId%3d${levelID}%26levelVersion%3d${levelVersion}&si=${encodeURIComponent(imageURL)}&sd=${encodeURI(description).replace('%20', '+')}&st=${encodeURI(title).replace('%20', '+')}&apn=com.nyanstudio.exoracer&ofl=https%3a%2f%2fexoracer.io%2fdeeplinkfallback.php%3ftitle%3d${encodeURI(title).replace('%20', '%2b')}%26description%3d${encodeURI(description).replace('%20', '%2b')}%26imageUrl%3d${encodeURIComponent(imageURL)}`,
                    "suffix": {
                        "option": suffixOption
                    }
                })
                .then((response) => {
                    console.log(`POST /makeLink | Link created: ${response.data.shortLink}`)
                    res.json({
                        "status": "SUCCESS",
                        "link":`${response.data.shortLink}`
                    })
                    if (process.env.DISCORD_WEBHOOK.startsWith('https://discord.com/api/webhooks/')) axios.post(process.env.DISCORD_WEBHOOK, { content: `New link: ${response.data.shortLink}`})
                })
                .catch((error) => {
                    console.log(error.response.data.error)
                    res.status(500).json({
                        "status": "ERROR",
                        "error": `${error.message}`
                    })  
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({
                "status": "ERROR",
                "error": `${error}`
            })  
        }
    })();
})

app.get('/nojs', (req, res) => {
    console.log(`GET /nojs | Request received`)
    if (req.query.link) {
        console.log(`GET /nojs | Making /getData request`)
        try {
            axios.post(`http://localhost:${server.address().port}/getData`, { 
                "link": req.query.link,
                "domainPrefix": req.query.domainPrefix
            })
            .then((response) => {
                let suffixOption = "Unguessable";
                switch (req.query.link.length) {
                    case 4:
                        suffixOption = "Short";
                        break;
                    default:
                        break;
                }

                res.render('nojs', { 'data': response.data, 'link': req.query.link, 'version': version, 'sourceCode': process.env.SOURCE_CODE })
            })
            .catch((error) => {
                console.log(error)
                res.status(500).render('nojs', { 'data': error.response.data, 'link': req.query.link, 'version': version, 'sourceCode': process.env.SOURCE_CODE })
            })
        } catch (error) {
            console.log(error);

            let errorData;
            if (error.response && error.response.data) { errorData = { "error": error.response.data } }
            else errorData = { "error": "Something went horribly wrong" }

            res.status(500).render('nojs', { 'data': errorData, 'link': req.query.link, 'version': version, 'sourceCode': process.env.SOURCE_CODE })
        }
        return
    }
    if (req.query.suffixOption) {
        console.log(`GET /nojs | Making /makeLink request`)
        try {
            console.log(req.query)
            axios.post(`http://localhost:${server.address().port}/makeLink`, {
                "levelID": req.query.levelID,
                "title": req.query.title,
                "description": req.query.description,
                "imageURL": req.query.imageURL,
                "levelVersion": req.query.levelVersion,
                "suffixOption": req.query.suffixOption.toUpperCase()
            })
            .then((response) => {
                res.render('nojs', { 'data': response.data, 'link': null, 'version': version, 'sourceCode': process.env.SOURCE_CODE })
            })
            .catch((error) => {
                console.log(error)
                res.status(500).render('nojs', { 'data': error.response.data, 'link': null, 'version': version, 'sourceCode': process.env.SOURCE_CODE })
            })
        } catch (error) {
            console.log(error);
                
            let errorData;
            if (error.response && error.response.data) { errorData = { "error": error.response.data } }
            else errorData = { "error": "Something went horribly wrong" }
                
            res.status(500).render('nojs', { 'data': errorData, 'link': null, 'version': version, 'sourceCode': process.env.SOURCE_CODE })
        }
        return
    }
    res.status(200).render('nojs', { 'data': null, 'link': null, 'version': version, 'sourceCode': process.env.SOURCE_CODE })
})

app.get('/', (req, res) => {
    console.log(`GET / | Request received`);
    res.status(200).render('index', { 'version': version, 'sourceCode': process.env.SOURCE_CODE });
});

if (!((process.env.SOURCE_CODE == "https://github.com/jbmagination/exolink") || (process.env.SOURCE_CODE == "https://github.com/Ectoracer/Exolink"))) {
    app.get('/changes.txt', (req, res) => {
        console.log(`GET /changes.txt | Request received`);
        res.sendFile('changes.txt', { root: path.join(__dirname) })
    })
}

app.get('*', (req, res) => {
    res.redirect('/');
})

var server = app.listen(process.env.PORT, () => console.log(`Running on port ${server.address().port}`));