function main() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time. 
   */


  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  var curVidEl=null;
  var outVidEl=null;
  var curEl=null;
  var dmn=null;  

  /*-----------------------------------------------------------------------
  pre: none
  post: none
  determines if trgt is a video and return if it is. If it's not, check to see if it's an iframe
  if it's an iframe try to find the first visible video and return that.
  All other cases return null;
  -----------------------------------------------------------------------*/
  function seekVidEl(trgt){
    if(!trgt||typeof trgt!="object"){
    return null;
    }

    if(trgt.tagName.toLocaleLowerCase()=="video"){
    return trgt;
    }

    //check previous and next sibling
    if(trgt.previousElementSibling && trgt.previousElementSibling.tagName.toLocaleLowerCase()=="video"){
    return trgt.previousElementSibling;
    }

    if(trgt.nextElementSibling&&trgt.nextElementSibling.tagName.toLocaleLowerCase()=="video"){
    return trgt.nextElementSibling;
    }


    if(trgt.tagName.toLocaleLowerCase()!="iframe"){
    return null;
    }
   
  var el=null;
    
    if(!trgt.contentDocument||!trgt.contentDocument.body){
    return null;
    }

    el=trgt.contentDocument.body;
    
  var obj=el.getElementsByTagName("video");
  var m=obj.length;
    for(let i=0;i<m;i++){
      if(obj[i].style.display&&obj[i].style.display!="none"){
      return obj[i];
      }
    }

  return null;
  }


  /*-----------------------------------------------
  pre: none
  post: none
  function to skip video to the end
  -----------------------------------------------*/
  function skipVidToEnd(){
    if(curVidEl){
    console.log("ButWhyMod: Video duraction: "+curVidEl.duration);
      if(curVidEl.duration<=Number.MAX_SAFE_INTEGER&&curVidEl.duration>=0){
      curVidEl.currentTime=curVidEl.duration;
      }
      else{
      curVidEl.currentTime=Number.MAX_SAFE_INTEGER;
      }
    curVidEl.dispatchEvent(new Event("ended"));
    }
  }

  /*---------------------------------------------------------
  pre: curVidEl existing
  post: addes keydown listener
  adds bettervideo control so you can do things like advance by
  a second or even 0.03 of a second.
  ---------------------------------------------------------*/
  function betterVidCntrl(){
    window.addEventListener("keydown", function(e){

      if(curVidEl&&curVidEl!=outVidEl){
      var time=0;
      time+=e.ctrlKey?1:0;
      time+=e.altKey?0.03:0;
      time+=e.shiftKey?20:0;
      var vol=0;
      let tmpVol=0;
      vol+=e.ctrlKey?0.05:0;
      vol+=e.altKey?0.01:0;
      vol+=e.shiftKey?0.2:0;
        if(time>0&&(e.key=="ArrowLeft"||e.key=="ArrowRight")){
        e.preventDefault();
          switch(e.key){
            case "ArrowLeft":
              curVidEl.currentTime-=time;
            break;
            case "ArrowRight":
              curVidEl.currentTime+=time;
            break;
            default:
            break;
          }
        }
        else if(vol>0&&(e.key=="ArrowUp"||e.key=="ArrowDown")){
        e.preventDefault();
          switch(e.key){
            case "ArrowUp":
              tmpVol=curVidEl.volume;
              tmpVol+=vol;
              curVidEl.volume=tmpVol>1?1:tmpVol;
            break;
            case "ArrowDown":
              tmpVol=curVidEl.volume;
              tmpVol-=vol;
              curVidEl.volume=tmpVol<=0?0:tmpVol;
            break;
            default:
            break;
          }
        } 
      }
    },{capture: true, passive: false});

    window.addEventListener("wheel", function(e){
      if(curVidEl&&curVidEl!=outVidEl){
      let volDelta=e.deltaY/5000;
      let tmpVol=curVidEl.volume;
        if(e.deltaY!=0){
        e.preventDefault();
          if(e.deltaY>0){
          tmpVol-=volDelta;
          curVidEl.volume=tmpVol<0?0:tmpVol;
          }
          else if(e.deltaY<0){
          tmpVol-=volDelta;
          curVidEl.volume=tmpVol>1?1:tmpVol;
          }
        }
      }
    },{capture: true, passive: false});
  }

  /*-----------------------------------------------
  pre: global var curVidEl, curEl and dmn
  post:
  evalutes as to what actions to do for the video stuff
  -----------------------------------------------*/
  function videoCntrls(){
  var sty=document.createElement("style");
  sty.type="text/css";
  sty.className="extIdNmVSModSkipEl";
  sty.textContent="@keyframes extIdNmVSModSkipElAni{0%{opacity:1;}100%{opacity:0;}}";
  sty.id=sty.className;

  var el=document.createElement("div");
  el.style.cssText="position:absolute;color:#B4B4B4;background-color:rgba(0,0,0,0.6);border-radius:0px 4px 4px 0px;padding:6px 14px 6px 14px;font-weight:800;font-size:larger;z-index:999999;cursor:pointer;animation: extIdNmVSModSkipElAni 1.5s ease-in-out 3.5s forwards;";
  el.id="vidscotchSkipEndEl";
  el.innerText="SKIP";
  el.vsAct="skipVid";

  el.onanimationend=(e)=>{
    document.body.removeChild(el);
    document.head.removeChild(sty);
    };


  betterVidCntrl();
    document.addEventListener("click", (e)=>{
      if(e.target.hasOwnProperty("vsAct")){
        switch(e.target.vsAct){
          case el.vsAct:
          skipVidToEnd();
          break;
          default:
          break;
        }
      }
    });

  var on=null;

    document.addEventListener("mouseover", (e)=>{
      on=seekVidEl(e.target);
      //if target is a video or the el element, add and/or reposition the el element
      if(on||e.target.id==el.id){

      //setting global var curVidEl to current video element so other functions can find/control it
      curVidEl=on?on:curVidEl;
      outVidEl=null;

      //setting global var curEl to current element so other function can find/control it
      curEl=e.target;

      //restoring play functionality if it's been disabled by stopVideoPlay()
      //resumeVideoPlay();

        if(!document.getElementById(el.id)){
        //console.log("adding element");
        document.head.appendChild(sty);
        document.body.appendChild(el);
        }
     
        if(on){ 
        var pos=curEl.getBoundingClientRect();
        /*
        removing this for now until I see a real world example for it
        because there's no good way to communicate that the video element returned from seekVidEl is from within an iframe 
        var subPos={x:0,y:0};
          //the video could be in an iframe. If so, look for the video
          if(curEl.tagName.toLocaleLowerCase()=="iframe"){
          subPos=on.getBoundingClientRect();
          }
        el.style.left=window.scrollX+pos.x+subPos.x+"px";
        el.style.top=window.scrollY+pos.y+subPos.y+"px";
        */
        el.style.left=window.scrollX+pos.x+"px";
        el.style.top=window.scrollY+pos.y+Math.floor(pos.height/4)+"px";
        //console.log(pos.x+", "+pos.y);
        //console.log(el.style.left+", "+el.style.top);
        }
      }
      else{
        if(e.target&&e.target.id!=el.id&&document.getElementById(el.id)){
          try{
          document.body.removeChild(el);
          document.head.removeChild(sty);
          }
          catch(e){
          console.log("vidscotch: Unable to remove skip button. This is okay: "+e);
          }
        }
      }
    });

    //whether or not you've moused out of that video. Used for betterVidCntrls()
    document.addEventListener("mouseout",(e)=>{
    on=seekVidEl(e.target);
      if(on||e.target.id==el.id){
      outVidEl=on;
      }
    }); 

    //adjust el when window resizes
    window.addEventListener("resize",(e)=>{
      if(document.getElementById(el.id)){
      var pos=curEl.getBoundingClientRect();
      var subPos={x:0,y:0};

      /*removing iframe video position until I a real world example of it
        //the video could be in an iframe. If so, look for the video
        if(curEl.tagName.toLocaleLowerCase()=="iframe"){
        subPos=on.getBoundingClientRect();
        }
      el.style.left=window.scrollX+pos.x+subPos.x+"px";
      el.style.top=window.scrollY+pos.y+subPos.y+"px";
      */

      el.style.left=window.scrollX+pos.x+"px";
      el.style.top=window.scrollY+pos.y+Math.floor(pos.height/4)+"px";
      }
    });
  }
videoCntrls();
}

main();
