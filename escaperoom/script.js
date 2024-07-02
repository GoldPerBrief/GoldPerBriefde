const hiddenImageId = "hidden_01";
const mainImage = document.getElementById("bg_01");
const hiddenImage = document.getElementById(hiddenImageId);
const highlightImage = document.getElementById('highlightImage');
const overlay = document.getElementById('overlay');
const actionIframe = document.getElementById('actionIframe');
const closeBtn = document.getElementById('closeBtn'); // Added
codeId = 0;

hiddenImage.crossOrigin = "Anonymous";

hiddenImage.onload = () => {
    mainImage.addEventListener("mousemove", handleMouseMove);
    mainImage.addEventListener("click", handleClick);
    document.getElementById("loadingText").style.display = 'none';
};

function handleMouseMove(event) {
    const rect = mainImage.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) / rect.width * hiddenImage.width);
    const y = Math.round((event.clientY - rect.top) / rect.height * hiddenImage.height);

    performActionBasedOnPixelColorHover(x, y, (color) => {
        if (color !== null) {
            highlightSimilarColorAreas(color);
            mainImage.style.cursor = 'pointer';
        } else {
            highlightImage.style.display = 'none';
            mainImage.style.cursor = 'default';
        }
    });
}

function handleClick(event) {
    const rect = mainImage.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) / rect.width * hiddenImage.width);
    const y = Math.round((event.clientY - rect.top) / rect.height * hiddenImage.height);

    performActionBasedOnPixelColor(x, y);
}

function performActionBasedOnPixelColorHover(x, y, callback) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = hiddenImage.width;
    canvas.height = hiddenImage.height;

    ctx.drawImage(hiddenImage, 0, 0);

    try {
        const imageData = ctx.getImageData(x, y, 1, 1);
        const pixel = imageData.data;

        if (pixel[3] === 0) {
            callback(null);
            return;
        }

        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        callback({ r, g, b });
    } catch (e) {
        console.error("Fehler beim Abrufen der Pixel-Daten:", e);
        callback(null);
    }
}

function highlightSimilarColorAreas(color) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = hiddenImage.width;
    canvas.height = hiddenImage.height;

    ctx.drawImage(hiddenImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r === color.r && g === color.g && b === color.b) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor((i / 4) / canvas.width);

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
    }

    if (minX <= maxX && minY <= maxY) {
        const rect = mainImage.getBoundingClientRect();
        const widthRatio = rect.width / hiddenImage.width;
        const heightRatio = rect.height / hiddenImage.height;

        highlightImage.style.left = `${rect.left + minX * widthRatio}px`;
        highlightImage.style.top = `${rect.top + minY * heightRatio}px`;
        highlightImage.style.width = `${(maxX - minX) * widthRatio}px`;
        highlightImage.style.height = `${(maxY - minY) * heightRatio}px`;
        highlightImage.style.display = 'block';
        highlightImage.src = `./assets/highlights/highlight_${color.r}_${color.g}_${color.b}.png`;
    } else {
        highlightImage.style.display = 'none';
    }
}

function performActionBasedOnPixelColor(x, y) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = hiddenImage.width;
    canvas.height = hiddenImage.height;

    ctx.drawImage(hiddenImage, 0, 0);

    try {
        const imageData = ctx.getImageData(x, y, 1, 1);
        const pixel = imageData.data;

        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];
        const a = pixel[3];

        // console.log(`RGB: (${r}, ${g}, ${b})`);

        performAction(r,g,b,a);
        // if (r === 255 && g === 0 && b === 0) {
        //     performRedAction();
        // } else if (r === 0 && g === 255 && b === 0) {
        //     performGreenAction();
        // } else if (r === 0 && g === 0 && b === 255) {
        //     performBlueAction();
        // } else if (r === 247 && g === 247 && b === 247) {
        //     performWhiteAction();
        // } else if (r === 102 && g === 102 && b === 102) {
        //     performBlackAction();
        // } else if (r === 255 && g === 0 && b === 255) {
        //     performMagentaAction();
        // } else {
        //     performDefaultAction();
        // }


    } catch (e) {
        console.error("Fehler beim Abrufen der Pixel-Daten:", e);
    }
    }

    // function performAction(r,g,b,a) {
         // this function needs to be present and properly implemented in the html.
         // dats importänd
    // };

// function performRedAction() {
//     console.log("Rot erkannt! Aktion für Rot ausführen.");
//     showIframe('https://learningapps.org/watch?app=pv3d5ihm224');
// }

// function performGreenAction() {
//     // console.log("Grün erkannt! Aktion für Grün ausführen.");
//     // showIframe('https://learningapps.org/watch?app=32557273');

//     // Codeeingabe
//     codeId = 1;
//     ergebnis = codeEingabe();
// }

// function performBlueAction() {
//     console.log("Blau erkannt! Aktion für Blau ausführen.");
//     showIframe('https://learningapps.org/watch?v=pvz63fmik24');
//     /* Code: 8394*/
// }

// function performWhiteAction() {
//     console.log("Blau erkannt! Aktion für Weiß ausführen.");
//     showIframe('https://learningapps.org/watch?v=pkfagetka24');
// }

// function performBlackAction() {
//     showIframe('https://learningapps.org/watch?v=peytzchtc24');
// }

// function performMagentaAction() {
//     // showDialog(0);
//     showIframe('https://learningapps.org/watch?v=ppmcq1h0t24')
// }

// function performDefaultAction() {
//     console.log("Keine spezifische Farbe erkannt. Standardaktion ausführen.");
// }

    function codeEingabe() {
        const params = {
            length: 4,
            charset: 'numeric'
        };

        const base64Params = btoa(JSON.stringify(params));

        const iframe = document.getElementById("actionIframe");
        showIframe("./assets/embed/embedCodeInput.html");

        iframe.onload = function() {
            iframe.contentWindow.postMessage(base64Params, '*');
        }


    }

function verifyCode(code) {
    switch (codeId) {
    case 1:
        korrekterCode = '8394';
        break;
    default:
        korrekterCode = '0000';
        break;
    }
    if (code === korrekterCode) {
        correctCodeEvent(code);
    } else {
        alert("leider falsch!")
    }
}

window.addEventListener('message', function(event) {
    try {
        const messageData = JSON.parse(event.data);
        if (messageData.type === 'codeSubmission') {
            closeIframe();
            verifyCode(messageData.code);
        }
    } catch (e) {
        console.error('Invalid message data', event.data, e);
    }
});

function showIframe(url) {
    // Adjust iframe loading to bypass third-party cookie blocking
    actionIframe.src = 'about:blank';
    actionIframe.contentWindow.location.replace(url);
    overlay.style.display = 'flex';
    mainImage.removeEventListener("mousemove", handleMouseMove);
    mainImage.style.cursor = 'default';
    highlightImage.style.display = 'none';
    // Enable close button functionality
    closeBtn.addEventListener('click', closeIframe);
}

function closeIframe() {
    overlay.style.display = 'none';
    mainImage.addEventListener("mousemove", handleMouseMove);
    // Remove event listener for close button after closing iframe
    closeBtn.removeEventListener('click', closeIframe);
}

window.addEventListener('load', () => {
    hiddenImage.onload();

    // Check if autoplay is allowed and adjust behavior accordingly
    if (actionIframe.contentDocument) {
        actionIframe.contentDocument.addEventListener('DOMContentLoaded', function () {
            actionIframe.contentDocument.querySelector('video').play().catch(function () {
                console.log('Autoplay is not allowed.');
            });
        });
    }
});