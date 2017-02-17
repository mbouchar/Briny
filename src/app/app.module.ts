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

import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { SaltService } from '../services/salt.service';

import { LoginModal } from '../pages/login/login';

import { AboutPage } from '../pages/about/about';
import { JobsPage } from '../pages/jobs/jobs';
import { NewJobModal } from '../pages/jobs/jobs.new';
import { JobDetailsPage } from '../pages/jobs/job-details';
import { MinionsPage } from '../pages/minions/minions';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';

import { KeysPipe } from '../pipes/keys';

@NgModule({
    declarations: [
        MyApp,
        AboutPage,
        JobsPage,
        JobDetailsPage,
        MinionsPage,
        ContactPage,
        HomePage,
        LoginModal,
        NewJobModal,
        KeysPipe,
    ],
    imports: [
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        AboutPage,
        JobsPage,
        JobDetailsPage,
        MinionsPage,
        ContactPage,
        HomePage,
        LoginModal,
        NewJobModal,
    ],
    providers: [
        SaltService,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {}
