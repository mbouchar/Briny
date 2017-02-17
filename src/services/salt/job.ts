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

export class Job {
    // If set to number, it will be truncated
    id: string;
    startTime: Date;
    lowstate: LowState;
    targetType: string;
    user: string;
    
    details: JobDetails;
}

export class JobDetails {
    job: Job;
    minions: Array<string>;
    results: Array<JobResult>;
    
}

export class JobResult {
    minion: string;
    result: any;
}

export class LowState {
    client: string;
    target: string;
    func: string;
    arguments: Array<string>;
}
