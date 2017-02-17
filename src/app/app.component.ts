/* Briny : A SaltStack Web Administration GUI
 * Copyright (C) 2017 Mathieu Bouchard
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, ModalController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { SaltService } from '../services/salt.service';

import { LoginModal } from '../pages/login/login';

import { HomePage } from '../pages/home/home';
import { JobsPage } from '../pages/jobs/jobs';
import { MinionsPage } from '../pages/minions/minions';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    // The page title
    title: "Briny : SaltStack administration";
    
    // white crystalline
    // Taste
    // Saltcellar, Saline
    // Briny
    
    // The main menu title
    menuTitle: string = 'Menu';

    pages: Array<{title: string, icon: string, component: any}>;

    // The main page of the app
    private rootPage: any;
    
    constructor(private platform: Platform, private modalCtrl: ModalController, private saltService: SaltService) {
        this.initializeApp();

        // List of pages to show in the main menu
        this.pages = [
            { title: 'Home',    icon: 'home',        component: HomePage },
            { title: 'Jobs',    icon: 'speedometer', component: JobsPage },
            { title: 'Minions', icon: 'pulse',       component: MinionsPage },
            { title: 'About',   icon: 'person',      component: AboutPage },
            { title: 'Contact', icon: 'mail',        component: ContactPage }
        ];
    }
    
    initializeApp() {
        this.platform.ready().then(() => {
            // https://ionicframework.com/docs/v2/api/platform/Platform/
            if (this.platform.is('cordova')) {
                StatusBar.styleDefault();
                Splashscreen.hide();
            }
        });
    }

    ngOnInit() {
        this.rootPage = HomePage;

// @todo: guard?
        if (!this.saltService.isAuthenticated()) {
            let loginModal = this.modalCtrl.create(LoginModal, null, {
                enableBackdropDismiss: false
            });
            loginModal.onDidDismiss(token => console.log(token));
            loginModal.present();
        }
    }

    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    }
}

// @todo: login: Prompt Alerts
// @todo: front-page: Badge + Cards