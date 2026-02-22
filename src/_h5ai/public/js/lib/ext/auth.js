const {dom} = require('../util');
const server = require('../server');
const event = require('../core/event');
const location = require('../core/location');

const loginTpl =
        `<div id="login-wrapper">
            <div id="login-close">×</div>
            <input id="pass" type="password" placeholder="password"/>
            <span id="login">login</span>
            <div id="hint">
                This directory is protected.
            </div>
        </div>`;

const init = () => {
    const $login = dom(loginTpl).hide().appTo('body');
    const $pass = $login.find('#pass');
    const $submit = $login.find('#login');
    const $close = $login.find('#login-close');
    let currentHref = null;

    const login = () => {
        const pass = $pass.val();
        server.request({
            action: 'login_directory',
            href: currentHref,
            pass: pass
        }).then(response => {
            if (response && response.success) {
                $login.hide();
                $pass.val('');
                location.refresh();
            } else {
                $login.find('#hint').text('Wrong password.');
                setTimeout(() => {
                    $login.find('#hint').text('This directory is protected.');
                }, 2000);
            }
        });
    };

    const getParentHref = href => {
        if (!href) {
            return href;
        }

        let h = href;
        if (h.length > 1 && h.endsWith('/')) {
            h = h.slice(0, -1);
        }

        const parts = h.split('/');
        if (parts.length <= 2) {
            return '/';
        }

        const parent = parts.slice(0, -1).join('/');
        return parent === '' ? '/' : parent + '/';
    };

    const hide = () => {
        const href = currentHref;
        $pass.val('');
        currentHref = null;
        $login.hide();

        if (href) {
            const parentHref = getParentHref(href);
            if (parentHref && parentHref !== href) {
                location.setLocation(parentHref);
            }
        }
    };

    $pass.on('keydown', ev => {
        if (ev.which === 13) {
            login();
        }
    });

    $submit.on('click', login);

    $close.on('click', hide);

    dom(global.document).on('keydown', ev => {
        if (ev.which === 27) {
            hide();
        }
    });

    event.sub('location.authRequired', href => {
        currentHref = href;
        $login.show();
        $pass[0].focus();
    });

    event.sub('location.changed', () => {
        $login.hide();
    });
};

init();
