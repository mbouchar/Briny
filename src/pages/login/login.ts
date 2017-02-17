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
import { Response } from '@angular/http';
import { LoadingController, ViewController } from 'ionic-angular';

import { SaltService } from '../../services/salt.service'; 
 
@Component({
    templateUrl: 'login.html'
})
export class LoginModal {
    errorMessage: string;

    constructor(private saltService: SaltService, private loadingCtrl: LoadingController, private viewCtrl: ViewController) { }
    
    login(username: string, password: string) {
        this.errorMessage = null;
        let loader = this.loadingCtrl.create({
            content: "Please wait...",
            dismissOnPageChange: true
        });
        loader.present();
        this.saltService.login(username, password).subscribe(
            token => {
                loader.dismiss();
                this.viewCtrl.dismiss(token);
            },
            error => {
// @todo: add an error indicator
                loader.dismiss();
console.log(error);
                if (error instanceof Response && error.status == 401) {
                    this.errorMessage = "Login failed";
                }
            }
        );
    }
}
