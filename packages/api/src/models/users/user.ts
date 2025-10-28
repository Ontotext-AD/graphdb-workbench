import {Model} from '../common';
import {Authority, AuthorityList} from '../security';
import {AppSettings} from './app-settings';

export enum UserType {
  ADMIN = 'admin',
  REPO_MANAGER = 'repoManager',
  USER = 'user',
}

/**
 * Represents a user model in the system.
 */
export class User extends Model<User> {
  username: string;
  password?: string;
  confirmPassword?: string;
  authorities: AuthorityList;
  appSettings: AppSettings;
  dateCreated: Date | null;
  gptThreads: string[];
  external: boolean;

  constructor(data?: Partial<User>) {
    super();
    this.username = data?.username ?? '';
    this.password = data?.password;
    this.confirmPassword = data?.confirmPassword;
    this.authorities = data?.authorities ?? new AuthorityList();
    this.appSettings = data?.appSettings ?? new AppSettings();
    this.dateCreated = data?.dateCreated ?? null;
    this.gptThreads = data?.gptThreads ?? [];
    this.external = data?.external ?? false;
  }

  /**
   * Determines the user type based on their authorities.
   */
  getUserType(): UserType {
    if (this.authorities.hasAuthority(Authority.ROLE_ADMIN)) {
      return UserType.ADMIN;
    } else if (this.authorities.hasAuthority(Authority.ROLE_REPO_MANAGER)) {
      return UserType.REPO_MANAGER;
    } else {
      return UserType.USER;
    }
  }

  /**
   * Determines the user type description based on the user type.
   */
  getUserTypeDescription(): string {
    // TODO: Probably change these to use the translations
    const userType = this.getUserType();
    if (userType === UserType.USER) {
      return 'User';
    } else if (userType === UserType.REPO_MANAGER) {
      return 'Repository manager';
    } else if (userType === UserType.ADMIN) {
      return 'Administrator';
    } else {
      return 'Unknown';
    }
  }
}
