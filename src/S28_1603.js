const playwright = require('playwright');
const fs = require('fs');
const xlsx = require('xlsx-js-style');
const MS = require('./lib/makeSheet.js');
const convertString = require('./lib/convertString.js');
const list = require('./cfg/homeURL_copy.json');

exports.GNB = async function(now, t) {
    var home = list[now];
    var sc = home.split('/')[3];

    // 이미 완료된 아웃풋 확인 후 스킵
    var dir = fs.existsSync('./output/gnb_' + now + '.json');
    if(dir){
        console.log("gnb_" + now + " - Already Done!");
        process.send({ type : "end", from: process.pid});
        process.exit(0);
    }

    const browser = await playwright.chromium.launch({headless: true, args: ['--start-maximized']});
    const context = await browser.newContext({viewport: {width: 1920, height: 1080}});
    context.setDefaultTimeout(40000);
    const page = await context.newPage();
    var resultArray = new Array();

    // Go to Home
    await page.goto(home);
    await page.waitForTimeout(2000);
    await clickCookie(page, sc);

    // Check dept CTA in GNB
    let gnb = await page.$$("[class = 'nv00-gnb__l0-menu'] [class='nv00-gnb__l0-menu-btn']");

    for(let btn of gnb){
        var btnIndex = gnb.indexOf(btn);
        var bSelector = "[class = 'nv00-gnb__l0-menu'][data-index='" + btnIndex + "']";
        var d0 = await page.innerText(bSelector);

        // Click 0 dept GNB CTA 
        try{
            await page.locator(bSelector + " > button").click();
        }catch(e){
            await page.goto(home);
            await page.waitForTimeout(3000);
            await page.locator(bSelector + " > button").click();
        }
        

        // Check 1 dept CTA
        var cSelector = bSelector + " > div > div > ul > [class='nv00-gnb__l2-menu']";
        var tSelector = "";
        let thum;
        let list = await page.$$(cSelector);

        console.log(d0 + " : " + list.length);
        if(list.length == 0){
            cSelector = bSelector + " > div > div > ul > [class='nv00-gnb__l1-menu']";
            tSelector = bSelector + " > div > [class='nv00-gnb__l1-menu-wrap featured-products-thumbnail'] > div > ul > li"
            list = await page.$$(cSelector);
            thum = await page.$$(tSelector);
        }

        for(let cta of list){
            var rs = new Object();
            var check  = true;
            var end = false;
            rs.source = home;

            // Crwaling dept anchor and click CTA to redirection
            await page.locator(bSelector + " > button").click();
            var ctaIndex = list.indexOf(cta)
            var d1 = await page.locator(cSelector).nth(ctaIndex).innerText();

            d1 = convertString.replaceR(d1);
            rs.anchor = d0 + " >> " + d1;

            // Check if CTA is hidden element
            try{
                await page.waitForTimeout(1000);
                await page.locator(cSelector).nth(ctaIndex).click();
                console.log(rs.anchor);
            }catch(e){
                console.log("hidden element");
                continue;
            }

            // Check Redirection to new tap
            context.on('page', async p => {
                check = false;
                console.log("New Tap Open!");
                await p.waitForTimeout(3000);
                var res = await p.request.fetch(p.url());
                rs.destination = p.url();
                rs.destination_status = res.status();
                console.log(" >> " + rs.destination + " : " + rs.destination_status);
                p.close();
                end = true;
            })

            // Crwaling Redirection Page's URL and status code
            await page.waitForTimeout(4000);
            if(check){
                // await page.waitForLoadState('networkidle');
                var res = await page.request.fetch(page.url());
                rs.destination = page.url();
                rs.destination_status = res.status();
                console.log(" >> " + rs.destination + " : " + rs.destination_status);
                resultArray.push(rs);
            }
            else {
                console.log("waiting");
                while(!end){await page.waitForTimeout(3000);}
                resultArray.push(rs);
            }
                        
            // Return to Home
            await page.goto(home);
        }

        // Thumbnail CTA
        if(tSelector != ""){
            for(let cta of thum){
                var rs = new Object();
                var check  = true;
                var end = false;
                rs.source = home;
    
                // Crwaling dept anchor and click CTA to redirection
                await page.waitForTimeout(2000);
                await page.locator(bSelector + " > button").click();
                var ctaIndex = thum.indexOf(cta)
                var d1 = await page.locator(tSelector).nth(ctaIndex).innerText();
                d1 = convertString.replaceR(d1);
                rs.anchor = d0 + " >> " + d1;
    
                // Check if CTA is hidden element
                try{
                    await page.waitForTimeout(1000);
                    await page.locator(tSelector).nth(ctaIndex).click();
                    console.log(rs.anchor);
                }catch(e){
                    console.log("hidden element");
                    continue;
                }

                // Check Redirection to new tap
                context.on('page', async p => {
                    check = false;
                    console.log("New Tap Open!");
                    await p.waitForTimeout(3000);
                    var res = await p.request.fetch(p.url());
                    rs.destination = p.url();
                    rs.destination_status = res.status();
                    console.log(" >> " + rs.destination + " : " + rs.destination_status);
                    p.close();
                    end = true;
                })
                
                // Crwaling Redirection Page's URL and status code
                await page.waitForTimeout(4000);
                if(check){
                    await page.waitForLoadState("load");
                    var res = await page.request.fetch(page.url());
                    rs.destination = page.url();
                    rs.destination_status = res.status();
                    console.log(" >> " + rs.destination + " : " + rs.destination_status);
                    resultArray.push(rs);
                }
                else {
                    console.log("waiting");
                    while(!end){await page.waitForTimeout(3000);}
                    resultArray.push(rs);
                }
    
                // Return to Home
                await page.goto(home);
            }
        }
    }

    // Check CTA not exist dept
    var dSelector = "[class='nv00-gnb__l0-menu-link']";
    var dir = await page.$$(dSelector);

    for(let cta of dir){
        var rs = new Object();
        var ctaIndex = dir.indexOf(cta)
        rs.source = home;

        var d1 = await page.locator(dSelector).nth(ctaIndex).innerText();

        // Crwaling dept anchor and click CTA to redirection
        await page.locator(dSelector).nth(ctaIndex).click();
            
        d1 = convertString.replaceR(d1);
        rs.anchor = d1;
        
        // Crwaling Redirection Page's URL and status code
        await page.waitForLoadState("load");
        var res = await page.request.fetch(page.url());
        rs.destination = page.url();
        rs.destination_status = res.status();
        console.log(" >> " + rs.destination + " : " + rs.destination_status);
        resultArray.push(rs);

        // Return to Home
        await page.goto(home);
    }

    console.log(resultArray);
    let result = JSON.stringify(resultArray,null,2);
    fs.writeFileSync('./output/gnb_' + now + '.json', result);
    console.log("GNB BrokenLink Result Saved!");
    
    // const workBook = xlsx.utils.book_new();
    // MS.makeSheet("GNB_Raw_Data", resultArray, workBook, "GNB Broken Link", 4);
    // xlsx.writeFile(workBook, "./output/sample_tw.xlsx");

    await page.close();
    await context.close();
    await browser.close();

    process.send({ type : "end", from: process.pid});
    process.exit(0);
}

async function clickCookie(page, sc){
    console.log("clickCookie: "+sc);
    try{
      if(sc == 'id' || sc == 'au' || sc == 'vn') await page.locator("[id*='ins-editable-button']").click({timeout:5000});
      else if(sc == 'za') await page.locator("[class*='insider-opt-in-disallow-button']").click({timeout:5000});
      await page.locator("[an-ac='cookie bar:accept']").click({timeout:5000});
    }catch(e){
      console.log("x");
    }
    try{
      //common
      if(sc == 'it') await page.locator("#truste-consent-button").nth(0).click({timeout:5000});
      else await page.locator("#truste-consent-button").click({timeout:5000});
    }catch(e){
      console.log("common x");
    }
  }
