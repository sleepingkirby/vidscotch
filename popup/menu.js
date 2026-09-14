const cssDflt="./menu.css";
const cssLght="./menulight.css";
const chckbxHd='vid';


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
pre: chckbxHd
post: none
creates new checkbox element and it's label
param: obj={id, name, muted, paused, volume}, type=muted|paused|volume
---------------------------------------------------------------------*/
function newChckbx(obj=null, num, type=null, nm){
const hd="vid";
  if(!obj||typeof obj!="object"||Object.keys(obj).length<=0||!type){
  return null;
  }
let chckbx=null;
const id=`${hd}scotch-num-${num}-${type}`;
const cn="tgglBtn";
chckbx=document.createElement('input');
chckbx.type='checkbox';
chckbx.id=id;
chckbx.className=cn;
chckbx.setAttribute(`title`, type);
chckbx.setAttribute(`act`, 'actVid');
chckbx.setAttribute(`${chckbxHd}Num`, num);
chckbx.setAttribute(`${chckbxHd}Id`, obj.id);
chckbx.setAttribute(`${chckbxHd}Name`, obj.name);
chckbx.setAttribute(`${chckbxHd}Act`, type);
chckbx.title=type;
chckbx.checked=obj[type];

let lbl=document.createElement('label');
lbl.className=cn;
lbl.title=type;
lbl.setAttribute('for',id);
lbl.innerText=nm;

let rtrn=document.createElement('div');
rtrn.className=cn;
rtrn.appendChild(chckbx);
rtrn.appendChild(lbl);

return rtrn;
}

/*---------------------------------------------------------------------
pre: newChckbx()
post: none
---------------------------------------------------------------------*/
function vidCntrlDiv(obj, num){
  if(!obj||!num){
  return null;
  }
//outer wrapper
let tmpEl=document.createElement('div');
tmpEl.setAttribute('vidId',num);
tmpEl.title=`num: ${num}, id: ${obj.id||"none"}, name: ${obj.name||"none"}`;
tmpEl.className='vidCntrl';
//video id attempt
let inEl=document.createElement('div');
let str=`VidNum ${num}`;
  if(obj.id){
  str+=`, id: ${obj.id}`;
  }
  if(obj.name){
  str+=`, name: ${obj.name}`;
  }
inEl.innerText=str;
inEl.className=`vidCntrlLbl`;
tmpEl.appendChild(inEl);
//play checkbox
//make function to make checkbox
const props=['muted','paused','highlight','bringfront'];
const nmHsh={'muted':'M', 'paused':'P', 'highlight':'HL', 'bringfront':'F'};
  for(let p of props){
  tmpEl.appendChild(newChckbx(obj, num, p, nmHsh[p]));
  }

return tmpEl;
}



/*---------------------------------------------------------------------
pre: none 
post: none
clears video list 
---------------------------------------------------------------------*/
function clrVidLst(){
document.getElementById('vidList').innerHTML="";
  browser.storage.local.get((d)=>{
    d['vidLst']=null;
    browser.storage.local.set(d);
  }); 
}

/*---------------------------------------------------------------------
pre: none 
post: none
---------------------------------------------------------------------*/
function listVids(){
  browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {action: 'loadVids', msg:{val:true}});
    document.getElementById('vidList').style.display='flex';
  });
}



/*---------------------------------------------------------------------
pre: none 
post: updates browser.storage.local
function to set up listeners for events.
---------------------------------------------------------------------*/
function startListen(){
let act=null;
let vidNum=null;
let vidId=null;
let vidAct=null;
let vidActVal=null;
  document.addEventListener("click", (e) => {
  act=e.target.getAttribute("act");
    switch(act){
      case 'loadVids':
      listVids();
      break;
      case 'actVid':
      vidNum=e.target.getAttribute("vidNum")?e.target.getAttribute("vidNum"):null;
      vidId=e.target.getAttribute("vidId")?e.target.getAttribute("vidId"):null;
      vidAct=e.target.getAttribute("vidAct")?e.target.getAttribute("vidAct"):null;
        if(vidNum&&vidAct){
        vidActVal=e.target.getAttribute("vidActVal")?e.target.getAttribute("vidActVal"):null;
        let val=null;
          if(e.target.type=='checkbox'){
          val=e.target.checked;
          }
          else{
          val=e.target.value;
          }
          browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, {action: 'actVid', msg:{num: vidNum, id: vidId, act: act, vidAct:vidAct, val:val}}).then((respns)=>{
            //console.log(respns);
            });
          });
        }
      break;
      case 'settingsPage':
      browser.runtime.openOptionsPage(); 
      default:
      break;
    }
  });

/*the video list div refreshes when the popup gets recalled. No need for this.
  //if active tab changes, clear the video list
  browser.tabs.onActivated.addListener((info)=>{
  clrVidLst();
  });

  //if page reloads, clear the video list
  browser.tabs.onUpdated.addListener((info)=>{
  clrVidLst();
  });
*/

  //because apparently storage is async and the messaging method doesn't stay open long enough to pass something back nor does respond late enough to get the update from storage
  //this makes the text area update when there's a new value
  browser.storage.onChanged.addListener(function(changes,namespace){
    if(changes.hasOwnProperty('vidLst')&&changes['vidLst'].newValue){
    //populate list
      browser.storage.local.get('vidLst').then((d)=>{
        for(let vidI in d.vidLst){
        let tmpEl=vidCntrlDiv(d.vidLst[vidI], vidI);
        let el=document.getElementById('vidList');
        el.innerHTML='';
        el.appendChild(tmpEl);
        }
      });
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
