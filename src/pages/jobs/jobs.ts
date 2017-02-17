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
import { NavController, ToastController, LoadingController, ModalController } from 'ionic-angular';

import { SaltService } from '../../services/salt.service';
import { Job, LowState } from '../../services/salt/job';

import { JobDetailsPage } from './job-details';
import { NewJobModal } from './jobs.new';

@Component({
    selector: 'jobs-home',
    templateUrl: 'jobs.html'
})
export class JobsPage {
    title: string = "Jobs";
    jobs: Job[];

    private target: string = '*';
    private func: string = 'state.highstate';

    constructor(private navCtrl: NavController, private toastCtrl: ToastController, private loadingCtrl: LoadingController, private modalCtrl: ModalController, private saltService: SaltService) {
        this.getJobs();
    }
    
    private getJobs() {
        let loader = this.loadingCtrl.create({
            content: "Getting job list...",
            dismissOnPageChange: true
        });
        loader.present();

        if (!this.saltService.isAuthenticated()) {
// @todo: emit login_required
            console.log(this.saltService);
        } else {
            this.saltService.getJobs().subscribe(
                jobs => {
                    loader.dismiss();
                    this.jobs = jobs.reverse();
                },
                error => {
                    loader.dismiss();
                    this.handleError('Unable to get job list', error)
                }
            );
        }
    }
        
    showJobDetails(job: Job) {
        this.navCtrl.push(JobDetailsPage, { job: job });
    }
    
    runJob(lowState: LowState) {
        let loader = this.loadingCtrl.create({
            content: "Running job...",
            dismissOnPageChange: true
        });
        loader.present();

        if (!this.saltService.isAuthenticated()) {
// @todo: emit login_required
            console.log(this.saltService);
        } else {
            this.saltService.runJob(lowState).subscribe(
                jobInfo => {
                    loader.dismiss();
console.log(jobInfo);
                },
                error => {
                    loader.dismiss();
                    this.handleError('Unable to run job', error)
                }
            );
        }
    }
        
    newJob() {
        let newJobModal = this.modalCtrl.create(NewJobModal, null, {
            enableBackdropDismiss: false
        });
        newJobModal.onDidDismiss(lowstate => {
            this.runJob(lowstate);
        });
        newJobModal.present();
    }
    
    private handleError(message: string, error: any) {
        let toast = this.toastCtrl.create({
            message: message + ': ' + error,
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'Ok'
        });

        toast.onDidDismiss(() => {
            // @todo: add a retry button in the page
        });

        toast.present();
    }
}
