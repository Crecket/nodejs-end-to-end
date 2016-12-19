module.exports = class Config {
    constructor(config) {
        this._config = !config ? {} : config;
    }

    set(key, value) {
        this._config[key] = value;
    }

    get(key) {
        return this._config[key];
    }
}
