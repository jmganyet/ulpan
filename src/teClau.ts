/** Equivalent d'Object.hasOwn, que no hi és als Safari d'abans de la 15.4 (iPhone antics). */
export const teClau = (o: object, k: PropertyKey): boolean => Object.prototype.hasOwnProperty.call(o, k)
