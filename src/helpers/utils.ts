export function getTagName(line: string): string | undefined {
    const match = line.match(/<([a-zA-Z0-9-]+)/);
    return match ? match[1] : undefined;
}

export function getSmartKeyword(tag: string, line: string): string {
    const l = line.toLowerCase();
    if (l.includes('cancel')) return 'cancel';
    if (l.includes('submit')) return 'submit';
    if (l.includes('icon')) return 'icon';
    if (l.includes('avatar')) return 'avatar';
    if (l.includes('input')) return 'field';

    switch (tag.toLowerCase()) {
        case 'button': return 'button';
        case 'input': return 'input';
        case 'img': return 'image';
        case 'div': return 'container';
        default: return 'element';
    }
}

export function getInsertText(tag: string, keyword: string, prefix: string): string {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${tag}-${keyword}-${randomId}`;
}
