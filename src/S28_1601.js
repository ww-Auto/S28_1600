import playwright from "playwright"; 
import fs from "fs"; 
import xlsx from "xlsx";
import * as clickEvent from '../lib/clickEvent.js';
import * as dataParsing from '../lib/dataParsing.js';
import * as rowSetting from '../lib/rowSetting.js';
let result = new Array();
let maxTabCount = 3;

// test(sc); //이것이 최종이 될듯,,,,, gnb부분 주석처리함(JK코드로1405 나갈 예정)
test()
// export async function task(sc){  
    export async function test(){  
    var path = '../input/TEST/'; 
     var site = "levant"; 
    var savepath =path+"/output/";
    mkdir(savepath); 

    var brokenInfo = new Array();
    // var sourceInfo = await dataParsing.getSourceList(path + "list_mode_export.xlsx"); 

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
    await dataParsing.parsingData(path +site+'_client_error_(4xx)_inlinks.xlsx', brokenInfo);
    await dataParsing.parsingData(path +site+'_server_error_(5xx)_inlinks.xlsx', brokenInfo);                                         
    // await dataParsing.parsingData(path + site+'.xlsx', brokenInfo);  
    var findResult = false;
    var one_depth = true;

    const browser = await playwright.chromium.launch({headless: false, args: ['--start-maximized']});
    const context = await browser.newContext({viewport: null});         
    const emptyPage = await context.newPage();
        
    while(brokenInfo.length>0){                        
        for(let i=context.pages().length;i<=maxTabCount;i++){                        
            if(brokenInfo[0]) {                
                if(brokenInfo.length==1) await openTab(brokenInfo.shift());
                else openTab(brokenInfo.shift());
            }            
        }        
        await emptyPage.waitForTimeout(500);
    }    
    
    await context.close();
    await browser.close();    

    fs.writeFileSync(savepath +site+ '_brokenlink_result.json',JSON.stringify(result,null,2)); 
    const workBook = xlsx.utils.book_new();
    var workSheet = xlsx.utils.json_to_sheet(result);
    xlsx.utils.book_append_sheet(workBook, workSheet, site);
    xlsx.writeFile(workBook, savepath +site+ '_brokenlink_result.xlsx');
    console.log("저장완료");
    process.exit(0);    
      
    
    async function openTab(brokenInfo){            
        var xPath = brokenInfo.xpath;
        const page = await context.newPage(); // 이부분 쓸데없이 열고 닫고만 하는 케이스가 있어 위치 변경에 대해 고려
        const sourceurl = brokenInfo.source;
        var type = brokenInfo.type; 
        var destination = brokenInfo.destination; // 바로 쓸수 없고 다시 선언해야함 Why? 확인 필요  
        var alttext = brokenInfo.alttext; 
        var anchor = brokenInfo.anchor; 
        var xPath  = brokenInfo.xpath; 
        var linkposition = brokenInfo.linkposition; 
        var status = "";
        var num = brokenInfo.num; 

        
            
        if(one_depth == true) {
            // var filter_url = sourceInfo.filter(function(input){
            //     return input.Address == sourceurl;
            // });
            // try{
            //     if(filter_url == null || filter_url == ""){
            //         rowSetting.setRow(num, type, sourceurl, destination, alttext,  status, anchor, xPath, linkposition,findResult );
            //         brokenInfo.findResult ="N/A_Not source list";   
            //     }
            // }catch(e){
            //     console.log(e)
            // }
         }
   
    try{          
       if(brokenInfo.findResult !="N/A_Not source list" ){
        if(type=='Image'){
            //blank.gif, common.png 삭제
            if((destination.includes("blank.gif"))||(destination.includes("common.png"))){
                rowSetting.setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, brokenInfo.findResult = "N/A_Empty image");
  
            }
            else{
                rowSetting.setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, brokenInfo.findResult = "Image Check");
                console.log("bread crumb"); 
            }
            
        }
           var response = await page.goto(sourceurl).catch(error => { 
                console.log("not go to url", error); 
            });        
            console.log(response.url()+sourceurl)   
            // if(response.url() != sourceurl){
            //     console.log("goto 소스" + brokenInfo.source+" 현재 url"+page.url())
            //     rowSetting.setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, findResult );
            //     brokenInfo.findResult ="Redirect Source URL";
                    
            // }
            
           
            await clickEvent.clickCookie(page);
            // await clickEvent.expendAll(page);
            await page.waitForTimeout(500);
            // await page.mouse.wheel(0,9999);
           
            
            const findXpath = page.locator(xPath); // << 전역설정 바꾸면 시간단축가능 "locator" 단독으로는 timeout 세팅 불가능. locator.click({timeout:x}); 와 같이는 가능
            // await androidDevice.scroll(xPath,down,3000);
            if(findXpath != null || !findXpath.isEmpty() || findXpath != [] || findXpath != "[]"){   
                // if(linkposition.includes('Navigation')){         //navigation 검증 부분,,,JK1405 업데이트로 이부분은 주석하고 돌릴예정
                // for(var li of await page.locator('.nv00-gnb__l0-menu-btn').all()){
                //     await li.hover();
                //     await page.waitForTimeout(500);
                //     console.log(await li.innerText());
                //     try{
                //         await page.locator(xPath).click({timeout:2000});
                //         console.log("found")
                //         findResult = true; //xpath 찾고 다음 gnb메뉴로 넘어가기 
                //         await page.waitForTimeout(500);
                //         break;
                //     }catch(e){
                //     }                          
                // }  
                // }else{
                //     await page.waitForTimeout(500);
                //     await page.mouse.wheel(0,9999);
                //     await page.waitForTimeout(500);
                //     await page.mouse.wheel(9999,0);
                    findResult = await clickEvent.clickItem(findXpath); 
                 }
                // console.log(findResult+"findResult")
            // }
            if(findResult == true){
                await page.waitForTimeout(1000);
                try{
                    status = response.status(); 
                    rowSetting.setRow(num, type, sourceurl, destination, alttext,  status, anchor, xPath, linkposition,brokenInfo.findResult ="TRUE");


                    if(destination.includes('https://p6')) {
                    rowSetting.setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, brokenInfo.findResult ="p6-qa");
                    if(type=='Image'){
                        //blank.gif, common.png 삭제
                        if((destination.includes("blank.gif"))||(destination.includes("common.png"))){
                            rowSetting.setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, brokenInfo.findResult = "N/A_Empty image"); 
                        } 
                    }      
                }   
                }catch(e){
                    status = -1; 
                }
            }else if(anchor == "" || anchor == null || anchor == 'undefined' || anchor.includes("{{")) {
                    if(alttext == "" ||  alttext == null || alttext == 'undefined'){
                        rowSetting.setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, brokenInfo.findResult ="N/A_anchor is empty or invalid" );
                    }if(type.includes('HTML Canonical')){
                        rowSetting.setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, brokenInfo.findResult = "Canonical");
                    } 
            }
            else if(findResult == false) { //
                rowSetting.setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, brokenInfo.findResult ="FALSE" );
                // ;
                if(destination.includes('https://p6')) {
                rowSetting.setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, brokenInfo.findResult ="p6-qa" );
                // 
                }
            }
            if(type=='Image'){
                //blank.gif, common.png 삭제
                if((destination.includes("blank.gif"))||(destination.includes("common.png"))){
                    rowSetting.setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, brokenInfo.findResult = "N/A_Empty image");
      
                }
                else{
                    rowSetting.setRow(num, type, sourceurl, destination, alttext, status, anchor, xPath, linkposition, brokenInfo.findResult = "Image Check");
                    console.log("bread crumb"); 
                }
            }    
            console.log(brokenInfo)
       }
       }catch(e){
        console.log(e)
       }
       finally{
        result.push(brokenInfo);
        await page.close() 
       }        
    }         
};

function mkdir( dirPath ) {
    const isExists = fs.existsSync( dirPath );
    if( !isExists ) {
        fs.mkdirSync( dirPath, { recursive: true } );
    }
}
