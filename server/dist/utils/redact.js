"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactMongoUri = void 0;
/**
 * Redacts credentials from MongoDB connection URI
 * e.g. mongodb+srv://user:password@cluster.mongodb.net/db -> mongodb+srv://user:[REDACTED]@cluster.mongodb.net/db
 */
const redactMongoUri = (uri) => {
    if (!uri)
        return '';
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/i, '$1[REDACTED]$3');
};
exports.redactMongoUri = redactMongoUri;
