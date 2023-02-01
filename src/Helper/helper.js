export const formatDate = (_date) => {
        try {

            let currentDate = new Date(_date);
            let date =
                currentDate.getDate() +
                "/" +
                (currentDate.getMonth() + 1) +
                "/" +
                currentDate.getFullYear() +
                " | ";

            let time =
                currentDate.getHours() +
                ":" +
                currentDate.getMinutes() +
                ":" +
                currentDate.getSeconds();

            time = time.split(":");
            time[3] = time[0] < 12 ? "AM" : "PM";
            time[0] = time[0] > 12 ? time[0] % 12 : time[0];
            let dateTime = date + `${time[0]}:${time[1]}:${time[2]}${time[3]}`;

            return dateTime;

        } catch (error) {
            console.log("Error : ", error);
            return "";
        }
    };




export const format = (num, numOfDecimals = 4) => {
        if (num === '') return '';
        const reDot = /[.]/;
        let index = num.search(reDot);

        if (numOfDecimals <= 0)
            return num.slice(0, index);

        else
            return num.slice(0, (index + numOfDecimals + 1));
    };


export const shortner = (str) => {
        const start = str.slice(0, 5);

        const len = str.length;
        const end = str.slice(len - 4, len);

        const shortTx = `${start}....${end}`;
        return shortTx;
    };


export
    const noExponents = function (num) {
        try {
            var data = String(num).split(/[eE]/);
            if (data.length === 1) return data[0];
            console.log(data);
            let z = "";
            let sign = num < 0 ? "-" : "";
            let str = data[0].replace(".", "");
            let mag = Number(data[1]) + 1;

            if (mag < 0) {
                z = sign + "0.";
                while (mag++) z += "0";
                return z + str.replace(/^\-/, "");
            }
            mag -= str.length;
            while (mag--) z += "0";
            return str + z;
        } catch (error) { }
    };


