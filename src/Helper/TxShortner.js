
export const shortner = (str) => {
    const start = str.slice(0, 5);

    const len = str.length;
    const end = str.slice(len - 4, len);

    const shortTx = `${start}....${end}`;
    return shortTx;
}
