function djb2(str: string) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
    }
    return hash;
}

export function hashStringToColor(str: string) {
    const hash = djb2(str);

    // Generate RGB values but keep them in the brighter range
    const r = ((hash & 0xFF0000) >> 16) % 128 + 127; // Ensures r is between 127 and 255
    const g = ((hash & 0x00FF00) >> 8) % 128 + 127;  // Ensures g is between 127 and 255
    const b = (hash & 0x0000FF) % 128 + 127;         // Ensures b is between 127 and 255

    // Convert to hexadecimal and ensure two-digit format
    return "#" + 
        ("0" + r.toString(16)).slice(-2) + 
        ("0" + g.toString(16)).slice(-2) + 
        ("0" + b.toString(16)).slice(-2);
}
