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

import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { LoginData } from './salt/login';

import { Job, JobDetails, JobResult, LowState } from './salt/job';
import { Minion } from './salt/minion';

@Injectable()
export class SaltService {
// @todo: configurable
    private apiUrl:string = '/api';
    private loginUrl: string;
    private logoutUrl: string;
    private jobsUrl: string;
    // Used for one-off commands where the credentials must be specified
    // For running jobs when already authenticated, use a POST on the minions URL
    private runUrl: string;
    private minionsUrl: string;
    private hookUrl: string;
    private keysUrl: string;
    private webSocketUrl: string;
    private statsUrl: string;
    
    private eauth: string = 'pam'
    
    private token: string;
    private expires: Date;

    private subject: Subject<string>;

// @todo: get the list of supported features (Get / and parse clients)
    constructor (private http: Http) {
        this.loginUrl     = this.apiUrl + '/login';
        this.logoutUrl    = this.apiUrl + '/logout';
        this.jobsUrl      = this.apiUrl + '/jobs';
        this.runUrl       = this.apiUrl + '/run';
        this.minionsUrl   = this.apiUrl + '/minions';
        this.hookUrl      = this.apiUrl + '/hook';
        this.keysUrl      = this.apiUrl + '/keys';
        this.webSocketUrl = this.apiUrl + '/ws';
        this.statsUrl     = this.apiUrl + '/stats';
    }
    
    /*
     * Login section
     */
    
    isAuthenticated(): boolean {
// @todo: also check the expires value
        if (this.token !== undefined) {
            return true;
        } else {
            return false;
        }
    }
    
    login(username: string, password: string): Observable<string> {
        this.subject = new Subject<string>();

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });        
        let credentials = {
            username: username,
            password: password,
            eauth: this.eauth
        }
        this.http.post(this.loginUrl, credentials, options)
// @todo: configurable timeout
// @todo: there seems to be a problem with multiple http posts and observers?
//            .timeout(30000, this.handleLoginError(new Error('timeout exceeded')))
            .map(this.extractLoginData)
            .subscribe(
                loginData => {
                    this.token = loginData.token;
                    this.expires = loginData.expires;
                    this.subject.next(loginData.token);
                },
                error => this.handleLoginError(error)
            );

        return this.subject.asObservable();
    }
    
    private extractLoginData(res: Response): LoginData {
        let body = res.json();
        let loginData = new LoginData();
        loginData.token = body.return[0].token;
// @todo: parse date
        loginData.expires = body.return[0].token;
        return loginData;
    }
    
    private handleLoginError(error: Response | any) {
        if (error instanceof Response && error.status == 401) {
// @todo: new LoginError
            this.subject.error(error);
        } else {
// @todo: error service formatter?
            this.subject.error(this.formatError(error));
        }
    }
    
    logout() {
        this.token = null;
        this.expires = null;
        return this.http.post(this.logoutUrl, null)
               .catch(this.handleError);
    }

    /*
     * API section
     */

    private getHeaders(contentType: string = null, accept: string = null): RequestOptions {
        if (contentType == null) {
            contentType = 'application/x-www-form-urlencoded';
        }
        if (accept == null) {
            accept = 'application/json';
        }
        let headers = new Headers({
            'Content-Type': contentType,
            'Accept': accept,
            'X-Auth-Token': this.token
        });
        return new RequestOptions({ headers: headers });
    }
    
// @todo: Use a BehaviorSubject
    getJobs(): Observable<Job[]> {
        return this.http.get(this.jobsUrl, this.getHeaders())
               .map(this.extractJobs)
               .catch(this.handleError);
    }

    /*
     * {"return": [
     *   {
     *     "20170213224600955724": {
     *       "Function": "state.highstate",
     *       "Target": "*",
     *       "Target-type": "glob",
     *       "Arguments": [],
     *       "StartTime": "2017, Feb 13 22:46:00.955724",
     *       "User": "sudo_mbouchar"
     *     },
     *     "20170213224240422062": {
     *       "Function": "state.highstate",
     *       "Target": "*",
     *       "Target-type": "glob",
     *       "Arguments": [],
     *       "StartTime": "2017, Feb 13 22:42:40.422062",
     *       "User": "sudo_mbouchar"
     *     }
     *   }
     * ]}
     */
    private extractJobs(res: Response): Array<Job> {
        let body = res.json();
        let jobList = body.return || [{ }];
        let jobs = new Array<Job>();
        
        for (let jobId of Object.keys(jobList[0]).sort()) {
            let lowstate = new LowState();
            lowstate.func = jobList[0][jobId]['Function'];
            lowstate.target = jobList[0][jobId]['Target'];
            lowstate.arguments = jobList[0][jobId]['Arguments']

            let job = new Job();
            job.id = jobId;
            job.lowstate = lowstate
            job.targetType = jobList[0][jobId]['Target-type'];
// @todo: correct datetime parsing
            job.startTime = jobList[0][jobId]['Start Time'];
            job.user = jobList[0][jobId]['User'];
            jobs.push(job);
        }

        return jobs;
    }

    getJobDetails(job: Job): Observable<JobDetails> {
        return this.http.get(this.jobsUrl + '/' + job.id, this.getHeaders())
            .map(this.extractJobDetails)
            .catch(this.handleError);
    }
    
    private extractJobDetails(res: Response): JobDetails {
        let body = res.json();
        let ret = body.return || [{ }];
        
        let jobDetails = new JobDetails();
        jobDetails.minions = new Array<string>();
        for (let minionName of ret[0].Minions) {
            jobDetails.minions.push(minionName);
        }
console.log(ret[0].Result);
        jobDetails.results = new Array<JobResult>();
        for (let minionName of Object.keys(ret[0].Result)) {
            let jobResult = new JobResult();
            jobResult.minion = minionName;
            jobResult.result = JSON.stringify(ret[0].Result[minionName].return);
            jobDetails.results.push(jobResult);
        }
        
        return jobDetails;
    }
    
// @todo: support clients other than local_async?
    runJob(lowState: LowState): Observable<string> {
        return this.run(lowState.target, lowState.func, lowState.arguments);
    }
    
    run(target: string, func: string, args: Array<string> = null): Observable<string> {
        let runData = 'tgt=' + target + '&fun=' + func;
        if (args != null && args.length > 0) {
            runData += '&arg=' + args;
        }
        
        // The normal way to start a job is to use the /minions URL with POST data.
        // It allows to target minions and specify job data
        return this.http.post(this.minionsUrl, runData, this.getHeaders())
            .map(this.extractJobRun)
            .catch(this.handleError);        
    }
    
    private extractJobRun(res: Response): string {
        let body = res.json();
        let ret = body.return || [{ }];
        
        return JSON.stringify(ret);
    }
    
    getMinions(): Observable<Minion[]> {
        return this.http.get(this.minionsUrl, this.getHeaders())
            .map(this.extractMinions)
            .catch(this.handleError);
    }

    private extractMinions(res: Response): Array<Minion> {
        let body = res.json();
        let minionList = body.return || [{ }];
        let minions = new Array<Minion>();
        
        for (let minionId of Object.keys(minionList[0]).sort()) {
            let minion = new Minion();
            minion.id = minionId;
            minion.grains = minionList[0][minionId];
            minions.push(minion);
        }
    console.log(minions);
        return minions;
    }

    // https://angular.io/docs/ts/latest/api/http/index/Response-class.html
    private handleError(error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string = this.formatError(error);
        return Observable.throw(errMsg);
    }

    private formatError(error: Response | any): string {
        let errMsg: string = '';
        if (error instanceof Response) {
            if (error.status === 0) {
                errMsg = `The browser didn't allow the call to the API endpoint. Please check that the CORS headers are set correctly`;
            } else {
                let body: any = undefined;
                try {
                    body = error.json();
                } catch (err) { }
                
                if (body !== undefined) {
                    errMsg = `${error.status} - ${error.statusText || ''} ${body.error || JSON.stringify(body)}`;
                } else if (error.statusText !== '') {
                    errMsg = `${error.status} - ${error.statusText || ''}`;
                } else {
                    errMsg = `${error.status}`;
                }
            }
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        return errMsg;
    }
}
