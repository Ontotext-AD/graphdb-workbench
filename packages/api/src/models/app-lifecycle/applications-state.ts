import {ApplicationMountState} from './application-mount-state';
import {ApplicationNames} from './application-names';

export class ApplicationsState {
  private readonly applicationsState: Record<ApplicationNames, ApplicationMountState>;

  constructor(applicationsState: Record<ApplicationNames, ApplicationMountState>) {
    this.applicationsState = applicationsState;
  }

  isLegacyAngularLoaded(): boolean {
    return this.applicationsState[ApplicationNames.LEGACY_ANGULAR] === ApplicationMountState.MOUNTED;
  }

  isNewAngularLoaded(): boolean {
    return this.applicationsState[ApplicationNames.NEW_ANGULAR] === ApplicationMountState.MOUNTED;
  }

  equals(other: ApplicationsState | undefined | null): boolean {
    if (!other) {
      return false;
    }

    const thisApps = Object.keys(this.applicationsState) as ApplicationNames[];
    const otherApps = Object.keys(other.applicationsState) as ApplicationNames[];

    if (thisApps.length !== otherApps.length) {
      return false;
    }

    for (const app of thisApps) {
      if (this.applicationsState[app] !== other.applicationsState[app]) {
        return false;
      }
    }

    return true;
  }
}
