function djb2(str: string) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
    }
    return hash;
}

function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

export function hashStringToColor(str: string) {
    const hash = djb2(str);

    // Use the hash to generate HSL values
    const h = Math.abs(hash % 360);       // Hue: 0–359 (full spectrum)
    const s = 90;                         // Saturation: 70% for vibrancy
    const l = 80;                         // Lightness: 70% for enhanced brightness

    return hslToHex(h, s, l);
}

export function hashStringDarkToColor(str: string) {
    const hash = djb2(str);

    // Use the hash to generate HSL values
    const h = Math.abs(hash % 360);       // Hue: 0–359 (full spectrum)
    const s = 40;                         // Saturation: 70% for vibrancy
    const l = 40;                         // Lightness: 70% for enhanced brightness

    return hslToHex(h, s, l);
}
