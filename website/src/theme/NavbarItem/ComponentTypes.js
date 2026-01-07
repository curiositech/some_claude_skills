"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ComponentTypes_1 = require("@theme-original/NavbarItem/ComponentTypes");
var ThemePickerNavbarItem_1 = require("../../components/ThemePickerNavbarItem");
var MusicPlayerNavbarItem_1 = require("../../components/MusicPlayerNavbarItem");
exports.default = __assign(__assign({}, ComponentTypes_1.default), { 'custom-themePicker': ThemePickerNavbarItem_1.default, 'custom-musicPlayer': MusicPlayerNavbarItem_1.default });
