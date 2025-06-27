export function getTagName(fullTag: string): string | undefined {
    const match = fullTag.match(/<([a-zA-Z0-9-]+)/);
    return match ? match[1] : undefined;
}

export function getSmartKeyword(tag: string, fullTag: string): string {
    const formControlMatch = fullTag.match(/\bformControlName\s*=\s*["']([^"']+)["']/);
    if (formControlMatch) {
        return sanitize(formControlMatch[1]);
    }

    const ngModelMatch = fullTag.match(/\[\(ngModel\)\]\s*=\s*["']([^"']+)["']|\bngModel\s*=\s*["']([^"']+)["']/);
    if (ngModelMatch) {
        const ngModelValue = ngModelMatch[1] || ngModelMatch[2];
        if (ngModelValue) {
            return sanitize(ngModelValue.replace(/\./g, '-'));
        }
    }

    const nameAttr = fullTag.match(/\bname\s*=\s*["']([^"']+)["']/);
    if (nameAttr) {
        return sanitize(nameAttr[1]);
    }

    const idAttr = fullTag.match(/\bid\s*=\s*["']([^"']+)["']/);
    if (idAttr) {
        return sanitize(idAttr[1]);
    }

    if (["button", "a", "label", "span"].includes(tag)) {
        const translocoMatch = fullTag.match(/\{\{\s*['"]([^'"]+)['"]\s*\|\s*transloco/);
        if (translocoMatch) {
            return sanitize(translocoMatch[1]);
        }

        const fallbackText = fullTag.match(/>([^<]+)</);
        if (fallbackText) {
            return sanitize(fallbackText[1].trim());
        }
    }

    return "element";
}

function sanitize(text: string): string {
    return text
        .toLowerCase()
        .replace(/[_\s]+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/^-+|-+$/g, '');
}

export function getInsertText(tag: string, keyword: string, prefix: string): string {
    return `${prefix}${tag}-${keyword}`;
}
