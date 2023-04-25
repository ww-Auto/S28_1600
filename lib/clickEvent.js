
async function clickItem(item){
    try{                               
      
        await item.click();  
        // await item.waitForLoadState('networkidle')
        console.log(item + " 클릭성공"); 
        return true;

    }catch(e){
        console.log(item + " 클릭실패", e); 
        return false;     
    }
}
async function clickCookie(page){
    await page.locator('#truste-consent-button').click({timeout:2000}).catch(error => {
        console.log("not exist cookie"); 
    });
    await page.locator('//*[@id="ins-editable-button-1580496494"]').click({timeout:2000}).catch(error => {
        console.log("not exist cookie2"); 
    });
    await page.locator('//*[@id="header"]/div[2]/div/div/div[2]/a').click({timeout:2000}).catch(error => {
        console.log("not exist cookie3"); 
    });
}   
async function expendAll(page){
    try{
        
    await page.evaluate(()=>{
        let elements = document.querySelectorAll("div")
        for(let el of elements){
            if(el.getAttribute("style")=="width: 100%; height: 0px; opacity: 0;"){
                el.setAttribute("style","width: 100%; height: auto; opacity: 1;")
            }
            else{
                console.log("?");
            }
        }
        //ref: https://www.samsung.com/uk/support/product-help/tv-and-audio-visual/ tabs
        elements = document.querySelectorAll("[id='content'] div[id*='-tabs']");
        for(let e of elements){
            e.style="display: block;";
        }
        
        elements = document.querySelectorAll("div[class*='accordion-faqs__contents']");
        for(let e of elements){
            e.style="display: block;";
        }

        //mktpd
        elements = document.querySelectorAll("div[class*='eco-popup ']");
        for(let e of elements){
            e.style="display: block;";
        }
        //mktpd
        elements = document.querySelectorAll("div[class='faq_item_a']");
        for(let e of elements){
            e.style="display: block;";
        }
        //mktpd
        elements = document.querySelectorAll("div[class='dropdown_item_a']");
        for(let e of elements){
            e.style="display: block;";
        }
        //새창 -> 현재창으로
        elements = document.querySelectorAll("a[target='_blank']");
        for(let e of elements){
            e.target = "_self";
        }
        
    })

    }catch(e){
        console.log("expendAll Error")
    }


}

export { clickItem,expendAll,clickCookie};
