function makeImageURL() {
    var confirmed = confirm("This will replace the existing image URL to make it match with the current level ID and level version. You do not need to use this button to use a custom image URL.")
    if (confirmed) {
        document.getElementById('levelID').setAttribute("readonly", "readonly")
        document.getElementById('levelVersion').setAttribute("readonly", "readonly")
        document.getElementById('imageURL').setAttribute("readonly", "readonly")
        
        var levelID = document.getElementById('levelID').value;
        var levelVersion = document.getElementById('levelVersion').value;
        document.getElementById('imageURL').value = `https://storage.googleapis.com/exoracer-bd008.appspot.com/levels/${levelID}-${levelVersion}.png`
        
        document.getElementById('levelID').removeAttribute("readonly")
        document.getElementById('levelVersion').removeAttribute("readonly")
        document.getElementById('imageURL').removeAttribute("readonly")
                
    }
}

function getData() {
    document.getElementById('shareLink').setAttribute("readonly", "readonly")
    document.getElementById('type').setAttribute("readonly", "readonly")
    document.getElementById('levelID').setAttribute("readonly", "readonly")
    document.getElementById('title').setAttribute("readonly", "readonly")
    document.getElementById('description').setAttribute("readonly", "readonly")
    document.getElementById('imageURL').setAttribute("readonly", "readonly")
    document.getElementById('levelVersion').setAttribute("readonly", "readonly")
    document.getElementById('suffixOption').setAttribute("readonly", "readonly")
    if (document.getElementById('customSuffix')) document.getElementById('customSuffix').setAttribute("readonly", "readonly")

    // client-side validation and correction
    var domainPrefix = document.getElementById('domainPrefix').value
    domainPrefix = domainPrefix.trim()
    if(domainPrefix !== "exo") domainPrefix = "exoracer"

    var link = document.getElementById('shareLink').value
    link = link.trim()
    if(link.startsWith('http://')) { link = link.substring(7) }
    else if (link.startsWith('https://')) { link = link.substring(8) }
    if (link.startsWith('preview.page.link/')) link = link.substring(18)
    if (link.startsWith('exo.page.link/')) link = link.substring(14)
    if (link.startsWith('exoracer.page.link/')) link = link.substring(19)

    document.getElementById('shareLink').value = link
    let suffixOption = "Unguessable";

    switch (link.length) {
        case 4:
            suffixOption = "Short";
            break;
        case 17:
            break;
        default:
            if (domainPrefix == "exoracer") {
                if (!(link[0] == '?')) {
                    alert('Something went wrong: Validation error: Short links must be either 4 or 17 characters')
                    document.getElementById('shareLink').removeAttribute("readonly")
                    document.getElementById('type').removeAttribute("readonly")
                    document.getElementById('levelID').removeAttribute("readonly")
                    document.getElementById('title').removeAttribute("readonly")
                    document.getElementById('description').removeAttribute("readonly")
                    document.getElementById('imageURL').removeAttribute("readonly")
                    document.getElementById('levelVersion').removeAttribute("readonly")
                    document.getElementById('suffixOption').removeAttribute("readonly")
                    if (document.getElementById('customSuffix')) document.getElementById('customSuffix').removeAttribute("readonly")
                    return
                }
            } else suffixOption = "Custom";
            break;
    }

    // actually make requests
    fetch('/getData', {
        method: 'POST', 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            "link": link,
            "domainPrefix": domainPrefix 
        })
    })
    .then((response) => response.json())
    .then((data) => {
        switch (data.status) {
            case "SUCCESS":
                document.getElementById('type').value = data.type
                showLevelVersion()
                document.getElementById('levelID').value = data.levelID
                document.getElementById('title').value = data.title
                document.getElementById('description').value = data.description
                document.getElementById('imageURL').value = data.imageURL
                document.getElementById('levelVersion').value = data.levelVersion
                document.getElementById('suffixOption').value = suffixOption
                document.getElementById('shareLink').removeAttribute("readonly")
                document.getElementById('type').removeAttribute("readonly")
                document.getElementById('levelID').removeAttribute("readonly")
                document.getElementById('title').removeAttribute("readonly")
                document.getElementById('description').removeAttribute("readonly")
                document.getElementById('imageURL').removeAttribute("readonly")
                document.getElementById('levelVersion').removeAttribute("readonly")
                document.getElementById('suffixOption').removeAttribute("readonly")
                if (document.getElementById('customSuffix')) document.getElementById('customSuffix').removeAttribute("readonly")
                break;
            case "ERROR":
                alert("Something went wrong: " + data.error)
                console.error("Something went wrong: " + data.error)
                document.getElementById('shareLink').removeAttribute("readonly")
                document.getElementById('type').removeAttribute("readonly")
                document.getElementById('levelID').removeAttribute("readonly")
                document.getElementById('title').removeAttribute("readonly")
                document.getElementById('description').removeAttribute("readonly")
                document.getElementById('imageURL').removeAttribute("readonly")
                document.getElementById('levelVersion').removeAttribute("readonly")
                document.getElementById('suffixOption').removeAttribute("readonly")
                if (document.getElementById('customSuffix')) document.getElementById('customSuffix').removeAttribute("readonly")
                break;
            default:
                alert('Something went horribly wrong')
                console.error('Something went horribly wrong')
                document.getElementById('shareLink').removeAttribute("readonly")
                document.getElementById('type').removeAttribute("readonly")
                document.getElementById('levelID').removeAttribute("readonly")
                document.getElementById('title').removeAttribute("readonly")
                document.getElementById('description').removeAttribute("readonly")
                document.getElementById('imageURL').removeAttribute("readonly")
                document.getElementById('levelVersion').removeAttribute("readonly")
                document.getElementById('suffixOption').removeAttribute("readonly")
                if (document.getElementById('customSuffix')) document.getElementById('customSuffix').removeAttribute("readonly")
                break;
        }
    })
    .catch((error) => {
        alert("Something went wrong: " + error)
        console.error("Something went wrong: " + error)
        document.getElementById('shareLink').removeAttribute("readonly")
        document.getElementById('type').removeAttribute("readonly")
        document.getElementById('levelID').removeAttribute("readonly")
        document.getElementById('title').removeAttribute("readonly")
        document.getElementById('description').removeAttribute("readonly")
        document.getElementById('imageURL').removeAttribute("readonly")
        document.getElementById('levelVersion').removeAttribute("readonly")
        document.getElementById('suffixOption').removeAttribute("readonly")
        if (document.getElementById('customSuffix')) document.getElementById('customSuffix').removeAttribute("readonly")
    })
}

function makeLink() {
    document.getElementById('shareLink').setAttribute("readonly", "readonly")
    document.getElementById('type').setAttribute("readonly", "readonly")
    document.getElementById('levelID').setAttribute("readonly", "readonly")
    document.getElementById('title').setAttribute("readonly", "readonly")
    document.getElementById('description').setAttribute("readonly", "readonly")
    document.getElementById('imageURL').setAttribute("readonly", "readonly")
    document.getElementById('levelVersion').setAttribute("readonly", "readonly")
    document.getElementById('suffixOption').setAttribute("readonly", "readonly")
    if (document.getElementById('customSuffix')) document.getElementById('customSuffix').setAttribute("readonly", "readonly")
    
    // client-side validation
    let levelIDregex = /^[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]-[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]$/
    if (!(levelIDregex.test(document.getElementById('levelID').value))) {
        alert('Something went wrong: Validation error: Invalid level ID')
        document.getElementById('shareLink').removeAttribute("readonly")
        document.getElementById('type').removeAttribute("readonly")
        document.getElementById('levelID').removeAttribute("readonly")
        document.getElementById('title').removeAttribute("readonly")
        document.getElementById('description').removeAttribute("readonly")
        document.getElementById('imageURL').removeAttribute("readonly")
        document.getElementById('levelVersion').removeAttribute("readonly")
        document.getElementById('suffixOption').removeAttribute("readonly")
        if (document.getElementById('customSuffix')) document.getElementById('customSuffix').removeAttribute("readonly")
        return
    }

    if (document.getElementById('suffixOption').value == "") document.getElementById('suffixOption').value = "Unguessable"

    // actually make requests
    let customSuffixValue = '';
    if (document.getElementById('customSuffix') && document.getElementById('customSuffix').value) customSuffixValue = document.getElementById('customSuffix').value;
    fetch('/makeLink', { 
        method: 'POST', 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "type": document.getElementById('type').value,
            "levelID": document.getElementById('levelID').value,
            "title": document.getElementById('title').value,
            "description": document.getElementById('description').value,
            "imageURL": document.getElementById('imageURL').value,
            "levelVersion": document.getElementById('levelVersion').value,
            "suffixOption": document.getElementById('suffixOption').value,
            "customSuffix": customSuffixValue
        })
    })
    .then((response) => response.json())
    .then((data) => {
        switch (data.status) {
            case "SUCCESS":
                document.getElementById('link').innerHTML = `<p><a href="${data.link}">${data.link}</a></p>`
                document.getElementById('shareLink').removeAttribute("readonly")
                document.getElementById('type').removeAttribute("readonly")
                document.getElementById('levelID').removeAttribute("readonly")
                document.getElementById('title').removeAttribute("readonly")
                document.getElementById('description').removeAttribute("readonly")
                document.getElementById('imageURL').removeAttribute("readonly")
                document.getElementById('levelVersion').removeAttribute("readonly")
                document.getElementById('suffixOption').removeAttribute("readonly")
                if (document.getElementById('customSuffix')) document.getElementById('customSuffix').removeAttribute("readonly")
                break;
            case "ERROR":
                alert("Something went wrong: " + data.error)
                console.error("Something went wrong: " + data.error)
                document.getElementById('shareLink').removeAttribute("readonly")
                document.getElementById('type').removeAttribute("readonly")
                document.getElementById('levelID').removeAttribute("readonly")
                document.getElementById('title').removeAttribute("readonly")
                document.getElementById('description').removeAttribute("readonly")
                document.getElementById('imageURL').removeAttribute("readonly")
                document.getElementById('levelVersion').removeAttribute("readonly")
                document.getElementById('suffixOption').removeAttribute("readonly")
                if (document.getElementById('customSuffix')) document.getElementById('customSuffix').removeAttribute("readonly")
                break;
            default:
                alert('Something went horribly wrong')
                console.error('Something went horribly wrong')
                document.getElementById('shareLink').removeAttribute("readonly")
                document.getElementById('type').removeAttribute("readonly")
                document.getElementById('levelID').removeAttribute("readonly")
                document.getElementById('title').removeAttribute("readonly")
                document.getElementById('description').removeAttribute("readonly")
                document.getElementById('imageURL').removeAttribute("readonly")
                document.getElementById('levelVersion').removeAttribute("readonly")
                document.getElementById('suffixOption').removeAttribute("readonly")
                if (document.getElementById('customSuffix')) document.getElementById('customSuffix').removeAttribute("readonly")
                break;
        }
    })
    .catch((error) => {
        alert("Something went wrong: " + error)
        console.error("Something went wrong: " + error)
        document.getElementById('shareLink').removeAttribute("readonly")
        document.getElementById('type').removeAttribute("readonly")
        document.getElementById('levelID').removeAttribute("readonly")
        document.getElementById('title').removeAttribute("readonly")
        document.getElementById('description').removeAttribute("readonly")
        document.getElementById('imageURL').removeAttribute("readonly")
        document.getElementById('levelVersion').removeAttribute("readonly")
        document.getElementById('suffixOption').removeAttribute("readonly")
        if (document.getElementById('customSuffix')) document.getElementById('customSuffix').removeAttribute("readonly")
    })
}

function showSuffixOption() {
    if (document.getElementById('customSuffix') && document.getElementById('customSuffixLabel')) {
        if (document.getElementById('suffixOption').value == "CUSTOM") {
            document.getElementById('customSuffix').hidden = false
            document.getElementById('customSuffixLabel').hidden = false
        } else {
            document.getElementById('customSuffix').hidden = true
            document.getElementById('customSuffixLabel').hidden = true
        }
    }
}

function showLevelVersion() {
    if (document.getElementById('type').value == "level") {
        document.getElementById('levelVersion').hidden = false
        document.getElementById('levelVersionLabel').hidden = false
        document.getElementById('imageURLButton').hidden = false
    } else {
        document.getElementById('levelVersion').hidden = true
        document.getElementById('levelVersionLabel').hidden = true
        document.getElementById('imageURLButton').hidden = true
    }
}