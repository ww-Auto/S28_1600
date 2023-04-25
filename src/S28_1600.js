import playwright from "playwright"; 
import fs from "fs"; 
import xlsx from "xlsx";
import * as clickEvent from '../lib/clickEvent.js';
import * as dataParsing from '../lib/dataParsing.js';
import * as rowSetting from '../lib/rowSetting.js';

test(); 
async function test(site){ 

    var path = '../input/'; 
    var site = "promotion"; 
    var savepath = path +site+"/"; 
    mkdir(savepath); 

    var brokenInfo = new Array();
    var sourceInfo = await dataParsing.getSourceList(path + "list_mode_export.xlsx"); 

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

    dataParsing.parsingData(path + site+'_client_error_(4xx)_inlinks.xlsx', brokenInfo);                                         

    var i;
    var findResult = false;
    var one_depth = true;
    const browser = await playwright.chromium.launch({headless: false, args: ['--start-maximized']}); 
    for(i=0;i<brokenInfo.length;i++){
        var xPath = brokenInfo[i].xpath
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
            if(one_depth == true) {
                var filter_url = sourceInfo.filter(function(input){
                    return input.Address == sourceurl; 
                    }) 
                try{
                    if(destination.includes('p6')) { //destination이p6인 경우
                        rowSetting.setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, findResult);
                        brokenInfo[i].findResult ="p6-qa";  
                    }
                    if(type=='HTML Canonical'){
                        rowSetting.setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, findResult);
                        brokenInfo[i].findResult = "Canonical";
        
                    }
                    if(filter_url == null || filter_url == ""){
                        rowSetting.setRow(num, type, sourceurl, destination, alttext,  status, anchor, xPath, linkposition,findResult );
                        brokenInfo[i].findResult ="N/A_Not source list";   
                    }
                }catch(e){
                    console.log(e)
                }
             }
        try{  
           if(brokenInfo[i].findResult !="N/A_Not source list" ){
                await page.goto(sourceurl).catch(error => { 
                    console.log("not go to url", error); 
                    });
                
            // 쿠키 
                await page.locator('#truste-consent-button').click().catch(error => {
                    console.log("not exist cookie"); 
                });
                await page.locator('//*[@id="ins-editable-button-1580496494"]').click().catch(error => {
                    console.log("not exist cookie"); 
                });
                await page.locator('//*[@id="header"]/div[2]/div/div/div[2]/a').click().catch(error => {
                    console.log("not exist cookie"); 
                });
            //확장    
                await clickEvent.expendAll(page);
                const findXpath = await page.locator(xPath); 
                if(findXpath != null || !findXpath.isEmpty() || findXpath != [] || findXpath != "[]"){   
                findResult = await clickEvent.clickItem(findXpath); 
                // console.log(findResult+"findResult")
                }
                if(findResult == true){
                    await page.waitForTimeout(1000);
                    const response = await page.goto(destination, { timeout: 10000 }).catch(e => { });
                    try{
                        status = response.status(); 
                        rowSetting.setRow(num, type, sourceurl, destination, alttext,  status, anchor, xPath, linkposition,findResult );
                        brokenInfo[i].findResult ="true";

                    }catch(e){
                        status = -1; 
                    }
                }else{
                    if(anchor == "" || anchor == null || anchor == 'undefined' || anchor.includes("{{")) {
                        if(alttext == "" ||  alttext == null || alttext == 'undefined'){
                            rowSetting.setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, findResult );
                                brokenInfo[i].findResult ="N/A_anchor is empty or invalid";
                        }
                    }
                }
            
                const row = {
                    num : num, 
                    type : type,
                    sourceurl : sourceurl,
                    destination : destination,
                    destination_status : status,
                    alttext : alttext, 
                    anchor : anchor, 
                    xpath : xPath, 
                    linkposition : linkposition,
                    findresult : findResult
                    }; 
                console.log(row)
           }
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
function mkdir( dirPath ) {
    const isExists = fs.existsSync( dirPath );
    if( !isExists ) {
        fs.mkdirSync( dirPath, { recursive: true } );
    }
}
