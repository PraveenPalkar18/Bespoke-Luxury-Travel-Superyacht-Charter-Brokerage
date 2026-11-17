/**
 * Redacts credentials from MongoDB connection URI
 * e.g. mongodb+srv://user:password@cluster.mongodb.net/db -> mongodb+srv://user:[REDACTED]@cluster.mongodb.net/db
 */
export const redactMongoUri = (uri: string): string => {
  if (!uri) return '';
  return uri.replace(
    /(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/i,
    '$1[REDACTED]$3'
  );
};
