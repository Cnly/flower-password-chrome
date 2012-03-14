(function(win, doc) {
    win.addEventListener('message', function(e) {
        var data = e.data;
        if (typeof data === 'object') {
            var actionHandler = handlers[data.action];
            if (actionHandler) {
                var messageHandler = actionHandler[data.message];
                if (messageHandler) {
                    messageHandler(e);
                }
            }
        }
    });

    var handlers = {
        startMessage: {
            showIframe: function(e) {
                e.data.action = 'bubbleMessage';
                win.parent.postMessage(e.data, '*');
            }
        },
        bubbleMessage: {
            showIframe: function(e) {
                var iframeElement = findIframe(e.source);
                if (iframeElement) {
                    var box = iframeElement.getBoundingClientRect();
                    var padding = getPadding(iframeElement);
                    if (box) {
                        e.data.left += box.left + padding.left + iframeElement.clientLeft;
                        e.data.top += box.top + padding.top + iframeElement.clientTop;
                        if (win.self === win.top) {
                            var body = doc.body;
                            var clientLeft = doc.clientLeft || body.clientLeft || 0;
                            var clientTop = doc.clientTop || body.clientTop || 0;
                            var scrollLeft = win.pageXOffset;
                            var scrollTop = win.pageYOffset;
                            e.data.left += scrollLeft - clientLeft;
                            e.data.top += scrollTop - clientTop;
                            e.data.action = 'receiveMessage';
                            win.postMessage(e.data, '*');
                        } else {
                            win.parent.postMessage(e.data, '*');
                        }
                    }
                }
            }
        }
    };

    function getPadding(element) {
        var paddingTop = element.style.paddingTop;
        var paddingLeft = element.style.paddingLeft;
        paddingTop = (paddingTop === '') ? 0 : parseInt(paddingTop);
        paddingLeft = (paddingLeft === '') ? 0 : parseInt(paddingLeft);
        return {left: paddingLeft, top: paddingTop};
    }

    function findIframe(source) {
        var iframes = doc.getElementsByTagName('iframe');
        for (var i = 0; i < iframes.length; ++i) {
            if (iframes[i].contentWindow === source) {
                return iframes[i];
            }
        }
        var frames = doc.getElementsByTagName('frame');
        for (var i = 0; i < frames.length; ++i) {
            if (frames[i].contentWindow === source) {
                return frames[i];
            }
        }
    }
})(window, document);