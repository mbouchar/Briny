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
import { Minion } from '../../services/salt/minion';

@Component({
  selector: 'minions-home',
  templateUrl: 'minions.html'
})
export class MinionsPage {
    title: string = "Minions";
    
    private minions: Array<Minion>;
    
    constructor(private loadingCtrl: LoadingController, private toastCtrl: ToastController, private saltService: SaltService) {
        this.getMinions();
    }

    private getMinions() {
        let loader = this.loadingCtrl.create({
            content: "Getting minion list...",
            dismissOnPageChange: true
        });
        loader.present();

        if (!this.saltService.isAuthenticated()) {
// @todo: emit login_required
            console.log(this.saltService);
        } else {
            this.saltService.getMinions().subscribe(
                minions => {
// @todo: why does it throw an error?
//                    loader.dismiss();
                    this.minions = minions;
                    console.log(Object.keys(minions[0]['grains']));
                },
                error => {
                    loader.dismiss();
                    this.handleError('Unable to get minion list', error)
                }
            );
        }
    }
    
// @todo: duplicate code from jobs.ts
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
