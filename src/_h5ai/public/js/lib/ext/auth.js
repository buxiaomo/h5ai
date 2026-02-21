const {dom} = require('../util');
const server = require('../server');
const event = require('../core/event');
const location = require('../core/location');

const loginTpl =
        `<div id="login-wrapper">
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

    $pass.on('keydown', ev => {
        if (ev.which === 13) {
            login();
        }
    });

    $submit.on('click', login);

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
