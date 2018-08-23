function timelens(container, options) {
    // Load VTT file asynchronously, then continue with the initialization.
    let vtt_url;
    if (options.thumbnails) {
        vtt_url = options.thumbnails;
    }

    var request = new XMLHttpRequest();
    request.open('GET', vtt_url, true);
    request.send(null);
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            var type = request.getResponseHeader('Content-Type');
            if (type.indexOf("text") !== 1) {
                timelens2(container, request.responseText, options);
            }
        }
    }
}

// Actually initialize Timelens.
function timelens2(container, vtt, options) {
    var thumbnails = parseVTT(vtt);
    var duration = thumbnails[thumbnails.length - 1].to;

    // Use querySelector if a selector string is specified.
    if (typeof container == "string")
        container = document.querySelector(container);

    // This will be our main .timelens div, which will contain all new elements.
    if (container.className != "") {
        container.className += " ";
    }
    container.className += "timelens";

    // Create div which contains the preview thumbnails.
    var thumbnail = document.createElement("div");
    thumbnail.className = "timelens-thumbnail";

    // Create div which contains the thumbnail time.
    var time = document.createElement("div");
    time.className = "timelens-time";

    // Create .timeline img, which displays the visual timeline.
    var timeline = document.createElement("img");
    timeline.src = options.timeline;
    // Prevent the timeline image to be dragged
    timeline.setAttribute("draggable", "false");

    // Assemble everything together.
    container.appendChild(timeline);
    container.appendChild(thumbnail);
    thumbnail.appendChild(time);

    // Create .marker div, which is used to display the current position.
    if (options.position) {
        var marker = document.createElement("div");
        marker.className = "timelens-marker";
        container.appendChild(marker);
    }

    // When clicking the timeline, seek to the respective position.
    if (!!options.seek) {
        timeline.onclick = function(event) {
            var progress = progressAtMouse(event, timeline);
            options.seek(progress * duration);
        };
    }

    timeline.onmousemove = function(event) {
        // Calculate click position in seconds.
        var progress = progressAtMouse(event, timeline);
        let seconds = progress * duration;

        let thumbnail_dir = options.thumbnails.substring(0, options.thumbnails.lastIndexOf("/") + 1);

        // Find the first entry in `thumbnails` which contains the current position.
        let active_thumbnail = null;
        for (let t of thumbnails) {
            if (seconds >= t.from && seconds <= t.to) {
                active_thumbnail = t;
                break
            }
        }

        // Set respective background image.
        thumbnail.style["background-image"] = "url(" + thumbnail_dir + active_thumbnail.file + ")";
        // Move background to the correct location.
        thumbnail.style["background-position"] = -active_thumbnail.x + "px " + -active_thumbnail.y + "px";

        // Set thumbnail div to correct size.
        thumbnail.style.width = active_thumbnail.w + "px";
        thumbnail.style.height = active_thumbnail.h + "px";

        // Move thumbnail div to the correct position.
        thumbnail.style.marginLeft = Math.min(
            Math.max(0, x - active_thumbnail.w / 2 - 5),
            timeline.offsetWidth - active_thumbnail.w
        ) + "px";

        time.innerHTML = to_timestamp(seconds);
    };

    if (options.position) {
        setInterval(function() {
            marker.style.marginLeft = options.position() / duration * timeline.offsetWidth - 11 + "px";
        }, 1);
    }
}

// Convert a WebVTT timestamp (which has the format [HH:]MM:SS.mmm) to seconds.
function from_timestamp(timestamp) {
    let matches = timestamp.match(/(.*):(.*)\.(.*)/);

    let minutes = parseInt(matches[1]);
    let seconds = parseInt(matches[2]);
    let mseconds = parseInt(matches[3]);

    let seconds_total = mseconds / 1000 + seconds + 60 * minutes;

    return seconds_total;
}

// Convert a position in seconds to a [H:]MM:SS timestamp.
function to_timestamp(seconds_total) {
    let hours = Math.floor(seconds_total / 60 / 60);
    let minutes = Math.floor(seconds_total / 60 - hours * 60);
    let seconds = Math.floor(seconds_total - 60 * minutes - hours * 60 * 60);

    let timestamp = minutes+":"+pad(seconds, 2);

    if (hours > 0) {
        return hours + ":" + pad(timestamp, 5);
    } else {
        return timestamp;
    }
}

// How far is the mouse into the timeline, in a range from 0 to 1?
function progressAtMouse(event, timeline) {
    x = event.offsetX ? event.offsetX : event.pageX - timeline.offsetLeft;
    return x / timeline.offsetWidth;
}

// Parse a VTT file pointing to JPEG files using media fragment notation.
function parseVTT(vtt) {
    let from = 0;
    let to = 0;

    let thumbnails = [];

    for (let line of vtt.split("\n")) {
        if (/-->/.test(line)) {
            // Parse a "cue timings" part.
            var matches = line.match(/(.*) --> (.*)/);

            from = from_timestamp(matches[1]);
            to = from_timestamp(matches[2]);
        } else if (/jpg/.test(line)) {
            // Parse a "cue payload" part.
            var matches = line.match(/(.*)\?xywh=(.*),(.*),(.*),(.*)/);

            thumbnails.push({
                from: from,
                to: to,
                file: matches[1],
                x: matches[2],
                y: matches[3],
                w: matches[4],
                h: matches[5],
            });
        }
    }

    return thumbnails;
}

function pad(num, size){
    return ('000000000' + num).substr(-size);
}
