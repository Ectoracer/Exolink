const express = require('express');
const app = express();
const axios = require('axios').default;
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

app.all('*', (req, res, next) => {
    let path = req.path;
    if (path.endsWith('/') && !(path == '/')) path = path.slice(0, path.length - 1);
    if (path.startsWith('/image/')) path = `/image/***`;
    let pathName = path.slice(1);
    if (!(fs.existsSync(`./views/${pathName}.ejs`)) && (fs.existsSync(`./links/exoracer/${pathName}.json`) || fs.existsSync(`./links/exo/${pathName}.json`))) path = `/***`
    if (path.startsWith('/link/')) path = `/link/***/***`;
    console.log(`${req.method} ${path} | Request received`);
    next();
})

app.post('/getData', (req, res) => {
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
            console.log(`POST /getData | Loading link`)
            
            let link;
            let type = 'level';
            await axios(`https://${domainPrefix}.page.link/${shortLink}${additionalCharacter}d=1`, {
                "headers": {
                    "User-Agent": "Mozilla/5.0 (compatible; Exolink/1.0; +https://github.com/Ectoracer/Exolink)"
                }
            })
            .then((response) => {
                let data = response.data;
                data = data.slice(data.indexOf('AF_initDataCallback({'), data.indexOf('sideChannel: {}') - 2)
                data = data.slice(data.indexOf('data:') + 5);
                data = JSON.parse(data);
                link = data[6];
                console.log(link);
            })
            .catch((error) => {                
                return;
            })

            if (link && process.env.DISCORD_WEBHOOK && (process.env.DISCORD_WEBHOOK.startsWith('https://discord.com/api/webhooks/')) && (!(fs.existsSync(`./${domainPrefix}/${shortLink}.json`)))) {
                axios.post(process.env.DISCORD_WEBHOOK, { content: `New link: https://${domainPrefix}.page.link/${shortLink}`});
            }

            if (link && (link.indexOf('exo.page.link') > -1)) link = new URL(link).searchParams.get('link')
            if (link && (link.indexOf('?link%3DLOBBY') > -1)) { 
                console.log('POST /getData | Lobby link detected');
                type = 'lobby';
            }
            if (link && (link.indexOf('deeplinkfallback.php') > -1)) { 
                console.log('POST /getData | Long dynamic link found'); 
            } else {
                console.log('POST /getData | Long dynamic link not found');
                res.status(400).json({
                    "status": "ERROR",
                    "error": "Long dynamic link couldn't be found - does your short link exist?"
                });
                return
            }

            let levelID;
            let levelVersion;
            if (type == 'lobby') levelID = link.substring(link.indexOf('lobbyId%3D')).substring(10, 46);
            else levelID = link.substring(link.indexOf('levelId%3D')).substring(10, 46);
            let title = decodeURIComponent(link).substring(decodeURIComponent(link).indexOf('?title=')).substring(7).split('&')[0].replaceAll('+', ' ')
            let description = decodeURIComponent(link).substring(decodeURIComponent(link).indexOf('&description=')).substring(13).split('&')[0].replaceAll('+', ' ')
            let imageURL = decodeURIComponent(decodeURIComponent(link).substring(decodeURIComponent(link).indexOf('&imageUrl=')).substring(10).split('&')[0])
            if (type == 'lobby') levelVersion = 1;
            else levelVersion = decodeURIComponent(link).substring(decodeURIComponent(link).indexOf('&levelVersion=')).substring(14).split('&')[0]
            
            if (parseInt(levelVersion).toString() == "NaN") levelVersion = 1

            res.json({
                "status": "SUCCESS",
                "domainPrefix": domainPrefix,
                "inputChars": shortLink,
                "dynamicLink": link,
                "title": title,
                "description": description,
                "type": type,
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
    (async () => {
        try {
            // server-side validation and correction + variables
            let type = (req.body.type == 'lobby') ? "lobby" : "level";
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

            if (type == 'level') {
                console.log('POST /makeLink | Making request to ExoStats')
                let noLevelID;
                noLevelID = false;
                await axios(`https://exostats.nl/?api&userlevel=${levelID}`, {
                    "headers": {
                        "User-Agent": "Mozilla/5.0 (compatible; Exolink/1.0; +https://github.com/Ectoracer/Exolink)"
                    }
                })
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
            }

            if (req.body.suffixOption == "SHORT") suffixOption = "SHORT"
            else if ((req.body.suffixOption == "CUSTOM") && GoogleAuth) suffixOption = "CUSTOM"
            else suffixOption = "UNGUESSABLE"

            let levelVersionParam = '';
            if (type == 'level') levelVersionParam = `%26levelVersion%3d${levelVersion}`;

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
                            "link": `https://exoracer.page.link:443/?ibi=com.nyanstudio.exoracer&link=https%3a%2f%2fexoracer.io%2f%3flink%3d${type.toUpperCase()}%26${type}Id%3d${levelID}${levelVersionParam}&si=${encodeURIComponent(imageURL)}&sd=${encodeURI(description).replace('%20', '+')}&st=${encodeURI(title).replace('%20', '+')}&apn=com.nyanstudio.exoracer&ofl=https%3a%2f%2fexoracer.io%2fdeeplinkfallback.php%3ftitle%3d${encodeURI(title).replace('%20', '%2b')}%26description%3d${encodeURI(description).replace('%20', '%2b')}%26imageUrl%3d${encodeURIComponent(imageURL)}`,
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
                    console.log(`POST /makeLink | Link created`)
                    res.json({
                        "status": "SUCCESS",
                        "link":`${response.data.managedShortLink.link}`
                    })
                    if (process.env.DISCORD_WEBHOOK && process.env.DISCORD_WEBHOOK.startsWith('https://discord.com/api/webhooks/')) axios.post(process.env.DISCORD_WEBHOOK, { content: `New link: ${response.data.managedShortLink.link}`})
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
                    "longDynamicLink": `https://exoracer.page.link:443/?ibi=com.nyanstudio.exoracer&link=https%3a%2f%2fexoracer.io%2f%3flink%3d${type.toUpperCase()}%26${type}Id%3d${levelID}${levelVersionParam}&si=${encodeURIComponent(imageURL)}&sd=${encodeURI(description).replace('%20', '+')}&st=${encodeURI(title).replace('%20', '+')}&apn=com.nyanstudio.exoracer&ofl=https%3a%2f%2fexoracer.io%2fdeeplinkfallback.php%3ftitle%3d${encodeURI(title).replace('%20', '%2b')}%26description%3d${encodeURI(description).replace('%20', '%2b')}%26imageUrl%3d${encodeURIComponent(imageURL)}`,
                    "suffix": {
                        "option": suffixOption
                    }
                })
                .then((response) => {
                    console.log(`POST /makeLink | Link created`)
                    res.json({
                        "status": "SUCCESS",
                        "link":`${response.data.shortLink}`
                    })
                    if (process.env.DISCORD_WEBHOOK && process.env.DISCORD_WEBHOOK.startsWith('https://discord.com/api/webhooks/')) axios.post(process.env.DISCORD_WEBHOOK, { content: `New link: ${response.data.shortLink}`})
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
    if (req.query.link) {
        console.log(`GET /nojs | Making /getData request`)
        try {
            axios.post(`http://localhost:${server.address().port}/getData`, { 
                "link": req.query.link,
                "domainPrefix": req.query.domainPrefix
            }, {
                "headers": {
                    "User-Agent": "Mozilla/5.0 (compatible; Exolink/1.0; +https://github.com/Ectoracer/Exolink)"
                }
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

app.get('/privacy', (req, res) => {
    res.status(200).render('privacy', { 'version': version, 'sourceCode': process.env.SOURCE_CODE });
});

app.get('/', (req, res) => {
    res.status(200).render('index', { 'version': version, 'sourceCode': process.env.SOURCE_CODE });
});

app.get('/image/*', (req, res) => {
    let url;
    try {
        url = new URL(req.path.replace('/image/','')).toString()
    } catch (error) {
        res.status(404).send('')
    }
    axios(url, {
        headers: {
            "Accept": "image/png, image/x-png, image/jpeg, image/gif, image/*, */*",
            "User-Agent": "Mozilla/5.0 (compatible; Exolink/1.0; +https://github.com/Ectoracer/Exolink)"
        },
        responseType: 'arraybuffer'
    })
    .then((response) => {
        if (!(response.headers['content-type'] && response.headers['content-type'].startsWith('image/'))) {
            res.status(404).send('')
        } else {
            if (response.status !== 200) res.status(404).send('')
            else {
                res.contentType(response.headers['content-type'])
                res.header('Content-Length', response.data.length)
                res.status(response.status).send(response.data)
            }
        }
    })
    .catch((error) => {
        if (error.response) {
            res.status(404).send('')
        } else {
            console.error(error)
            res.status(500).send('')
        }
    })
});

if (!((process.env.SOURCE_CODE == "https://github.com/jbmagination/exolink") || (process.env.SOURCE_CODE == "https://github.com/Ectoracer/Exolink"))) {
    app.get('/changes.txt', (req, res) => {
        res.sendFile('changes.txt', { root: path.join(__dirname) })
    })
}

app.get('/link/:prefix/:id', (req, res) => {
    if (fs.existsSync(`./links/${req.params.prefix}/${req.params.id}.json`)) {
        let level = JSON.parse(fs.readFileSync(`./links/${req.params.prefix}/${req.params.id}.json`, 'utf-8'));
        let imageAvailable = false;
        if (level.image) {
            axios(`http://localhost:${server.address().port}/image/${level.image}`)
            .then((response) => { 
                if (response.status == 200) {
                    imageAvailable = true;
                    res.status(200).render('link', { 'version': version, 'sourceCode': process.env.SOURCE_CODE, 'level': level, 'imageAvailable': imageAvailable });
                } else res.status(200).render('link', { 'version': version, 'sourceCode': process.env.SOURCE_CODE, 'level': level, 'imageAvailable': imageAvailable });
            })
            .catch((error) => {
                if (error.response) {
                    res.status(200).render('link', { 'version': version, 'sourceCode': process.env.SOURCE_CODE, 'level': level, 'imageAvailable': imageAvailable });
                } else {
                    console.error(error);
                    res.status(500).send('Something went wrong!')
                }
            })
        } else res.status(200).render('link', { 'version': version, 'sourceCode': process.env.SOURCE_CODE, 'level': level, 'imageAvailable': imageAvailable });
    } else res.redirect('/');
});

app.get('*', (req, res) => {
    if (fs.existsSync(`./links/exoracer/${req.path.slice(1)}.json`)) res.redirect(`/link/exoracer/${req.path.slice(1)}`);
    else if (fs.existsSync(`./links/exo/${req.path.slice(1)}.json`)) res.redirect(`/link/exo/${req.path.slice(1)}`);
    else res.redirect('/');
})

var server = app.listen(process.env.PORT, () => console.log(`Running on port ${server.address().port}`));