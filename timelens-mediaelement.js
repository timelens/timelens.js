Object.assign(MediaElementPlayer.prototype, {
    buildtimelens(player, controls, layers, media) {
        const t = this;

        // Get the timeline from the video's "timeline" attribute.
        let vid = media.querySelector("video");
        let timeline = vid.dataset.timeline;

        // Get the thumbnails VTT from a "thumbnails" track.
        let thumbnailsTrack = vid.querySelector("track[label=\"thumbnails\"]");
        let thumbnails = thumbnailsTrack.src;

        // Make the time slider thicker and shift it up.
        let slider = controls.querySelector('.' + t.options.classPrefix + 'time-slider');
        slider.style.height = "40px";
        slider.style["margin-top"] = "-15px";

        // Move the time display to the front.
        let time_float = controls.querySelector('.' + t.options.classPrefix + 'time-float');
        time_float.style["z-index"] = "999";

        // Initialize the Timelens interface.
        timelens(slider, {
            timeline: timeline,
            thumbnails: thumbnails
        });
    },

    cleantimelens(player, controls, layers, media) {}
});
