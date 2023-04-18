import playwright from "playwright"; 
import fs from "fs"; 
import xlsx from "xlsx";
test(); 
async function test(site){ 

    var path = '../input/'; 
    var site = "promotion"; 
    var savepath = path +site+"/"; 
    mkdir(savepath); 

    var brokenInfo = new Array();

    const map = {
        Num : "num", 
        Type: "type",
        Source: "source",
        Destination: "destination",
        Alttext : "alttext", 
        Anchor: "anchor",
        'Link Path': "xpath",
        'Link Position': "linkposition",
        findResult : "findResult"
    };
    brokenInfo.push(map); 

    parsingData(path + site+'_client_error_(4xx)_inlinks.xlsx', brokenInfo);

    var i;
    var findResult = false;
  

    for(i=0;i<brokenInfo.length;i++){
        var xPath = brokenInfo[i].xpath
        const browser = await playwright.chromium.launch({headless: false, args: ['--start-maximized']}); 
        const context = await browser.newContext({viewport: null});    

            const page = await context.newPage();
            const sourceurl = brokenInfo[i].source
            var type = brokenInfo[i].type; 
            var destination = brokenInfo[i].destination; // 바로 쓸수 없고 다시 선언해야함 Why? 확인 필요  
            var alttext = brokenInfo[i].alttext; 
            var anchor = brokenInfo[i].anchor; 
            var xPath  = brokenInfo[i].xpath; 
            var linkposition = brokenInfo[i].linkposition; 
            var status = "";
            var num = brokenInfo[i].num; 
        
            // await page.waitForTimeout(1000);
           try{
          
               await page.goto(sourceurl).catch(error => { 
                console.log("not go to url", error); 
                });
                

            // console.log(brokenInfo[i].source)
            // await page.waitForTimeout(1000);         
            // 쿠키 
            await page.locator('#truste-consent-button').click().catch(error => {
                console.log("not exist cookie"); 
            });
            // await page.waitForTimeout(1000);
            await page.locator('//*[@id="ins-editable-button-1580496494"]').click().catch(error => {
                console.log("not exist cookie"); 
            });
            // await page.waitForTimeout(1000);
            await page.locator('//*[@id="header"]/div[2]/div/div/div[2]/a').click().catch(error => {
                console.log("not exist cookie"); 
            });
           
            const findXpath = await page.locator(xPath); 
            if(findXpath != null || !findXpath.isEmpty() || findXpath != [] || findXpath != "[]"){   
            // console.log(findXpath)
            findResult = await clickItem(findXpath); 
            // console.log(findResult+"findResult")
            }
            if(findResult == true){
                await page.waitForTimeout(1000);
                const response = await page.goto(destination, { timeout: 10000 }).catch(e => { });
                try{
                    
                    status = response.status(); 
                    setRow(num, type, sourceurl, destination, alttext, anchor, xPath, linkposition,findResult );
                    brokenInfo[i].findResult ="true";
                    
                }catch(e){
                    status = -1; 
                }
                // console.log(response, destination); 
            }else{
                if(destination.includes('p6')) {
                    setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, 
                        "p6-qa");
                    brokenInfo[i].findResult = "p6-qa";
               
                }
                if(type=='HTML Canonical'){
                    setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, 
                        "Canonical");
                        brokenInfo[i].findResult = "Canonical";
    
                }
                
                if(anchor == "" || anchor == null || anchor == 'undefined' || anchor.includes("{{")) {
                    if(alttext == "" ||  alttext == null || alttext == 'undefined'){
                        setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, 
                            "N/A_anchor is empty or invalid", "");
                        console.log("anchor is empty or invalid"); 
                    }
                }
            }
            
            const row = {
                num : num, 
                type : type,
                sourceurl : sourceurl,
                destination : destination,
                alttext : alttext, 
                anchor : anchor, 
                xpath : xPath, 
                linkposition : linkposition,
                findresult : findResult
                }; 
            console.log(row)
          
            // return map; 
           
           
           }catch(e){
            console.log(e)
           }
           finally{
            await page.close()      
           }

           
        
    }

    fs.writeFileSync(savepath +site+ '_brokenlink_result.json',JSON.stringify(brokenInfo,null,2)); 

    console.log("저장완료");

    process.exit(0);
}
async function clickItem(item){
    try{                               
      
        await item.click();  
        
        console.log(item + " 클릭성공"); 
        return true;

    }catch(e){
        console.log(item + " 클릭실패", e); 
        return false;     
    }
}

function mkdir( dirPath ) {
    const isExists = fs.existsSync( dirPath );
    if( !isExists ) {
        fs.mkdirSync( dirPath, { recursive: true } );
    }
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
function setRow(num, type, sourceurl, destination, alttext, status, anchor, xpath, linkposition, findResult){

    const row = {
        num : num, 
        type : type,
        source : sourceurl,
        destination : destination,
        alttext : alttext, 
        destination_status : status,  
        anchor : anchor, 
        xpath : xpath, 
        linkposition : linkposition,
        findResult : findResult
    }; 
  
    return row; 
}
