// @ts-expect-error ignore
window.requestIdleCallback = function (callback) {
    function timeRemaining() {
        return 1
    }
    // @ts-expect-error ignore
    callback({
        timeRemaining,
    })
}
