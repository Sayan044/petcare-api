import fs from 'node:fs'

export function deleteFile(filePath: string) {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Error removing file: ", err.message)
        } else {
            console.log("Temporary file removed.")
        }
    })
}
