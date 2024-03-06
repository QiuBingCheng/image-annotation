export function getImageData() {
    return [
        { "name": "dog.png", "labeled": "Yes" },
        { "name": "cat.png", "labeled": "No" }
    ]
}

export function getLabels() {
    return ['ear', 'eye', 'nose']
}

export function getImagePath(id) {
    switch (id) {
        case "dog.png":
            return "/images/dog.png"

        case "cat.png":
            return "/images/cat.png"
    }
}
