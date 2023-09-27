const xlsx = require('xlsx');
const fs = require('fs');
const S28 = require('./lib/include.js');
var rst = new Array();
var filePath = "./output/";

(async () => {
    fs.readdir(filePath, async function (err, file) {
        if (err) return console.log(err);
        if (file == null) {
          console.log("디렉토리에 파일이 없습니다.")
        }
        else {
            await task(file);
        }
        
    });

})();

async function task(file){
    var arr = new Array();

    for (var a = 0; a < file.length; a++) {
        var fileName = file[a];
        var Buffer = fs.readFileSync(filePath + '/' + fileName);
        var String = Buffer.toString();
        var Data = JSON.parse(String);

        for (var b = 0; b < Data.length; b++) {
            var obj = new Object();
            obj.sitecode = fileName.split('_')[1].split('.')[0];
            obj.source = Data[b].source;
            obj.anchor = Data[b].anchor;
            obj.destination = Data[b].destination;
            obj.destination_status = Data[b].destination_status;
            arr.push(obj);
        }
    }

    // // Save as Excel
    const workBook = xlsx.utils.book_new();
    var workSheet = S28.xlsx.utils.json_to_sheet(arr);
    S28.xlsx.utils.book_append_sheet(workBook, workSheet, "GNB");
    S28.xlsx.writeFile(workBook, "./result/GNB_BL.xlsx");
    console.log("Excel File Saved!");
}

