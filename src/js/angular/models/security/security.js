export class UpdateUserPayload {
    constructor(data) {
        this._username = data.username;
        this._password = data.password;
        this._appSettings = data.appSettings;
    }

    get username() {
        return this._username;
    }

    set username(value) {
        this._username = value;
    }

    get password() {
        return this._password;
    }

    set password(value) {
        this._password = value;
    }

    get appSettings() {
        return this._appSettings;
    }

    set appSettings(value) {
        this._appSettings = value;
    }
}
