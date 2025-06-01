export function getTagName(line: string): string | undefined {
    const match = line.match(/<([a-zA-Z0-9-]+)/);
    return match ? match[1] : undefined;
}

export function getSmartKeyword(tag: string, line: string, nextLine?: string): string {
    const formControlMatch = line.match(/\bformControlName\s*=\s*["']([^"']+)["']/);
    if (formControlMatch) { return sanitize(formControlMatch[1]); }

    const ngModelMatch = line.match(/\[\(ngModel\)\]|\bngModel\s*=\s*["']([^"']+)["']/);
    if (ngModelMatch) {
        const ngModelValue = ngModelMatch[2];
        if (ngModelValue) { return sanitize(ngModelValue.replace(/\./g, '-')); }
    }

    const nameAttr = line.match(/\bname\s*=\s*["']([^"']+)["']/);
    if (nameAttr) { return sanitize(nameAttr[1]); }

    const idAttr = line.match(/\bid\s*=\s*["']([^"']+)["']/);
    if (idAttr) { return sanitize(idAttr[1]); }

    if (['button', 'a', 'label', 'span'].includes(tag)) {
        // Try to extract transloco key from {{ 'key' | transloco }}
        const translocoMatch = (line + (nextLine || '')).match(/{{\s*['"]([^'"]+)['"]\s*\|\s*transloco/);
        if (translocoMatch) {
            return sanitize(translocoMatch[1]);
        }

        // Fallback: plain inner text
        const fallbackText = line.match(/>([^<]+)</);
        if (fallbackText) {
            return sanitize(fallbackText[1].trim());
        }
    }
    return 'element';
}

function sanitize(text: string): string {
    return text
        .toLowerCase()
        .replace(/[_\s]+/g, '-')      // Convert underscores/spaces to dash
        .replace(/[^\w-]+/g, '')      // Remove special characters
        .replace(/^-+|-+$/g, '');     // Trim leading/trailing dashes
}

export function getInsertText(tag: string, keyword: string, prefix: string): string {
    return `${prefix}${tag}-${keyword}`;
}