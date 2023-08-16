/* eslint-disable prettier/prettier */
export const toQueryString = (obj: any) => {
    return '?' +
        Object.keys(obj)
            .map(key => {
                return `${key}=${encodeURIComponent(obj[key])}`;
            })
            .join('&')
}