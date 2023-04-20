
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

export {setRow};