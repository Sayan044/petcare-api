export function isValidURL(url: string) {
    try {
        const parsedUrl = new URL(url)
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
    }
    catch (error) {
        return false
    }
}
