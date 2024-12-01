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

export function hashStringDarkToColor(key: string, value: string) {
    if(key == "message" && (value.toLowerCase().includes("exception") || value.toLowerCase().includes("error"))) {
        return "#6b1004"
    }
    
    if(key == "message") {
        return "#0b7a66"
    }

    if(key == "level" && value.toLowerCase() == "info") {
        return "#0b8a44"
    }

    if(key == "level" && value.toLowerCase().includes("err")) {
        return "#8a0f0b"
    }

    if(key == "level" && value.toLowerCase().includes("warn")) {
        return "#8a460b"
    }
    if(key == "level" && value.toLowerCase().includes("debug")) {
        return "#6c8f03"
    }

    const hash = djb2(key);

    // Use the hash to generate HSL values
    const h = Math.abs(hash % 360);       // Hue: 0–359 (full spectrum)
    const s = 35;                         // Saturation: 70% for vibrancy
    const l = 20;                         // Lightness: 70% for enhanced brightness

    return hslToHex(h, s, l);
}
