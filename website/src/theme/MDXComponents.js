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
var react_1 = require("react");
var MDXComponents_1 = require("@theme-original/MDXComponents");
var SkillHeader_1 = require("../components/SkillHeader");
var InstallTabs_1 = require("../components/InstallTabs");
var CustomMDXComponents = __assign(__assign({}, MDXComponents_1.default), { SkillHeader: SkillHeader_1.default, InstallTabs: InstallTabs_1.default, wrapper: function (_a) {
        var children = _a.children;
        return (<div className="win31-doc-content">{children}</div>);
    } });
exports.default = CustomMDXComponents;
