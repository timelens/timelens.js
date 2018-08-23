class TimelensPlugin extends Clappr.UICorePlugin {
    get name() {
        return "timelens"
    }

    constructor(core) {
        super(core)
    }

    bindEvents() {
        this.listenTo(this.core.mediaControl, Clappr.Events.MEDIACONTROL_RENDERED, this._init)
    }

    _init() {
        var bar = this.core.mediaControl.el.querySelector(".bar-background");

        // Initialize the Timelens interface.
        timelens(bar, {
            timeline: this.core.options.timelens.timeline,
            thumbnails: this.core.options.timelens.thumbnails
        });
    }
}
