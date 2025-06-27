"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRole = getRole;
exports.getUserDocument = getUserDocument;
async function getRole(uid) {
    return "Farmer";
}
async function getUserDocument(uid) {
    return {
        id: uid,
        email: "test@test.com",
    };
}
//# sourceMappingURL=module2.js.map