const cssDflt="./menu.css";
const cssLght="./menulight.css";

function reportErr(error){
console.error('' + error.message);
}

function onError(item){
console.log("Error: " + error);
var notif=document.getElementsByClassName('notify')[0];

}

function doNothing(item, err){

}


/*---------------------------------------------------------------------
pre: none 
post: updates browser.storage.local
function to set up listeners for events.
---------------------------------------------------------------------*/
function startListen(){
let act=null;
let id=null;
let vidAct=null;
let vidActVal=null;
  document.addEventListener("click", (e) => {
  act=e.target.getAttribute("act");
    switch(act){
      case 'loadVids':
      browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {action: 'loadVids', msg:{val:true}});
      });
      break;
      case 'actVid':
      id=e.target.getAttribute("vidId")?e.target.getAttribute("vidId"):null;
      vidAct=e.target.getAttribute("vidAct")?e.target.getAttribute("vidAct"):null;
        if(id&&vidAct){
        vidActVal=e.target.getAttribute("vidActVal")?e.target.getAttribute("vidActVal"):null;
          browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, {action: 'actVid', msg:{id: id, act: vidAct, val:vidActVal}});
          });
        }
      break;
      case 'settingsPage':
      browser.runtime.openOptionsPage(); 
      default:
      break;
    }
  });
}

function browserSendMsgErrHndl(action, tabs){
  if(browser.runtime.lastError){
  console.log("Vidscotch: Received the following error: \n\n"+browser.runtime.lastError.message+"\n\nTrying to send a \""+action+"\" to\ntab: "+tabs[0].id+"\ntitled: \""+tabs[0].title+"\"\nurl: \""+tabs[0].url+"\"");
  }
}


//================================ main ==========================

startListen();
