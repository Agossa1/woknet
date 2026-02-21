"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostVisibility = exports.PostType = void 0;
var PostType;
(function (PostType) {
    PostType["TEXT"] = "TEXT";
    PostType["IMAGE"] = "IMAGE";
    PostType["VIDEO"] = "VIDEO";
    PostType["DOCUMENT"] = "DOCUMENT";
    PostType["LINK"] = "LINK";
})(PostType || (exports.PostType = PostType = {}));
var PostVisibility;
(function (PostVisibility) {
    PostVisibility["PUBLIC"] = "PUBLIC";
    PostVisibility["CONNECTIONS"] = "CONNECTIONS";
    PostVisibility["PRIVATE"] = "PRIVATE";
})(PostVisibility || (exports.PostVisibility = PostVisibility = {}));
//# sourceMappingURL=posts.types.js.map