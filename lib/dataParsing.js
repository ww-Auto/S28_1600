import xlsx from "xlsx";
async function getSourceList(filepath){

    // var sourceInfo = new Array(); 
     var excelFile = xlsx.readFile(filepath);
     var sheetName = excelFile.SheetNames[0];      
     var firstSheet = excelFile.Sheets[sheetName];  
     var jsonData = xlsx.utils.sheet_to_json( firstSheet, { defval : "" } ); 
 
     return jsonData; 
 }

 async function parsingData(filepath, brokenInfo){

    var excelFile = xlsx.readFile(filepath);
    var sheetName = excelFile.SheetNames[0];      
    var firstSheet = excelFile.Sheets[sheetName];  
    var jsonData = xlsx.utils.sheet_to_json( firstSheet, { defval : "" } );

    jsonData.forEach((t, i) => {
        const row = {
            num : i,
            type : t.Type,
            source : t.Source,
            destination : t.Destination,
            alttext : t["Alt Text"], 
            anchor : t.Anchor, 
            xpath : t["Link Path"], 
            linkposition : t["Link Position"],
            findresult:t.findResult
        }; 
        brokenInfo.push(row); 
    });   
    brokenInfo.shift(); //첫번째 열 삭제
}

export { getSourceList,parsingData};
