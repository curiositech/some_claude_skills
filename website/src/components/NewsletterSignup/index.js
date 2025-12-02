"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewsletterSignup;
var react_1 = require("react");
var styles_module_css_1 = require("./styles.module.css");
function NewsletterSignup(_a) {
    var _this = this;
    var _b = _a.variant, variant = _b === void 0 ? 'inline' : _b, _c = _a.source, source = _c === void 0 ? 'unknown' : _c;
    var _d = (0, react_1.useState)(''), email = _d[0], setEmail = _d[1];
    var _e = (0, react_1.useState)('idle'), status = _e[0], setStatus = _e[1];
    var _f = (0, react_1.useState)(''), message = _f[0], setMessage = _f[1];
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!email || !email.includes('@')) {
                        setStatus('error');
                        setMessage('Please enter a valid email address');
                        return [2 /*return*/];
                    }
                    setStatus('loading');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch('https://buttondown.com/api/emails/embed-subscribe/someclaudeskills', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: new URLSearchParams({
                                email: email,
                                tag: source,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        setStatus('success');
                        setMessage('Thanks! Check your email to confirm.');
                        setEmail('');
                        // Track with Plausible if available
                        if (typeof window !== 'undefined' && window.plausible) {
                            window.plausible('Newsletter Signup', { props: { source: source } });
                        }
                    }
                    else {
                        throw new Error('Subscription failed');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    setStatus('error');
                    setMessage('Something went wrong. Try again?');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (variant === 'footer') {
        return (<div className={styles_module_css_1.default.footerSignup}>
        <h4 className={styles_module_css_1.default.footerTitle}>Stay Updated</h4>
        <p className={styles_module_css_1.default.footerDesc}>New skills, tips, and Claude Code updates</p>
        <form onSubmit={handleSubmit} className={styles_module_css_1.default.footerForm}>
          <input type="email" value={email} onChange={function (e) { return setEmail(e.target.value); }} placeholder="your@email.com" className={styles_module_css_1.default.footerInput} disabled={status === 'loading' || status === 'success'}/>
          <button type="submit" className={styles_module_css_1.default.footerButton} disabled={status === 'loading' || status === 'success'}>
            {status === 'loading' ? '...' : status === 'success' ? '✓' : 'Subscribe'}
          </button>
        </form>
        {message && (<p className={"".concat(styles_module_css_1.default.message, " ").concat(styles_module_css_1.default[status])}>{message}</p>)}
      </div>);
    }
    return (<div className={"".concat(styles_module_css_1.default.signup, " ").concat(styles_module_css_1.default[variant])}>
      <div className={styles_module_css_1.default.content}>
        <div className={styles_module_css_1.default.iconRow}>
          <img src="/img/newsletter-hero.svg" alt="Newsletter" className={styles_module_css_1.default.icon} width={64} height={64}/>
          <h3 className={styles_module_css_1.default.title}>Get New Skills First</h3>
        </div>
        <p className={styles_module_css_1.default.description}>
          Join 100+ developers getting weekly Claude Code tips and new skill announcements.
        </p>
        <form onSubmit={handleSubmit} className={styles_module_css_1.default.form}>
          <input type="email" value={email} onChange={function (e) { return setEmail(e.target.value); }} placeholder="developer@company.com" className={styles_module_css_1.default.input} disabled={status === 'loading' || status === 'success'}/>
          <button type="submit" className={styles_module_css_1.default.button} disabled={status === 'loading' || status === 'success'}>
            {status === 'loading' ? 'Subscribing...' : status === 'success' ? '✓ Subscribed!' : 'Subscribe'}
          </button>
        </form>
        {message && (<p className={"".concat(styles_module_css_1.default.message, " ").concat(styles_module_css_1.default[status])}>{message}</p>)}
        <p className={styles_module_css_1.default.privacy}>No spam. Unsubscribe anytime. ~2 emails/month.</p>
      </div>
    </div>);
}
