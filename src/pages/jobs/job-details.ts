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

import { Component } from '@angular/core';
import { NavParams, ToastController } from 'ionic-angular';

import { SaltService } from '../../services/salt.service';
import { Job } from '../../services/salt/job';

@Component({
  selector: 'job-home',
  templateUrl: 'job-details.html'
})
export class JobDetailsPage {
    job: Job;

    constructor(private navParams: NavParams, private toastCtrl: ToastController, private saltService: SaltService) {
        this.job = navParams.get('job');
        this.getJobDetails(this.job);
    }
    
    private getJobDetails(job: Job) {
        if (!this.saltService.isAuthenticated()) {
// @todo: emit login_required
        } else {
            this.saltService.getJobDetails(job).subscribe(
                jobDetails => {
                    job.details = jobDetails;
                },
                error => this.handleGetJobDetailsError(error)
            );
        }
    }
        
    private handleGetJobDetailsError(error: any) {
        let toast = this.toastCtrl.create({
            message: 'Unable to get job details: ' + error,
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'Ok'
        });

        toast.onDidDismiss(() => {
            // @todo: add a button to retry
        });

        toast.present();
    }
}
