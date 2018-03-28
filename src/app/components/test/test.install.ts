import { FireService } from './../../modules/firelibrary/core';
import { TestTools } from './test.tools';
import * as settings from './test.settings';

export class TestInstall extends TestTools {
    constructor(
    ) {
        super();
    }

    async run() {
        await this.install();
    }

    async install() {
        // await this.setAdmin();
        const result = await this.fire.checkInstall().then(re => {
            console.log('System is already installed.');
            return re.data.installed;
        })
            .catch(e => {
                this.bad('Failed to connect to check installation', e);
                return -1;
            });
        if (result === -1 || result === true) { // error or insalled?
            return result;
        }

        console.log('System is not installed. Going to install now');
        await this.fire.install({ email: settings.ADMIN_EMAIL }).then(re => {
            this.test(re.data === true, 'System is installed now. You cannot reinstall. but you can change admin email.');
        }).catch(e => this.bad('Failed to install', e));
    }
}
