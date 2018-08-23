Object.assign(MediaElementPlayer.prototype, {
    buildtimelens(player, controls, layers, media) {
        const t = this;

        // Get the timeline from the video's "timeline" attribute.
        let vid = media.querySelector("video");
        let timeline = vid.dataset.timeline;

        // Get the thumbnails VTT from a "thumbnails" track.
        let thumbnailsTrack = vid.querySelector("track[label=\"thumbnails\"]");
        let thumbnails = thumbnailsTrack.src;

        let slider = controls.querySelector('.' + t.options.classPrefix + 'time-slider');

        // Initialize the Timelens interface.
        timelens(slider, {
            timeline: timeline,
            thumbnails: thumbnails
        });
    },

    cleantimelens(player, controls, layers, media) {}
});
